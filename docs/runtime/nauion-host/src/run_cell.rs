// runtime/nauion-host/src/run_cell.rs
// W2C — --run-cell <canonical.khai> CLI native path (wrapper mode)
// Per SPEC_HOST_RESULT_PROTOCOL_v1.0 §8 W2C
// Drafter: Băng (Chị Tư · N-shell · QNEU 313.5 · Phan Thanh Băng ⓝ)

//! Wrapper-mode run-cell executor.
//!
//! Resolves canonical `.khai` → swaps extension to `.ts` → spawns `npx tsx`
//! → maps stdout JSON output → writes `host-result.phieu`.
//!
//! Per W2 implementation order: W2C wrapper FIRST (defers full Rust port to W2E).
//! `npx tsx` exit code + JSON `{ok, warn, fail, total}` parity với existing
//! TS scanner output format (per nattos.sh §40 line 2218 contract).

use crate::result_writer::{HostResult, HostResultStatus, HostResultWriter};
use chrono::Utc;
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Debug)]
pub enum RunCellError {
    CanonicalNotFound(PathBuf),
    SubstrateNotFound(PathBuf),
    SpawnFailed(String),
    WriterError(String),
}

impl std::fmt::Display for RunCellError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RunCellError::CanonicalNotFound(p) => write!(f, "Canonical not found: {}", p.display()),
            RunCellError::SubstrateNotFound(p) => write!(f, "Substrate sibling .ts not found: {}", p.display()),
            RunCellError::SpawnFailed(s) => write!(f, "Failed to spawn npx tsx: {}", s),
            RunCellError::WriterError(s) => write!(f, "Writer error: {}", s),
        }
    }
}

impl std::error::Error for RunCellError {}

pub struct RunCellOutcome {
    pub status: HostResultStatus,
    pub result_path: PathBuf,
    pub ok: i64,
    pub warn: i64,
    pub fail: i64,
    pub total: i64,
}

/// Resolve substrate sibling: replace `.khai` extension → `.ts`.
/// Per W2C decision (α) — extension swap, not @substrate header parse.
pub fn resolve_substrate(canonical: &Path) -> PathBuf {
    canonical.with_extension("ts")
}

/// Map (exit_code, stdout JSON) → HostResultStatus.
/// Per W2C decision (β) — standard mapping matching nattos.sh §40 contract:
///   exit 0 + {fail:0, warn:0}     → Pass
///   exit 0 + {fail:0, warn:N>0}   → Warn
///   exit 0 + unparseable          → Warn (uncertain, conservative)
///   exit 0 + {fail:N>0}           → Fail
///   exit !=0                      → Fail
pub fn classify_status(exit_code: i32, stdout: &str) -> HostResultStatus {
    if exit_code != 0 {
        return HostResultStatus::Fail;
    }
    let fail = extract_int(stdout, "fail");
    let warn = extract_int(stdout, "warn");
    match (fail, warn) {
        (Some(f), _) if f > 0 => HostResultStatus::Fail,
        (Some(0), Some(w)) if w > 0 => HostResultStatus::Warn,
        (Some(0), Some(0)) => HostResultStatus::Pass,
        (Some(0), None) => HostResultStatus::Pass,
        _ => HostResultStatus::Warn, // unparseable but exit 0 — conservative
    }
}

/// Tiny JSON int extractor — avoid serde_json dep cho 2 fields đơn giản.
/// Pattern `"key"` (with quotes) — không match prefix collision (e.g. "failures").
pub fn extract_int(json: &str, key: &str) -> Option<i64> {
    let pat = format!("\"{}\"", key);
    let idx = json.find(&pat)?;
    let after = &json[idx + pat.len()..];
    let after = after.trim_start_matches(|c: char| c.is_whitespace() || c == ':');
    let end = after
        .find(|c: char| !c.is_ascii_digit() && c != '-')
        .unwrap_or(after.len());
    after[..end].parse::<i64>().ok()
}

