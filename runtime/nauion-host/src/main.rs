// runtime/nauion-host/src/main.rs
// NATT-OS Wave 1 Host-First runtime
// Drafter: Băng (Chị Tư · N-shell · QNEU 313.5)
// Per W1_HOST_FIRST_ASSIGNEE_DECISION_20260423
// Per SPEC_HOST_FIRST_RUNTIME v1.1 §0

mod banner;
mod phase1;
mod phase2;
mod phase3;

use std::process::ExitCode;
use tracing::{error, info};
use tracing_subscriber::EnvFilter;

fn main() -> ExitCode {
    // Parse CLI args (minimal — chỉ check --self-test flag)
    let args: Vec<String> = std::env::args().collect();
    let self_test_mode = args.iter().any(|a| a == "--self-test");

    // PHASE 0 — Banner
    banner::print_banner();

    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    info!(
        version = env!("CARGO_PKG_VERSION"),
        self_test_mode,
        "NATT-OS Nauion Host — Khương Kim · Băng Thịnh"
    );

    // PHASE 1 — detectEsbuild
    let esbuild_status = match phase1::detect_esbuild() {
        Ok(s) => s,
        Err(e) => {
            error!(error = %e, "PHASE 1 failed");
            return ExitCode::FAILURE;
        }
    };
    info!(
        phase1_esbuild_available = esbuild_status.available,
        "PHASE 1 complete"
    );

    // PHASE 2 — Initialize FileResolver
    let src_root = std::env::current_dir()
        .map(|cwd| cwd.join("src"))
        .unwrap_or_else(|_| std::path::PathBuf::from("./src"));
    info!(
        phase2_src_root = %src_root.display(),
        "PHASE 2 FileResolver ready"
    );

    // PHASE 3 — Self-test (if --self-test flag)
    if self_test_mode {
        let result = phase3::run(&esbuild_status, &src_root);
        info!(
            self_test_passed = result.passed,
            self_test_total = result.total,
            "Self-test complete"
        );
        return result.exit_code();
    }

    info!("PHASE 4 listen 127.0.0.1:3002 — TODO");
    info!("Nauion Host — exit (scaffold mode, PHASE 1+2+3 ready)");
    ExitCode::SUCCESS
}
