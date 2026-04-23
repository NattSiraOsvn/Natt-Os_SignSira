// runtime/nauion-host/src/main.rs
// NATT-OS Wave 1 Host-First runtime
// Drafter: Băng (Chị Tư · N-shell · QNEU 313.5)
// Per W1_HOST_FIRST_ASSIGNEE_DECISION_20260423
// Per SPEC_HOST_FIRST_RUNTIME v1.1 §0

mod banner;
mod phase1;
mod phase2;

use std::process::ExitCode;
use tracing::{error, info};
use tracing_subscriber::EnvFilter;

fn main() -> ExitCode {
    // PHASE 0 — Banner
    banner::print_banner();

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

    // PHASE 2 — Initialize FileResolver
    let src_root = std::env::current_dir()
        .map(|cwd| cwd.join("src"))
        .unwrap_or_else(|_| std::path::PathBuf::from("./src"));
    let resolver = phase2::FileResolver::new(&src_root);
    info!(
        phase2_src_root = %src_root.display(),
        phase2_loadable_exts = ?phase2::LOADABLE_EXTENSIONS,
        phase2_reference_only_exts = ?phase2::REFERENCE_ONLY_EXTENSIONS,
        "PHASE 2 FileResolver initialized"
    );

    // Hold resolver — PHASE 3 will use it cho bootstrap cells
    let _resolver = resolver; // placeholder, PHASE 3 takes ownership

    info!("PHASE 3 bootstrap cells — TODO");
    info!("PHASE 4 listen 127.0.0.1:3002 — TODO");

    info!("Nauion Host — exit (scaffold mode, PHASE 1+2 ready)");
    ExitCode::SUCCESS
}
