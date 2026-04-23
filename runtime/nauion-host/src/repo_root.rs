//! Repo root detection — walk up tìm nattos.sira anchor.
//!
//! Resolution strategy:
//! 1. Env var NATT_OS_ROOT (highest priority — explicit override)
//! 2. Walk up cwd tìm nattos.sira file (kernel anchor)
//! 3. Fallback: current_dir (best effort)

use std::path::PathBuf;
use tracing::{debug, warn};

const ANCHOR_FILE: &str = "nattos.sira";
const ENV_OVERRIDE: &str = "NATT_OS_ROOT";

pub fn detect() -> PathBuf {
    if let Ok(p) = std::env::var(ENV_OVERRIDE) {
        let path = PathBuf::from(&p);
        debug!(env_var = ENV_OVERRIDE, value = %p, "repo root via env");
        return path;
    }

    if let Ok(cwd) = std::env::current_dir() {
        let mut current = cwd.as_path();
        loop {
            if current.join(ANCHOR_FILE).exists() {
                debug!(
                    repo_root = %current.display(),
                    "repo root via walk up nattos.sira anchor"
                );
                return current.to_path_buf();
            }
            match current.parent() {
                Some(parent) => current = parent,
                None => break,
            }
        }
        warn!(
            cwd = %cwd.display(),
            "nattos.sira anchor not found walking up — fallback to cwd"
        );
        return cwd;
    }

    warn!("current_dir() failed — fallback to '.'");
    PathBuf::from(".")
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn detect_via_env_override() {
        let tmp = std::env::temp_dir().join(format!("repo_root_env_{}", std::process::id()));
        fs::create_dir_all(&tmp).unwrap();
        std::env::set_var(ENV_OVERRIDE, tmp.to_str().unwrap());
        let result = detect();
        assert_eq!(result, tmp);
        std::env::remove_var(ENV_OVERRIDE);
    }

    #[test]
    fn detect_walks_up_to_anchor() {
        let tmp = std::env::temp_dir().join(format!("repo_root_walk_{}", std::process::id()));
        let nested = tmp.join("a").join("b").join("c");
        fs::create_dir_all(&nested).unwrap();
        fs::write(tmp.join(ANCHOR_FILE), "").unwrap();

        // Save original cwd
        let original_cwd = std::env::current_dir().unwrap();
        std::env::set_current_dir(&nested).unwrap();
        std::env::remove_var(ENV_OVERRIDE);

        let result = detect();

        // Restore cwd before assertion
        std::env::set_current_dir(&original_cwd).unwrap();

        // Use canonicalize to handle macOS /var → /private/var symlink
        let result_canon = result.canonicalize().unwrap_or(result);
        let tmp_canon = tmp.canonicalize().unwrap_or(tmp.clone());
        assert_eq!(result_canon, tmp_canon);

        let _ = fs::remove_dir_all(&tmp);
    }
}
