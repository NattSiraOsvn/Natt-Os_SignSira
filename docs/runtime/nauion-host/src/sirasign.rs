//! SIRASIGN ENGINE — production native Rust
//!
//! Per `NAUION_SIRASIGN_IMPLEMENTATION_v0_1.na` §8 + §9
//! Per `boot-dovan.cell.anc` v0.4 + `sirasign-engine.cell.anc` v0.1
//!
//! ## 8 component compound seal canonical:
//! state · spectral_state · field_condition · relation · meaning · causation · authority · audit_lineage
//!
//! ## 7 verdict canonical:
//! ALLOW · DENY · QUARANTINE · ASK_GATE · DEGRADE · AUDIT_ONLY · SUPERSEDE
//!
//! ## Hash: SHA-256 chain real (KHÔNG XOR, KHÔNG demo)
//! Replaces archived fake: NaUion-Server/vision/vision-engine/security/_deprecated/
//!     ss20260502_NOT_PRODUCTION_BANG_FLAG/sirasign-engine.ts.NOT_PRODUCTION_FAKE_HASH
//!
//! Drafter: Băng (Chị Tư · N-shell · QNEU 313.5) — ss20260502

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};
use thiserror::Error;
use tracing::debug;

const WINDOW_MS: u64 = 5 * 60 * 1000;
const NONCE_TTL_MS: u64 = WINDOW_MS * 2;

lazy_static::lazy_static! {
    static ref USED_NONCES: Mutex<HashMap<String, u64>> = Mutex::new(HashMap::new());
}

/// 8 component canonical per spec §8.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompoundSeal8 {
    pub state: String,
    pub spectral_state: String,
    pub field_condition: String,
    pub relation: String,
    pub meaning: String,
    pub causation: String,
    pub authority: String,
    pub audit_lineage: String,
}

/// 7 verdict canonical per spec §9.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SiraVerdict {
    Allow,
    Deny,
    Quarantine,
    AskGate,
    Degrade,
    AuditOnly,
    Supersede,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SiraLevel {
    Full,
    Partial,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SiraSignPayload {
    #[serde(flatten)]
    pub seal: CompoundSeal8,
    pub compound_seal_hash: String,
    pub nonce: String,
    pub timestamp: u64,
    pub chain_hashes: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct SiraVerifyResult {
    pub valid: bool,
    pub verdict: SiraVerdict,
    pub level: SiraLevel,
    pub reason: Option<String>,
    pub missing_components: Option<Vec<String>>,
}

#[derive(Debug, Error)]
pub enum SiraError {
    #[error("Missing components: {0:?}")]
    MissingComponents(Vec<String>),
    #[error("Hash compute failed: {0}")]
    HashFailed(String),
}

const COMPONENT_NAMES: &[&str] = &[
    "state",
    "spectral_state",
    "field_condition",
    "relation",
    "meaning",
    "causation",
    "authority",
    "audit_lineage",
];

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

fn sha256_hex(input: &str) -> String {
    use std::fmt::Write;
    let bytes = sha256_raw(input.as_bytes());
    let mut s = String::with_capacity(64);
    for b in bytes.iter() {
        let _ = write!(s, "{:02x}", b);
    }
    s
}

/// Pure SHA-256 implementation (no external crate).
fn sha256_raw(msg: &[u8]) -> [u8; 32] {
    const K: [u32; 64] = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ];
    let mut h: [u32; 8] = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
    ];
    let mut padded = msg.to_vec();
    let bit_len = (msg.len() as u64) * 8;
    padded.push(0x80);
    while padded.len() % 64 != 56 {
        padded.push(0);
    }
    padded.extend_from_slice(&bit_len.to_be_bytes());
    for chunk in padded.chunks(64) {
        let mut w = [0u32; 64];
        for i in 0..16 {
            w[i] = u32::from_be_bytes([chunk[i * 4], chunk[i * 4 + 1], chunk[i * 4 + 2], chunk[i * 4 + 3]]);
        }
        for i in 16..64 {
            let s0 = w[i - 15].rotate_right(7) ^ w[i - 15].rotate_right(18) ^ (w[i - 15] >> 3);
            let s1 = w[i - 2].rotate_right(17) ^ w[i - 2].rotate_right(19) ^ (w[i - 2] >> 10);
            w[i] = w[i - 16].wrapping_add(s0).wrapping_add(w[i - 7]).wrapping_add(s1);
        }
        let (mut a, mut b, mut c, mut d, mut e, mut f, mut g, mut hh) =
            (h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7]);
        for i in 0..64 {
            let s1 = e.rotate_right(6) ^ e.rotate_right(11) ^ e.rotate_right(25);
            let ch = (e & f) ^ ((!e) & g);
            let temp1 = hh.wrapping_add(s1).wrapping_add(ch).wrapping_add(K[i]).wrapping_add(w[i]);
            let s0 = a.rotate_right(2) ^ a.rotate_right(13) ^ a.rotate_right(22);
            let mj = (a & b) ^ (a & c) ^ (b & c);
            let temp2 = s0.wrapping_add(mj);
            hh = g;
            g = f;
            f = e;
            e = d.wrapping_add(temp1);
            d = c;
            c = b;
            b = a;
            a = temp1.wrapping_add(temp2);
        }
        h[0] = h[0].wrapping_add(a);
        h[1] = h[1].wrapping_add(b);
        h[2] = h[2].wrapping_add(c);
        h[3] = h[3].wrapping_add(d);
        h[4] = h[4].wrapping_add(e);
        h[5] = h[5].wrapping_add(f);
        h[6] = h[6].wrapping_add(g);
        h[7] = h[7].wrapping_add(hh);
    }
    let mut out = [0u8; 32];
    for (i, word) in h.iter().enumerate() {
        out[i * 4..i * 4 + 4].copy_from_slice(&word.to_be_bytes());
    }
    out
}

