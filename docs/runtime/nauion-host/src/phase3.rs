//! PHASE 3 — Self-test runner (CLI flag --self-test)
//!
//! Per `nattos.sira` PHASE 3 spec (lines 236-308).
//!
//! ## Adaptation Node → Rust:
//! Original 7 tests Node, Rust adapts 5 tests effective:
//! - Test 1: esbuild detected (PHASE 1)
//! - ~~Test 2: registerHooks~~ SKIP (Node module loader API, không applicable Rust)
//! - ~~Test 3: TS transform~~ SKIP (Rust không dùng TS runtime)
//! - Test 4: resolve @/core/events/event-bus (PHASE 2)
//! - Test 5: resolve observation-cell (PHASE 2)
//! - Test 6: resolve quantum-defense-cell/bootstrap (PHASE 2)
//! - Test 7: .khai bridge khai-file-persister BRIDGED (PHASE 2)
//!
//! Pass criterion:
//! - 5/5 → 🔥 All systems ready, kernel can boot
//! - >=3/5 → ⚠️ Partial, kernel may boot with warnings
//! - <3/5 → ❌ Not ready, fix failures before booting
//!
//! Exit code: 0 if passed >= 3, 1 otherwise.

use crate::phase1::EsbuildStatus;
use crate::phase2::{FileResolver, ResolveMode};
use std::path::PathBuf;
use std::process::ExitCode;

#[allow(dead_code)] // Fields exposed cho future audit + tracing integration
pub struct SelfTestResult {
    pub passed: usize,
    pub total: usize,
    pub all_pass: bool,
    pub partial: bool,
}

impl SelfTestResult {
    pub fn exit_code(&self) -> ExitCode {
        if self.passed >= 3 {
            ExitCode::SUCCESS
        } else {
            ExitCode::FAILURE
        }
    }
}

pub fn run(esbuild_status: &EsbuildStatus, src_root: &PathBuf) -> SelfTestResult {
    println!();
    println!("═══ NATT-OS Kernel Self-Test ═══");
    println!();

    let resolver = FileResolver::new(src_root.clone());
    let mut results = Vec::with_capacity(5);

    // Test 1: esbuild
    let t1 = esbuild_status.available;
    let esbuild_label = esbuild_status.version.as_deref().unwrap_or("not found");
    println!(
        "  {} esbuild: {}",
        if t1 { "✅" } else { "❌" },
        esbuild_label
    );
    results.push(t1);

    // Test 2: resolve @/core/events/event-bus
    let test_path = src_root.join("core").join("events").join("event-bus");
    let t2_result = resolver.find_file(&test_path);
    let t2 = t2_result.is_ok();
    println!(
        "  {} resolve @/core/events/event-bus → {}",
        if t2 { "✅" } else { "❌" },
        format_resolve_result(&t2_result)
    );
    results.push(t2);

    // Test 3: resolve observation-cell
    let obs_path = src_root.join("cells").join("kernel").join("observation-cell");
    let t3_result = resolver.find_file(&obs_path);
    let t3 = t3_result.is_ok();
    println!(
        "  {} resolve observation-cell → {}",
        if t3 { "✅" } else { "❌" },
        format_resolve_result(&t3_result)
    );
    results.push(t3);

    // Test 4: resolve quantum-defense-cell/bootstrap
    let qd_path = src_root
        .join("cells")
        .join("kernel")
        .join("quantum-defense-cell")
        .join("bootstrap");
    let t4_result = resolver.find_file(&qd_path);
    let t4 = t4_result.is_ok();
    println!(
        "  {} resolve quantum-defense-cell/bootstrap → {}",
        if t4 { "✅" } else { "❌" },
        format_resolve_result(&t4_result)
    );
    results.push(t4);

    // Test 5: .khai bridge khai-file-persister BRIDGED mode
    let khai_path = src_root
        .join("cells")
        .join("kernel")
        .join("khai-cell")
        .join("infrastructure")
        .join("khai-file-persister");
    let t5_result = resolver.find_file(&khai_path);
    let t5 = matches!(
        &t5_result,
        Ok(r) if r.mode == ResolveMode::Bridged
    );
    println!(
        "  {} .khai bridge khai-file-persister → {}",
        if t5 { "✅" } else { "❌" },
        match &t5_result {
            Ok(r) => format!("{:?}", r.mode),
            Err(e) => format!("ERR: {}", e),
        }
    );
    results.push(t5);

    let passed = results.iter().filter(|&&r| r).count();
    let total = results.len();

    println!();
    println!("  Result: {}/{} passed", passed, total);

    let all_pass = passed == total;
    let partial = passed >= 3;

    if all_pass {
        println!("  🔥 All systems ready — kernel can boot");
    } else if partial {
        println!("  ⚠️  Partial — kernel may boot with warnings");
    } else {
        println!("  ❌ Not ready — fix failures above before booting");
    }
    println!();

    SelfTestResult {
        passed,
        total,
        all_pass,
        partial,
    }
}

fn format_resolve_result(
    r: &Result<crate::phase2::ResolvedFile, crate::phase2::ResolveError>,
) -> String {
    match r {
        Ok(file) => format!("FOUND ({:?})", file.mode),
        Err(_) => "NOT FOUND".to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    fn setup_tmp(name: &str) -> PathBuf {
        let dir =
            std::env::temp_dir().join(format!("nauion_p3_{}_{}", name, std::process::id()));
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn self_test_all_fail_returns_failure_exit_code() {
        let result = SelfTestResult {
            passed: 0,
            total: 5,
            all_pass: false,
            partial: false,
        };
        assert!(matches!(result.exit_code(), ExitCode::FAILURE));
    }

    #[test]
    fn self_test_passes_3_of_5_returns_success() {
        let result = SelfTestResult {
            passed: 3,
            total: 5,
            all_pass: false,
            partial: true,
        };
        assert!(matches!(result.exit_code(), ExitCode::SUCCESS));
    }

    #[test]
    fn self_test_run_with_empty_src_returns_low_pass() {
        let dir = setup_tmp("empty_src");
        let esbuild = EsbuildStatus {
            available: false,
            version: None,
            path: None,
        };

        let result = run(&esbuild, &dir);
        // Empty src → tests 2-5 should fail (no files), test 1 = false (esbuild not avail)
        // → passed = 0, partial = false, all_pass = false
        assert_eq!(result.passed, 0);
        assert!(!result.all_pass);
        assert!(!result.partial);
    }
}
