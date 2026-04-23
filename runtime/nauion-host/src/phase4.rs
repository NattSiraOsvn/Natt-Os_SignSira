//! PHASE 4 — Kernel boot + HTTP /health endpoint + SIGINT graceful shutdown.
//!
//! Per `nattos.sira` PHASE 4 spec (lines 309-401).
//!
//! ## Adaptation Node → Rust:
//! - Node `http.createServer` → tokio TcpListener + minimal HTTP/1.1 parser
//! - Node `await import('./cells/...')` → skeleton log "would bootstrap X"
//!   (full cell logic phiên sau khi observation-cell + quantum-defense-cell
//!   có Rust port executable)
//! - Node `process.on('SIGINT')` → tokio::signal::ctrl_c()
//!
//! ## /health response JSON:
//! ```json
//! {
//!   "status": "alive",
//!   "loader": { "method": "Rust FileResolver", "esbuild": "fallback" },
//!   "cells": ["observation-cell", "quantum-defense-cell"],
//!   "resolution": { "native": 0, "bridged": 0, "legacy": 0 },
//!   "chromatic_wire": "active",
//!   "timestamp": "2026-04-24T..."
//! }
//! ```

use crate::phase1::EsbuildStatus;
use crate::phase2::FileResolver;
use chrono::Utc;
use serde::Serialize;
use std::sync::Arc;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;
use tracing::{error, info, warn};

pub const KERNEL_HOST: &str = "127.0.0.1";
pub const KERNEL_PORT: u16 = 3002;

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    loader: LoaderInfo,
    cells: Vec<&'static str>,
    resolution: ResolutionInfo,
    chromatic_wire: &'static str,
    timestamp: String,
}

#[derive(Serialize)]
struct LoaderInfo {
    method: &'static str,
    esbuild: String,
}

#[derive(Serialize)]
struct ResolutionInfo {
    native: u64,
    bridged: u64,
    legacy: u64,
}

pub async fn boot(
    esbuild_status: EsbuildStatus,
    resolver: Arc<FileResolver>,
) -> std::io::Result<()> {
    // Skeleton bootstrap cells (full logic pending Rust port observation + quantum)
    info!(cell = "observation-cell", "would bootstrap (skeleton mode)");
    info!(cell = "quantum-defense-cell", "would bootstrap (skeleton mode)");

    let addr = format!("{}:{}", KERNEL_HOST, KERNEL_PORT);
    let listener = TcpListener::bind(&addr).await?;

    println!();
    println!("[nattos-rust] http://natt.sira:{}", KERNEL_PORT);
    println!("[nattos-rust] health → http://{}/health", addr);
    println!();
    println!("─────────────────────────────────────────────────────────────");
    let snap = resolver.counters().snapshot();
    println!(
        "  Nauion Loader: {} native, {} bridged, {} legacy",
        snap.native, snap.bridged, snap.legacy
    );
    println!("  He mien dich NATT-OS dang song that.");
    println!("  Observation snapshot → chromatic → Quantum Defense react.");
    println!("─────────────────────────────────────────────────────────────");
    println!();

    let esbuild_label = if esbuild_status.available {
        esbuild_status.version.clone().unwrap_or_else(|| "unknown".to_string())
    } else {
        "fallback".to_string()
    };

    let resolver_for_handler = resolver.clone();
    let esbuild_label_for_handler = esbuild_label.clone();

    let server_task = tokio::spawn(async move {
        loop {
            match listener.accept().await {
                Ok((mut stream, peer)) => {
                    let resolver = resolver_for_handler.clone();
                    let esbuild_label = esbuild_label_for_handler.clone();
                    tokio::spawn(async move {
                        if let Err(e) = handle_connection(
                            &mut stream,
                            &resolver,
                            &esbuild_label,
                        ).await {
                            warn!(peer = %peer, error = %e, "connection handler error");
                        }
                    });
                }
                Err(e) => {
                    error!(error = %e, "accept failed");
                    break;
                }
            }
        }
    });

    // Wait SIGINT (Ctrl+C) for graceful shutdown
    tokio::select! {
        _ = tokio::signal::ctrl_c() => {
            info!("SIGINT received — shutting down kernel gracefully");
        }
        _ = server_task => {
            warn!("server task exited unexpectedly");
        }
    }

    println!();
    println!("[nattos-rust] kernel offline");
    Ok(())
}

async fn handle_connection(
    stream: &mut tokio::net::TcpStream,
    resolver: &FileResolver,
    esbuild_label: &str,
) -> std::io::Result<()> {
    let mut buf = [0u8; 1024];
    let n = stream.read(&mut buf).await?;
    let request = String::from_utf8_lossy(&buf[..n]);

    let path = parse_request_path(&request);

    let response = match path.as_deref() {
        Some("/health") => {
            let snap = resolver.counters().snapshot();
            let body = HealthResponse {
                status: "alive",
                loader: LoaderInfo {
                    method: "Rust FileResolver (PHASE 2)",
                    esbuild: esbuild_label.to_string(),
                },
                cells: vec!["observation-cell", "quantum-defense-cell"],
                resolution: ResolutionInfo {
                    native: snap.native,
                    bridged: snap.bridged,
                    legacy: snap.legacy,
                },
                chromatic_wire: "active",
                timestamp: Utc::now().to_rfc3339(),
            };
            let body_json = serde_json::to_string(&body)
                .unwrap_or_else(|_| r#"{"status":"alive"}"#.to_string());
            format!(
                "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
                body_json.len(),
                body_json
            )
        }
        _ => "HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\nConnection: close\r\n\r\n".to_string(),
    };

    stream.write_all(response.as_bytes()).await?;
    stream.flush().await?;
    Ok(())
}

fn parse_request_path(request: &str) -> Option<String> {
    let first_line = request.lines().next()?;
    let mut parts = first_line.split_whitespace();
    let _method = parts.next()?;
    let path = parts.next()?;
    Some(path.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_request_path_get_health() {
        let req = "GET /health HTTP/1.1\r\nHost: 127.0.0.1:3002\r\n\r\n";
        assert_eq!(parse_request_path(req), Some("/health".to_string()));
    }

    #[test]
    fn parse_request_path_unknown() {
        let req = "GET /unknown HTTP/1.1\r\n\r\n";
        assert_eq!(parse_request_path(req), Some("/unknown".to_string()));
    }

    #[test]
    fn parse_request_path_empty_returns_none() {
        assert_eq!(parse_request_path(""), None);
    }

    #[test]
    fn health_response_serializes_ok() {
        let body = HealthResponse {
            status: "alive",
            loader: LoaderInfo {
                method: "Rust FileResolver (PHASE 2)",
                esbuild: "fallback".to_string(),
            },
            cells: vec!["observation-cell", "quantum-defense-cell"],
            resolution: ResolutionInfo {
                native: 5,
                bridged: 3,
                legacy: 2,
            },
            chromatic_wire: "active",
            timestamp: "2026-04-24T03:00:00+00:00".to_string(),
        };
        let json = serde_json::to_string(&body).unwrap();
        assert!(json.contains("\"status\":\"alive\""));
        assert!(json.contains("\"native\":5"));
        assert!(json.contains("\"bridged\":3"));
        assert!(json.contains("\"chromatic_wire\":\"active\""));
    }

    #[test]
    fn kernel_constants_correct() {
        assert_eq!(KERNEL_HOST, "127.0.0.1");
        assert_eq!(KERNEL_PORT, 3002);
    }
}
