// runtime/nauion-host/src/legacy_json.rs
// W2D — --legacy-json bridge for nattos.sh §40 compat
// Per SPEC_HOST_RESULT_PROTOCOL_v1.0 §6 (legacy JSON bridge) + §8 W2D
// Drafter: Băng (Chị Tư · N-shell · QNEU 313.5 · Phan Thanh Băng ⓝ)

//! Legacy JSON output bridge.
//!
//! When `--run-cell <canonical.khai> --legacy-json` flags both present,
//! nauion-host prints stdout JSON with schema matching existing TS scanner
//! output, allowing `nattos.sh §40` to swap `npx tsx VALIDATOR` →
//! `nauion-host --run-cell CANONICAL --legacy-json` WITHOUT changing
//! the python3 JSON parser.
//!
//! ## SPEC §6 schema
//! ```json
//! {"ok":N,"warn":N,"fail":N,"total":N,"status":"pass|warn|fail"}
//! ```
//!
//! ## SPEC §7 stdout discipline exception
//! Writer module never prints stdout (result.phieu is the channel).
//! BUT --legacy-json is user-explicit opt-in CLI flag, separate channel.
//! Both channels active when bridge mode: result.phieu (governance) + stdout (legacy compat).

use crate::result_writer::HostResultStatus;

/// Format legacy JSON line per SPEC §6.
/// Single line, no trailing newline (caller adds if needed).
pub fn format_legacy_json(ok: i64, warn: i64, fail: i64, total: i64, status: HostResultStatus) -> String {
    format!(
        r#"{{"ok":{},"warn":{},"fail":{},"total":{},"status":"{}"}}"#,
        ok, warn, fail, total, status.as_str()
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn legacy_json_pass_format() {
        let s = format_legacy_json(10, 0, 0, 10, HostResultStatus::Pass);
        assert_eq!(s, r#"{"ok":10,"warn":0,"fail":0,"total":10,"status":"pass"}"#);
    }

    #[test]
    fn legacy_json_warn_format() {
        let s = format_legacy_json(7, 3, 0, 10, HostResultStatus::Warn);
        assert_eq!(s, r#"{"ok":7,"warn":3,"fail":0,"total":10,"status":"warn"}"#);
    }

    #[test]
    fn legacy_json_fail_format() {
        let s = format_legacy_json(5, 0, 2, 7, HostResultStatus::Fail);
        assert_eq!(s, r#"{"ok":5,"warn":0,"fail":2,"total":7,"status":"fail"}"#);
    }

    #[test]
    fn legacy_json_parseable_by_python_json_module() {
        // Schema must be valid JSON parseable by python3's json.loads (used by nattos.sh §40)
        let s = format_legacy_json(1, 2, 3, 6, HostResultStatus::Warn);
        // Manual structural check (no serde_json dep in tests)
        assert!(s.starts_with('{'));
        assert!(s.ends_with('}'));
        assert!(s.contains(r#""ok":1"#));
        assert!(s.contains(r#""warn":2"#));
        assert!(s.contains(r#""fail":3"#));
        assert!(s.contains(r#""total":6"#));
        assert!(s.contains(r#""status":"warn""#));
    }
}
