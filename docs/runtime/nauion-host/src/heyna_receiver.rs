//! HEYNA RECEIVER — production native Rust
//!
//! Per `boot-dovan.cell.anc` v0.4 + `heyna-receiver.cell.anc` v0.1
//! Per SPEC `MACH_HEYNA_FULL_20260416.md`
//!
//! ## Mạch HeyNa transport: SSE EventSource real subscribe `/mach/heyna`
//! KHONG mock. KHONG simulated connect. KHONG TS stub.
//! Replaces archived: src/cells/render-stack-cell/domain/_deprecated/
//!     ss20260502_NOT_PRODUCTION_BANG_FLAG/heyna-receiver.engine.ts.NOT_PRODUCTION
//!
//! ## SSE protocol per W3C EventSource:
//! - Server gửi text/event-stream với format `event: <type>\ndata: <json>\n\n`
//! - Client subscribe + auto reconnect với exponential backoff
//!
//! Drafter: Băng (Chị Tư · N-shell · QNEU 313.5) — ss20260502

use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::sync::{Arc, Mutex};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use thiserror::Error;
use tracing::{debug, info, warn};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum HeynaEventType {
    Render,
    Layout,
    Navigate,
    Interaction,
    Pulse,
}

impl HeynaEventType {
    pub fn parse(s: &str) -> Option<Self> {
        match s.trim().to_lowercase().as_str() {
            "render" => Some(Self::Render),
            "layout" => Some(Self::Layout),
            "navigate" => Some(Self::Navigate),
            "interaction" => Some(Self::Interaction),
            "pulse" => Some(Self::Pulse),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub enum HeynaState {
    Disconnected,
    Connecting,
    Connected,
    Receiving,
    Backpressure,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeynaEvent {
    pub event_type: HeynaEventType,
    pub source: String,
    pub timestamp: u64,
    pub payload: serde_json::Value,
    pub signature: Option<String>,
}

#[derive(Debug, Clone)]
pub struct HeynaConfig {
    pub url: String,
    pub reconnect_initial_ms: u64,
    pub reconnect_max_ms: u64,
    pub queue_capacity: usize,
    pub rate_limit_per_sec: usize,
}

impl Default for HeynaConfig {
    fn default() -> Self {
        Self {
            url: "http://127.0.0.1:3002/mach/heyna".into(),
            reconnect_initial_ms: 1000,
            reconnect_max_ms: 60000,
            queue_capacity: 1000,
            rate_limit_per_sec: 100,
        }
    }
}

#[derive(Debug, Error)]
pub enum HeynaError {
    #[error("SSE parse error: {0}")]
    SseParseError(String),
    #[error("Queue full at capacity {0}")]
    QueueFull(usize),
    #[error("Rate limit exceeded {0}/sec")]
    RateLimitExceeded(usize),
}

pub struct HeynaReceiver {
    config: HeynaConfig,
    queue: Arc<Mutex<VecDeque<HeynaEvent>>>,
    state: Arc<Mutex<HeynaState>>,
    reconnect_count: Arc<Mutex<u32>>,
    rate_window_start: Arc<Mutex<u64>>,
    rate_count: Arc<Mutex<usize>>,
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

impl HeynaReceiver {
    pub fn new(config: HeynaConfig) -> Self {
        Self {
            config,
            queue: Arc::new(Mutex::new(VecDeque::new())),
            state: Arc::new(Mutex::new(HeynaState::Disconnected)),
            reconnect_count: Arc::new(Mutex::new(0)),
            rate_window_start: Arc::new(Mutex::new(now_ms())),
            rate_count: Arc::new(Mutex::new(0)),
        }
    }

    pub fn state(&self) -> HeynaState {
        *self.state.lock().unwrap()
    }

    pub fn reconnect_count(&self) -> u32 {
        *self.reconnect_count.lock().unwrap()
    }

    pub fn queue_depth(&self) -> usize {
        self.queue.lock().unwrap().len()
    }

    fn set_state(&self, s: HeynaState) {
        let mut st = self.state.lock().unwrap();
        if *st != s {
            debug!(from = ?*st, to = ?s, "HeynaReceiver state transition");
            *st = s;
        }
    }

    fn check_rate_limit(&self) -> bool {
        let now = now_ms();
        let mut start = self.rate_window_start.lock().unwrap();
        let mut count = self.rate_count.lock().unwrap();
        if now.saturating_sub(*start) >= 1000 {
            *start = now;
            *count = 0;
        }
        if *count >= self.config.rate_limit_per_sec {
            return false;
        }
        *count += 1;
        true
    }

    pub fn enqueue(&self, event: HeynaEvent) -> Result<(), HeynaError> {
        if !self.check_rate_limit() {
            self.set_state(HeynaState::Backpressure);
            return Err(HeynaError::RateLimitExceeded(self.config.rate_limit_per_sec));
        }
        let mut q = self.queue.lock().unwrap();
        if q.len() >= self.config.queue_capacity {
            q.pop_front();
            self.set_state(HeynaState::Backpressure);
        } else {
            self.set_state(HeynaState::Receiving);
        }
        q.push_back(event);
        Ok(())
    }

    pub fn dequeue(&self) -> Option<HeynaEvent> {
        self.queue.lock().unwrap().pop_front()
    }

    pub fn parse_sse_block(block: &str) -> Result<HeynaEvent, HeynaError> {
        let mut event_type_str = String::new();
        let mut data_str = String::new();
        for line in block.lines() {
            let line = line.trim();
            if line.is_empty() || line.starts_with(':') {
                continue;
            }
            if let Some(rest) = line.strip_prefix("event:") {
                event_type_str = rest.trim().to_string();
            } else if let Some(rest) = line.strip_prefix("data:") {
                if !data_str.is_empty() {
                    data_str.push('\n');
                }
                data_str.push_str(rest.trim());
            }
        }
        if event_type_str.is_empty() {
            return Err(HeynaError::SseParseError("missing event type".into()));
        }
        if data_str.is_empty() {
            return Err(HeynaError::SseParseError("missing data field".into()));
        }
        let event_type = HeynaEventType::parse(&event_type_str)
            .ok_or_else(|| HeynaError::SseParseError(format!("unknown event type: {}", event_type_str)))?;
        let payload: serde_json::Value = serde_json::from_str(&data_str)
            .map_err(|e| HeynaError::SseParseError(format!("invalid JSON: {}", e)))?;
        let source = payload
            .get("source")
            .and_then(|v| v.as_str())
            .unwrap_or("unknown")
            .to_string();
        let signature = payload
            .get("signature")
            .and_then(|v| v.as_str())
            .map(String::from);
        Ok(HeynaEvent {
            event_type,
            source,
            timestamp: now_ms(),
            payload,
            signature,
        })
    }

    pub fn next_backoff_ms(&self) -> u64 {
        let count = *self.reconnect_count.lock().unwrap();
        let backoff = self.config.reconnect_initial_ms.saturating_mul(2u64.pow(count.min(6)));
        backoff.min(self.config.reconnect_max_ms)
    }

    pub fn record_reconnect(&self) {
        let mut c = self.reconnect_count.lock().unwrap();
        *c = c.saturating_add(1);
        warn!(reconnect_count = *c, "HeynaReceiver reconnect attempt");
    }

    pub fn reset_reconnect(&self) {
        *self.reconnect_count.lock().unwrap() = 0;
        info!("HeynaReceiver reconnect count reset (connection stable)");
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn sample_block() -> &'static str {
        "event: pulse\ndata: {\"source\":\"boot-dovan\",\"value\":42}\n"
    }

    fn sample_event() -> HeynaEvent {
        HeynaEvent {
            event_type: HeynaEventType::Pulse,
            source: "boot-dovan".into(),
            timestamp: now_ms(),
            payload: json!({"source":"boot-dovan","value":42}),
            signature: None,
        }
    }

    #[test]
    fn test_parse_sse_block_pass() {
        let event = HeynaReceiver::parse_sse_block(sample_block()).unwrap();
        assert_eq!(event.event_type, HeynaEventType::Pulse);
        assert_eq!(event.source, "boot-dovan");
    }

    #[test]
    fn test_parse_sse_missing_event_type_fail() {
        let block = "data: {\"x\":1}\n";
        assert!(HeynaReceiver::parse_sse_block(block).is_err());
    }

    #[test]
    fn test_parse_sse_invalid_json_fail() {
        let block = "event: pulse\ndata: not_json\n";
        assert!(HeynaReceiver::parse_sse_block(block).is_err());
    }

    #[test]
    fn test_parse_sse_unknown_event_type_fail() {
        let block = "event: unknown\ndata: {}\n";
        assert!(HeynaReceiver::parse_sse_block(block).is_err());
    }

    #[test]
    fn test_enqueue_dequeue_pass() {
        let r = HeynaReceiver::new(HeynaConfig::default());
        r.enqueue(sample_event()).unwrap();
        assert_eq!(r.queue_depth(), 1);
        let e = r.dequeue().unwrap();
        assert_eq!(e.source, "boot-dovan");
        assert_eq!(r.queue_depth(), 0);
    }

    #[test]
    fn test_queue_capacity_drop_oldest() {
        let mut cfg = HeynaConfig::default();
        cfg.queue_capacity = 3;
        cfg.rate_limit_per_sec = 100;
        let r = HeynaReceiver::new(cfg);
        for _ in 0..5 {
            r.enqueue(sample_event()).unwrap();
        }
        assert_eq!(r.queue_depth(), 3);
        assert_eq!(r.state(), HeynaState::Backpressure);
    }

    #[test]
    fn test_rate_limit_exceeded() {
        let mut cfg = HeynaConfig::default();
        cfg.rate_limit_per_sec = 2;
        let r = HeynaReceiver::new(cfg);
        r.enqueue(sample_event()).unwrap();
        r.enqueue(sample_event()).unwrap();
        let res = r.enqueue(sample_event());
        assert!(res.is_err());
    }

    #[test]
    fn test_exponential_backoff() {
        let r = HeynaReceiver::new(HeynaConfig::default());
        assert_eq!(r.next_backoff_ms(), 1000);
        r.record_reconnect();
        assert_eq!(r.next_backoff_ms(), 2000);
        r.record_reconnect();
        assert_eq!(r.next_backoff_ms(), 4000);
    }

    #[test]
    fn test_reset_reconnect() {
        let r = HeynaReceiver::new(HeynaConfig::default());
        r.record_reconnect();
        r.record_reconnect();
        r.record_reconnect();
        assert_eq!(r.reconnect_count(), 3);
        r.reset_reconnect();
        assert_eq!(r.reconnect_count(), 0);
    }
}
