//! PHASE 1 — detectEsbuild
//!
//! Per `nattos.sira` self-loader specification.
//!
//! ## Semantic
//! Check if `esbuild` binary is available in PATH. Used as TypeScript/JS
//! transpiler for pre-W1 substrate `.ts` files (per RUNTIME_DEPENDENCY_CENSUS
//! v1.0 §2 bypass points). Wave W1 mature: optional, Rust parser handles
//! `.khai` canonical natively.
//!
//! ## Outcome
//! - Available → log version, set `available=true`
//! - Missing → log warning, set `available=false` (host still runs fallback)
//!
//! ## Per SPEC_HOST_FIRST_RUNTIME v1.1 §0
//! Initial detection only — does NOT invoke esbuild. Invocation deferred to
//! Bridge workers when transpile needed.

use std::process::Command;
use thiserror::Error;
use tracing::{info, warn};

#[derive(Debug, Error)]
pub enum Phase1Error {
    #[error("Failed to invoke esbuild --version: {0}")]
    InvocationFailed(#[from] std::io::Error),
    #[error("esbuild --version returned non-UTF8 output")]
    NonUtf8Output,
}

/// Result of PHASE 1 detection.
#[derive(Debug, Clone)]
pub struct EsbuildStatus {
    pub available: bool,
    pub version: Option<String>,
    pub path: Option<std::path::PathBuf>,
}

impl EsbuildStatus {
    pub fn missing() -> Self {
        Self { available: false, version: None, path: None }
    }
}

/// PHASE 1 entry — detect esbuild availability.
///
/// Returns `EsbuildStatus`. Does NOT error on missing esbuild — that's a
/// valid runtime state (fallback mode). Only errors on actual invocation
/// failures (e.g., binary exists but crashes on `--version`).
pub fn detect_esbuild() -> Result<EsbuildStatus, Phase1Error> {
    info!(phase = 1, "PHASE 1 detectEsbuild — start");

    let path = match which::which("esbuild") {
        Ok(p) => p,
        Err(_) => {
            warn!(
                phase = 1,
                "esbuild not found in PATH — host runs in fallback mode (Rust parser only)"
            );
            return Ok(EsbuildStatus::missing());
        }
    };

    let output = Command::new(&path).arg("--version").output()?;

    if !output.status.success() {
        warn!(
            phase = 1,
            exit_code = ?output.status.code(),
            "esbuild --version returned non-zero — treating as unavailable"
        );
        return Ok(EsbuildStatus::missing());
    }

    let version = String::from_utf8(output.stdout)
        .map_err(|_| Phase1Error::NonUtf8Output)?
        .trim()
        .to_string();

    info!(
        phase = 1,
        version = %version,
        path = %path.display(),
        "PHASE 1 detectEsbuild — found"
    );

    Ok(EsbuildStatus {
        available: true,
        version: Some(version),
        path: Some(path),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn missing_status_constructs_correctly() {
        let s = EsbuildStatus::missing();
        assert!(!s.available);
        assert!(s.version.is_none());
        assert!(s.path.is_none());
    }

    #[test]
    fn detect_esbuild_does_not_panic() {
        // Test runs in any env — should return Ok regardless of esbuild presence
        let result = detect_esbuild();
        assert!(result.is_ok(), "detect_esbuild must not error on missing binary");
    }
}
