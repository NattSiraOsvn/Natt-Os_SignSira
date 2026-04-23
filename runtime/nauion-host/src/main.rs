// runtime/nauion-host/src/main.rs
// NATT-OS Wave 1 Host-First runtime — full pipeline
// Drafter: Băng (Chị Tư · N-shell · QNEU 313.5)
// Per W1_HOST_FIRST_ASSIGNEE_DECISION_20260423
// Per SPEC_HOST_FIRST_RUNTIME v1.1 §0

mod banner;
mod phase1;
mod phase2;
mod phase3;
mod phase4;
mod repo_root;

use std::process::ExitCode;
use std::sync::Arc;
use tracing::{error, info};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().collect();
    let self_test_mode = args.iter().any(|a| a == "--self-test");
    let no_listen = args.iter().any(|a| a == "--no-listen");

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
        no_listen,
        "NATT-OS Nauion Host — Khương Kim · Băng Thịnh"
    );

    // Detect repo root (walk up to nattos.sira anchor)
    let repo_root = repo_root::detect();
    let src_root = repo_root.join("src");
    info!(
        repo_root = %repo_root.display(),
        src_root = %src_root.display(),
        "Repo root detected"
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
    let resolver = Arc::new(phase2::FileResolver::new(src_root.clone()));
    info!("PHASE 2 FileResolver ready");

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

    // PHASE 4 — Boot kernel + HTTP server + SIGINT
    if no_listen {
        info!("--no-listen flag set — skip PHASE 4 boot kernel");
        info!("Nauion Host — exit (scaffold mode, PHASE 1+2+3 ready, PHASE 4 skipped)");
        return ExitCode::SUCCESS;
    }

    info!("PHASE 4 boot kernel + listen 127.0.0.1:3002");
    match phase4::boot(esbuild_status, resolver).await {
        Ok(()) => {
            info!("Nauion Host — exit (graceful shutdown)");
            ExitCode::SUCCESS
        }
        Err(e) => {
            error!(error = %e, "PHASE 4 boot failed");
            ExitCode::FAILURE
        }
    }
}
