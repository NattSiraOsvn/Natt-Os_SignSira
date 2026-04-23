// runtime/nauion-host/src/main.rs
// NATT-OS Wave 1 Host-First runtime — Khương Kim · Băng Thịnh
// Drafter: Băng (Chị Tư · N-shell · QNEU 313.5)
// Per W1_HOST_FIRST_ASSIGNEE_DECISION_20260423
// Per SPEC_HOST_FIRST_RUNTIME v1.1 §0

mod banner;
mod phase1;

use std::process::ExitCode;
use tracing::{error, info};
use tracing_subscriber::EnvFilter;

fn main() -> ExitCode {
    // PHASE 0 — Print branding banner (mirror nattos.sh style)
    banner::print_banner();

    // Init tracing — env RUST_LOG controls verbosity
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    info!(
        version = env!("CARGO_PKG_VERSION"),
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
        phase1_esbuild_version = esbuild_status.version.as_deref().unwrap_or("n/a"),
        "PHASE 1 complete"
    );

    // PHASE 2-4 pending implementation
    info!("PHASE 2 registerNauionHooks — TODO (next commit)");
    info!("PHASE 3 bootstrap cells — TODO");
    info!("PHASE 4 listen 127.0.0.1:3002 — TODO");

    info!("Nauion Host — exit (scaffold mode, full runtime pending)");
    ExitCode::SUCCESS
}