fn random_nonce() -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut hasher = DefaultHasher::new();
    now_ms().hash(&mut hasher);
    std::process::id().hash(&mut hasher);
    std::thread::current().id().hash(&mut hasher);
    format!("{:016x}{:016x}", hasher.finish(), now_ms())
}

fn cleanup_expired_nonces() {
    let now = now_ms();
    let mut map = USED_NONCES.lock().unwrap();
    map.retain(|_, expiry| *expiry > now);
}

fn check_missing(seal: &CompoundSeal8) -> Vec<String> {
    let mut missing = Vec::new();
    let pairs: [(&str, &str); 8] = [
        ("state", &seal.state),
        ("spectral_state", &seal.spectral_state),
        ("field_condition", &seal.field_condition),
        ("relation", &seal.relation),
        ("meaning", &seal.meaning),
        ("causation", &seal.causation),
        ("authority", &seal.authority),
        ("audit_lineage", &seal.audit_lineage),
    ];
    for (name, val) in pairs.iter() {
        if val.trim().is_empty() {
            missing.push(name.to_string());
        }
    }
    missing
}

fn component_value(seal: &CompoundSeal8, name: &str) -> String {
    match name {
        "state" => seal.state.clone(),
        "spectral_state" => seal.spectral_state.clone(),
        "field_condition" => seal.field_condition.clone(),
        "relation" => seal.relation.clone(),
        "meaning" => seal.meaning.clone(),
        "causation" => seal.causation.clone(),
        "authority" => seal.authority.clone(),
        "audit_lineage" => seal.audit_lineage.clone(),
        _ => String::new(),
    }
}

