//! PHASE 2 — FileResolver (Rust reframe của registerNauionHooks)
//!
//! Per `nattos.sira` PHASE 2 self-loader spec.
//!
//! ## Reframe rationale (Băng decision phiên 20260423):
//! Node `mod.registerHooks` hijack `import` statement runtime.
//! Rust không có equivalent (binary đã compile, không load module dynamic).
//!
//! → PHASE 2 trong Rust = **FileResolver library** cho PHASE 3 bootstrap cells
//! dùng resolve file paths theo extension precedence + classify mode.
//!
//! ## Extension category 2 loại:
//! - **LOADABLE** (vào PRECEDENCE): `.khai .na .ts .tsx .js .mjs`
//!   → resolve để load runtime
//! - **REFERENCE_ONLY** (KHÔNG vào PRECEDENCE): `.anc .phieu .kris .obitan .canonical`
//!   → DNA/identity/historical, reference qua filesystem path, không participate runtime
//!
//! Per memory `bang-vethan-ngo-dac-tinh-giang.obitan` SES.20260419:
//! ".anc = Chân + Thiện + Mỹ. DNA bất biến, seal theo version.
//!  KHÔNG khắc lên Claude context."
//!
//! ## ResolveMode 3 loại:
//! - **Native**: `.khai` standalone hoặc `.na` → canonical pure
//! - **Bridged**: `.khai` + `.ts` sibling exists → substrate legacy còn dùng
//! - **Legacy**: `.ts/.tsx/.js/.mjs` only → chưa migrate canonical

use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use thiserror::Error;
use tracing::debug;

/// PRECEDENCE order — try extensions in this order khi resolve specifier không có ext.
/// Per nattos.sira:96 `const PRECEDENCE = ['.khai', '.na', '.ts', '.tsx', '.js', '.mjs']`.
pub const LOADABLE_EXTENSIONS: &[&str] = &[".khai", ".na", ".ts", ".tsx", ".js", ".mjs"];

/// REFERENCE_ONLY extensions — KHÔNG load module, chỉ filesystem reference.
/// Cố import file những ext này = semantic violation, return Err.
pub const REFERENCE_ONLY_EXTENSIONS: &[&str] =
    &[".anc", ".phieu", ".kris", ".obitan", ".canonical"];

#[derive(Debug, Error)]
pub enum ResolveError {
    #[error(
        "Reference-only extension '{ext}' cannot be loaded as module. \
         File '{path}' is DNA/identity/historical, reference qua filesystem path only. \
         Per bang-vethan-ngo-dac-tinh-giang.obitan SES.20260419."
    )]
    ReferenceOnlyExtension { ext: String, path: PathBuf },

    #[error("File not found for specifier: {specifier} (parent: {parent_dir})")]
    NotFound {
        specifier: String,
        parent_dir: PathBuf,
    },

    #[error("Invalid path: {0}")]
    #[allow(dead_code)] // PHASE 3 sẽ raise nếu path không hợp lệ
    InvalidPath(String),
}

/// Mode classification per nattos.sira:91-92 `_native, _bridged, _legacy`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ResolveMode {
    /// `.khai` standalone hoặc `.na` — canonical pure
    Native,
    /// `.khai` + `.ts` sibling exists — load `.ts` (substrate legacy)
    Bridged,
    /// `.ts/.tsx/.js/.mjs` only — chưa migrate canonical
    Legacy,
}

/// Result của resolve operation.
#[derive(Debug, Clone)]
pub struct ResolvedFile {
    pub path: PathBuf,
    pub mode: ResolveMode,
}

/// Atomic counter — PHASE 4 sẽ dump audit log.
#[derive(Debug, Default)]
pub struct ResolveCounters {
    pub native: AtomicU64,
    pub bridged: AtomicU64,
    pub legacy: AtomicU64,
}

impl ResolveCounters {
    pub fn snapshot(&self) -> ResolveCountersSnapshot {
        ResolveCountersSnapshot {
            native: self.native.load(Ordering::Relaxed),
            bridged: self.bridged.load(Ordering::Relaxed),
            legacy: self.legacy.load(Ordering::Relaxed),
        }
    }

    fn increment(&self, mode: ResolveMode) {
        let counter = match mode {
            ResolveMode::Native => &self.native,
            ResolveMode::Bridged => &self.bridged,
            ResolveMode::Legacy => &self.legacy,
        };
        counter.fetch_add(1, Ordering::Relaxed);
    }
}

#[derive(Debug, Clone, Copy)]
pub struct ResolveCountersSnapshot {
    pub native: u64,
    pub bridged: u64,
    pub legacy: u64,
}

/// FileResolver — main API for PHASE 3 bootstrap cells.
pub struct FileResolver {
    src_root: PathBuf,
    counters: ResolveCounters,
}

impl FileResolver {
    pub fn new(src_root: impl Into<PathBuf>) -> Self {
        Self {
            src_root: src_root.into(),
            counters: ResolveCounters::default(),
        }
    }