/// Execute --run-cell flow: resolve, spawn, classify, write result.
pub fn execute(
    canonical: &Path,
    repo_root: &Path,
    host_version: &str,
    self_test_mode: bool,
) -> Result<RunCellOutcome, RunCellError> {
    // Resolve absolute canonical path
    let canonical_abs = if canonical.is_absolute() {
        canonical.to_path_buf()
    } else {
        repo_root.join(canonical)
    };
    if !canonical_abs.exists() {
        return Err(RunCellError::CanonicalNotFound(canonical_abs));
    }

    // Resolve substrate sibling .ts
    let substrate = resolve_substrate(&canonical_abs);
    if !substrate.exists() {
        return Err(RunCellError::SubstrateNotFound(substrate));
    }

    // Spawn npx tsx <substrate> <repo_root>
    let output = Command::new("npx")
        .arg("tsx")
        .arg(&substrate)
        .arg(repo_root)
        .output()
        .map_err(|e| RunCellError::SpawnFailed(e.to_string()))?;

    let exit_code = output.status.code().unwrap_or(-1);
    let stdout = String::from_utf8_lossy(&output.stdout);
    let status = classify_status(exit_code, &stdout);
    let ok = extract_int(&stdout, "ok").unwrap_or(0);
    let warn_n = extract_int(&stdout, "warn").unwrap_or(0);
    let fail_n = extract_int(&stdout, "fail").unwrap_or(0);
    let total = extract_int(&stdout, "total").unwrap_or(0);

    // Compute relative canonical path for result writer
    let canonical_rel = canonical_abs
        .strip_prefix(repo_root)
        .map(|p| p.to_path_buf())
        .unwrap_or_else(|_| canonical.to_path_buf());

    // Cell name = canonical path without extension
    let cell_name = canonical_rel
        .with_extension("")
        .to_string_lossy()
        .to_string();

    let writer = HostResultWriter::new(repo_root);
    let result = HostResult {
        cell: cell_name,
        canonical: canonical_rel,
        status,
        timestamp: Utc::now(),
        host_version: host_version.to_string(),
        self_test_mode,
    };
    let written = writer
        .write(&result)
        .map_err(|e| RunCellError::WriterError(e.to_string()))?;

    Ok(RunCellOutcome {
        status,
        result_path: written,
        ok,
        warn: warn_n,
        fail: fail_n,
        total,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn resolve_substrate_swaps_khai_to_ts() {
        let s = resolve_substrate(Path::new("src/cells/foo/bar.khai"));
        assert_eq!(s, PathBuf::from("src/cells/foo/bar.ts"));
    }

    #[test]
    fn classify_status_pass() {
        let s = classify_status(0, r#"{"ok":10,"warn":0,"fail":0,"total":10}"#);
        assert_eq!(s, HostResultStatus::Pass);
    }

    #[test]
    fn classify_status_warn_by_count() {
        let s = classify_status(0, r#"{"ok":10,"warn":3,"fail":0,"total":13}"#);
        assert_eq!(s, HostResultStatus::Warn);
    }

    #[test]
    fn classify_status_fail_by_count() {
        let s = classify_status(0, r#"{"ok":5,"warn":0,"fail":2,"total":7}"#);
        assert_eq!(s, HostResultStatus::Fail);
    }

    #[test]
    fn classify_status_fail_by_exit() {
        let s = classify_status(1, "any output");
        assert_eq!(s, HostResultStatus::Fail);
    }

    #[test]
    fn classify_status_warn_when_unparseable_exit_0() {
        let s = classify_status(0, "not json output");
        assert_eq!(s, HostResultStatus::Warn);
    }

    #[test]
    fn extract_int_basic_cases() {
        assert_eq!(extract_int(r#"{"fail":3}"#, "fail"), Some(3));
        assert_eq!(extract_int(r#"{"warn": 0}"#, "warn"), Some(0));
        assert_eq!(extract_int(r#"{"x":1,"fail":42}"#, "fail"), Some(42));
        assert_eq!(extract_int(r#"{"y":99}"#, "fail"), None);
    }

    #[test]
    fn extract_int_does_not_match_prefix_collision() {
        // "failures" should NOT match "fail" search
        assert_eq!(extract_int(r#"{"failures":[],"fail":7}"#, "fail"), Some(7));
    }
}