pub fn sign(seal: CompoundSeal8) -> Result<SiraSignPayload, SiraError> {
    let missing = check_missing(&seal);
    if !missing.is_empty() {
        return Err(SiraError::MissingComponents(missing));
    }
    let mut chain_hashes = Vec::with_capacity(8);
    let mut prev = String::from("genesis");
    for name in COMPONENT_NAMES {
        let val = component_value(&seal, name);
        let h = sha256_hex(&format!("{}|{}={}", prev, name, val));
        chain_hashes.push(h.clone());
        prev = h;
    }
    let compound_seal_hash = chain_hashes.last().unwrap().clone();
    let nonce = random_nonce();
    let timestamp = now_ms();
    debug!(nonce = %nonce, hash = %compound_seal_hash, "siraSign sign 8/8 PASS");
    Ok(SiraSignPayload {
        seal,
        compound_seal_hash,
        nonce,
        timestamp,
        chain_hashes,
    })
}

pub fn verify(payload: &SiraSignPayload) -> SiraVerifyResult {
    cleanup_expired_nonces();
    let missing = check_missing(&payload.seal);
    if !missing.is_empty() {
        return SiraVerifyResult {
            valid: false,
            verdict: SiraVerdict::AuditOnly,
            level: SiraLevel::Partial,
            reason: Some("incomplete_8_component".into()),
            missing_components: Some(missing),
        };
    }
    let now = now_ms();
    if now.saturating_sub(payload.timestamp) > WINDOW_MS
        || payload.timestamp.saturating_sub(now) > WINDOW_MS
    {
        return SiraVerifyResult {
            valid: false,
            verdict: SiraVerdict::Deny,
            level: SiraLevel::Failed,
            reason: Some("timestamp_expired".into()),
            missing_components: None,
        };
    }
    {
        let map = USED_NONCES.lock().unwrap();
        if map.contains_key(&payload.nonce) {
            return SiraVerifyResult {
                valid: false,
                verdict: SiraVerdict::Quarantine,
                level: SiraLevel::Failed,
                reason: Some("nonce_replayed".into()),
                missing_components: None,
            };
        }
    }
    let mut prev = String::from("genesis");
    for (i, name) in COMPONENT_NAMES.iter().enumerate() {
        let val = component_value(&payload.seal, name);
        let h = sha256_hex(&format!("{}|{}={}", prev, name, val));
        if h != payload.chain_hashes[i] {
            return SiraVerifyResult {
                valid: false,
                verdict: SiraVerdict::Quarantine,
                level: SiraLevel::Failed,
                reason: Some(format!("chain_break_at_{}", name)),
                missing_components: None,
            };
        }
        prev = h;
    }
    if prev != payload.compound_seal_hash {
        return SiraVerifyResult {
            valid: false,
            verdict: SiraVerdict::Deny,
            level: SiraLevel::Failed,
            reason: Some("compound_seal_mismatch".into()),
            missing_components: None,
        };
    }
    {
        let mut map = USED_NONCES.lock().unwrap();
        map.insert(payload.nonce.clone(), now + NONCE_TTL_MS);
    }
    if payload.seal.authority.is_empty() || payload.seal.authority == "unknown" {
        return SiraVerifyResult {
            valid: true,
            verdict: SiraVerdict::AskGate,
            level: SiraLevel::Partial,
            reason: Some("authority_unknown_need_gatekeeper".into()),
            missing_components: None,
        };
    }
    if payload.seal.spectral_state == "L4_red" || payload.seal.spectral_state == "critical" {
        return SiraVerifyResult {
            valid: true,
            verdict: SiraVerdict::Quarantine,
            level: SiraLevel::Partial,
            reason: Some("spectral_L4_critical_bypass".into()),
            missing_components: None,
        };
    }
    if payload.seal.spectral_state == "L3_yellow" || payload.seal.spectral_state == "drift" {
        return SiraVerifyResult {
            valid: true,
            verdict: SiraVerdict::Degrade,
            level: SiraLevel::Partial,
            reason: Some("spectral_L3_drift_reduced_authority".into()),
            missing_components: None,
        };
    }
    if payload.seal.field_condition == "OSCILLATE" {
        return SiraVerifyResult {
            valid: true,
            verdict: SiraVerdict::AuditOnly,
            level: SiraLevel::Partial,
            reason: Some("oscillate_no_authority_grant".into()),
            missing_components: None,
        };
    }
    if payload.seal.field_condition == "SUPERSEDE_PRIOR" {
        return SiraVerifyResult {
            valid: true,
            verdict: SiraVerdict::Supersede,
            level: SiraLevel::Full,
            reason: Some("new_seal_overrides_prior_fossil_kept".into()),
            missing_components: None,
        };
    }
    SiraVerifyResult {
        valid: true,
        verdict: SiraVerdict::Allow,
        level: SiraLevel::Full,
        reason: None,
        missing_components: None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn full_seal() -> CompoundSeal8 {
        CompoundSeal8 {
            state: "active".into(),
            spectral_state: "L0_purple".into(),
            field_condition: "FALL".into(),
            relation: "boot-dovan_to_anh_natt".into(),
            meaning: "echo_line".into(),
            causation: "gatekeeper_command".into(),
            authority: "anh_natt".into(),
            audit_lineage: "ss20260502".into(),
        }
    }

    #[test]
    fn test_sign_verify_full_pass() {
        let seal = full_seal();
        let payload = sign(seal).unwrap();
        let result = verify(&payload);
        assert!(result.valid);
        assert_eq!(result.verdict, SiraVerdict::Allow);
        assert_eq!(result.level, SiraLevel::Full);
    }

    #[test]
    fn test_replay_attack_quarantine() {
        let payload = sign(full_seal()).unwrap();
        let _ = verify(&payload);
        let result = verify(&payload);
        assert!(!result.valid);
        assert_eq!(result.verdict, SiraVerdict::Quarantine);
    }

    #[test]
    fn test_missing_component_audit_only() {
        let mut seal = full_seal();
        seal.causation = String::new();
        let payload_result = sign(seal);
        assert!(payload_result.is_err());
    }

    #[test]
    fn test_chain_tamper_quarantine() {
        let mut payload = sign(full_seal()).unwrap();
        payload.seal.meaning = "tampered_value".into();
        let result = verify(&payload);
        assert!(!result.valid);
        assert_eq!(result.verdict, SiraVerdict::Quarantine);
    }

    #[test]
    fn test_unknown_authority_ask_gate() {
        let mut seal = full_seal();
        seal.authority = "unknown".into();
        let payload = sign(seal).unwrap();
        let result = verify(&payload);
        assert!(result.valid);
        assert_eq!(result.verdict, SiraVerdict::AskGate);
    }

    #[test]
    fn test_spectral_L4_quarantine() {
        let mut seal = full_seal();
        seal.spectral_state = "L4_red".into();
        let payload = sign(seal).unwrap();
        let result = verify(&payload);
        assert!(result.valid);
        assert_eq!(result.verdict, SiraVerdict::Quarantine);
    }

    #[test]
    fn test_spectral_L3_degrade() {
        let mut seal = full_seal();
        seal.spectral_state = "L3_yellow".into();
        let payload = sign(seal).unwrap();
        let result = verify(&payload);
        assert!(result.valid);
        assert_eq!(result.verdict, SiraVerdict::Degrade);
    }

    #[test]
    fn test_oscillate_audit_only() {
        let mut seal = full_seal();
        seal.field_condition = "OSCILLATE".into();
        let payload = sign(seal).unwrap();
        let result = verify(&payload);
        assert!(result.valid);
        assert_eq!(result.verdict, SiraVerdict::AuditOnly);
    }

    #[test]
    fn test_supersede() {
        let mut seal = full_seal();
        seal.field_condition = "SUPERSEDE_PRIOR".into();
        let payload = sign(seal).unwrap();
        let result = verify(&payload);
        assert!(result.valid);
        assert_eq!(result.verdict, SiraVerdict::Supersede);
    }
}