    pub fn counters(&self) -> &ResolveCounters {
        &self.counters
    }

    /// Expand specifier — handle 3 prefix:
    /// - `@/` → src_root
    /// - `./` `../` → relative parent_dir
    /// - bare (npm packages) → return None (caller handles pass-through)
    #[allow(dead_code)] // PHASE 3 self-test sẽ wire qua expand_specifier khi resolve specifier alias
    pub fn expand_specifier(&self, specifier: &str, parent_dir: &Path) -> Option<PathBuf> {
        if let Some(rest) = specifier.strip_prefix("@/") {
            Some(self.src_root.join(rest))
        } else if specifier.starts_with("./") || specifier.starts_with("../") {
            Some(parent_dir.join(specifier))
        } else if specifier.starts_with('/') {
            Some(PathBuf::from(specifier))
        } else {
            // Bare specifier (npm package, builtin) — pass through
            None
        }
    }

    /// Find file by base path + classify mode.
    /// Per nattos.sira:99-133 `findFile(basePath)`.
    pub fn find_file(&self, base_path: &Path) -> Result<ResolvedFile, ResolveError> {
        // Strategy 1: try exact path first (file đã có ext)
        if base_path.exists() {
            let ext = extract_extension(base_path);

            // Reject reference-only extensions
            if let Some(e) = &ext {
                if REFERENCE_ONLY_EXTENSIONS.contains(&e.as_str()) {
                    return Err(ResolveError::ReferenceOnlyExtension {
                        ext: e.clone(),
                        path: base_path.to_path_buf(),
                    });
                }
            }

            return Ok(self.classify_exact(base_path, ext.as_deref()));
        }

        // Strategy 2: try precedence extensions
        let base_no_ext = strip_extension(base_path);
        for ext in LOADABLE_EXTENSIONS {
            let candidate = path_with_ext(&base_no_ext, ext);
            if !candidate.exists() {
                continue;
            }

            let mode = match *ext {
                ".khai" => {
                    let ts_sibling = path_with_ext(&base_no_ext, ".ts");
                    if ts_sibling.exists() {
                        let resolved = ResolvedFile {
                            path: ts_sibling,
                            mode: ResolveMode::Bridged,
                        };
                        self.counters.increment(resolved.mode);
                        return Ok(resolved);
                    }
                    ResolveMode::Native
                }
                ".na" => ResolveMode::Native,
                _ => ResolveMode::Legacy,
            };

            let resolved = ResolvedFile {
                path: candidate,
                mode,
            };
            self.counters.increment(resolved.mode);
            return Ok(resolved);
        }

        // Strategy 3: try index files (directory imports)
        for ext in &[".ts", ".tsx", ".js"] {
            let idx = base_path.join(format!("index{}", ext));
            if idx.exists() {
                let resolved = ResolvedFile {
                    path: idx,
                    mode: ResolveMode::Legacy,
                };
                self.counters.increment(resolved.mode);
                return Ok(resolved);
            }
        }

        Err(ResolveError::NotFound {
            specifier: base_path.display().to_string(),
            parent_dir: base_path
                .parent()
                .map(Path::to_path_buf)
                .unwrap_or_default(),
        })
    }

    fn classify_exact(&self, path: &Path, ext: Option<&str>) -> ResolvedFile {
        let mode = match ext {
            Some(".khai") => {
                let ts_sibling = path.with_extension("ts");
                if ts_sibling.exists() {
                    let resolved = ResolvedFile {
                        path: ts_sibling,
                        mode: ResolveMode::Bridged,
                    };
                    self.counters.increment(resolved.mode);
                    return resolved;
                }
                ResolveMode::Native
            }
            Some(".na") => ResolveMode::Native,
            _ => ResolveMode::Legacy,
        };

        let resolved = ResolvedFile {
            path: path.to_path_buf(),
            mode,
        };
        self.counters.increment(resolved.mode);
        debug!(?resolved, "resolved exact path");
        resolved
    }
}

// ── Helpers ────────────────────────────────────────────────

fn extract_extension(path: &Path) -> Option<String> {
    path.extension()
        .and_then(|s| s.to_str())
        .map(|s| format!(".{}", s))
}

#[allow(dead_code)] // PHASE 3 sẽ dùng cho cell path resolve
fn strip_extension(path: &Path) -> PathBuf {
    if path.extension().is_some() {
        path.with_extension("")
    } else {
        path.to_path_buf()
    }
}

