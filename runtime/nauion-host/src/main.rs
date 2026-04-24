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
mod result_writer;
mod run_cell;
mod legacy_json;

use std::process::ExitCode;
use std::sync::Arc;
use tracing::{error, info};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().collect();
    let self_test_mode = args.iter().any(|a| a == "--self-test");
    let no_listen = args.iter().any(|a| a == "--no-listen");

    let legacy_json_mode = args.iter().any(|a| a == "--legacy-json");
    let run_cell_path: Option<std::path::PathBuf> = args.iter()
        .position(|a| a == "--run-cell")
        .and_then(|i| args.get(i + 1))
        .map(std::path::PathBuf::from);

    // W2C — headless run-cell mode: skip banner/listen, write result.phieu, exit
    if let Some(canonical) = run_cell_path {
        let repo_root = repo_root::detect();
        let host_version = env!("CARGO_PKG_VERSION");
        match run_cell::execute(&canonical, &repo_root, host_version, self_test_mode) {
            Ok(outcome) => {
                if legacy_json_mode {
                    // SPEC §6 legacy bridge — stdout JSON for nattos.sh §40 compat
                    println!("{}", legacy_json::format_legacy_json(
                        outcome.ok, outcome.warn, outcome.fail, outcome.total, outcome.status
                    ));
                }
                eprintln!(
                    "[run-cell] status={} result={}",
                    outcome.status.as_str(),
                    outcome.result_path.display()
                );
                return match outcome.status {
                    result_writer::HostResultStatus::Fail => ExitCode::from(1),
                    _ => ExitCode::SUCCESS,
                };
            }
            Err(e) => {
                eprintln!("[run-cell] ERROR: {}", e);
                return ExitCode::from(2);
            }
        }
    }


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