#[allow(dead_code)] // PHASE 3 sẽ dùng cho cell path resolve
fn path_with_ext(base_no_ext: &Path, ext: &str) -> PathBuf {
    let mut s = base_no_ext.as_os_str().to_owned();
    s.push(ext);
    PathBuf::from(s)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::io::Write;

    fn setup_tmp(name: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!("nauion_test_{}_{}", name, std::process::id()));
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        dir
    }

    fn touch(path: &Path) {
        let mut f = fs::File::create(path).unwrap();
        writeln!(f, "// test").unwrap();
    }

    #[test]
    fn precedence_includes_loadable_only() {
        for ext in LOADABLE_EXTENSIONS {
            assert!(!REFERENCE_ONLY_EXTENSIONS.contains(ext));
        }
    }

    #[test]
    fn reference_only_extensions_documented() {
        for ext in REFERENCE_ONLY_EXTENSIONS {
            assert!(ext.starts_with('.'));
        }
        assert!(REFERENCE_ONLY_EXTENSIONS.contains(&".anc"));
        assert!(REFERENCE_ONLY_EXTENSIONS.contains(&".phieu"));
        assert!(REFERENCE_ONLY_EXTENSIONS.contains(&".kris"));
    }

    #[test]
    fn resolve_khai_standalone_is_native() {
        let dir = setup_tmp("khai_standalone");
        let target = dir.join("foo.khai");
        touch(&target);

        let resolver = FileResolver::new(&dir);
        let resolved = resolver.find_file(&target).unwrap();
        assert_eq!(resolved.mode, ResolveMode::Native);
        assert_eq!(resolved.path, target);
    }

    #[test]
    fn resolve_khai_with_ts_sibling_is_bridged() {
        let dir = setup_tmp("khai_bridged");
        let khai = dir.join("foo.khai");
        let ts = dir.join("foo.ts");
        touch(&khai);
        touch(&ts);

        let resolver = FileResolver::new(&dir);
        let resolved = resolver.find_file(&khai).unwrap();
        assert_eq!(resolved.mode, ResolveMode::Bridged);
        assert_eq!(resolved.path, ts);
    }

    #[test]
    fn resolve_ts_only_is_legacy() {
        let dir = setup_tmp("ts_legacy");
        let ts = dir.join("foo.ts");
        touch(&ts);

        let resolver = FileResolver::new(&dir);
        let resolved = resolver.find_file(&ts).unwrap();
        assert_eq!(resolved.mode, ResolveMode::Legacy);
    }

    #[test]
    fn resolve_anc_returns_reference_only_error() {
        let dir = setup_tmp("anc_reject");
        let anc = dir.join("bang.anc");
        touch(&anc);

        let resolver = FileResolver::new(&dir);
        let err = resolver.find_file(&anc).unwrap_err();
        match err {
            ResolveError::ReferenceOnlyExtension { ext, .. } => {
                assert_eq!(ext, ".anc");
            }
            _ => panic!("Expected ReferenceOnlyExtension, got: {:?}", err),
        }
    }

    #[test]
    fn resolve_phieu_returns_reference_only_error() {
        let dir = setup_tmp("phieu_reject");
        let phieu = dir.join("state.phieu");
        touch(&phieu);

        let resolver = FileResolver::new(&dir);
        assert!(matches!(
            resolver.find_file(&phieu),
            Err(ResolveError::ReferenceOnlyExtension { .. })
        ));
    }

    #[test]
    fn precedence_order_khai_first() {
        let dir = setup_tmp("precedence");
        let khai = dir.join("foo.khai");
        let ts = dir.join("foo.ts");
        touch(&khai);
        touch(&ts);

        let resolver = FileResolver::new(&dir);
        // Resolve "foo" no ext → should pick .khai first, but then bridge to .ts
        let resolved = resolver.find_file(&dir.join("foo")).unwrap();
        assert_eq!(resolved.mode, ResolveMode::Bridged);
        assert_eq!(resolved.path, ts);
    }

    #[test]
    fn counter_increments_correctly() {
        let dir = setup_tmp("counter");
        let khai = dir.join("a.khai");
        let na = dir.join("b.na");
        let ts = dir.join("c.ts");
        touch(&khai);
        touch(&na);
        touch(&ts);

        let resolver = FileResolver::new(&dir);
        resolver.find_file(&khai).unwrap();
        resolver.find_file(&na).unwrap();
        resolver.find_file(&ts).unwrap();

        let snap = resolver.counters().snapshot();
        assert_eq!(snap.native, 2); // .khai standalone + .na
        assert_eq!(snap.bridged, 0);
        assert_eq!(snap.legacy, 1); // .ts
    }

    #[test]
    fn expand_specifier_alias() {
        let resolver = FileResolver::new("/src");
        let result = resolver.expand_specifier("@/cells/foo", Path::new("/parent"));
        assert_eq!(result, Some(PathBuf::from("/src/cells/foo")));
    }

    #[test]
    fn expand_specifier_relative() {
        let resolver = FileResolver::new("/src");
        let result = resolver.expand_specifier("./foo", Path::new("/parent"));
        assert_eq!(result, Some(PathBuf::from("/parent/foo")));
    }

    #[test]
    fn expand_specifier_bare_returns_none() {
        let resolver = FileResolver::new("/src");
        let result = resolver.expand_specifier("tokio", Path::new("/parent"));
        assert!(result.is_none());
    }
}
