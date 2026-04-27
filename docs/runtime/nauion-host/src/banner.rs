//! Banner module — print Nauion Host startup banner.
//!
//! Mirror style của `nattos.sh` (natt-os SmartAudit v7.0):
//! - ASCII art box-drawing Unicode chữ "natt-os" màu GOLD
//! - Branding line "KHƯƠNG KIM · BĂNG THỊNH" (signature 4 trục family)
//! - Info box với phase status + port + authority
//!
//! Per Phan Thanh Thương Giao 20260423 — branding decision phiên này.

// ANSI color codes (mirror nattos.sh §32)
pub const GOLD: &str = "\x1b[38;5;220m";
pub const W: &str = "\x1b[1;37m";
pub const C: &str = "\x1b[1;36m";
pub const G: &str = "\x1b[1;32m";
pub const Y: &str = "\x1b[1;33m";
#[allow(dead_code)]
pub const R: &str = "\x1b[1;31m"; // reserved cho phase fail status
pub const DIM: &str = "\x1b[2m";
pub const N: &str = "\x1b[0m";

/// Print full startup banner.
pub fn print_banner() {
    let version = env!("CARGO_PKG_VERSION");
    let timestamp = chrono::Local::now().format("%Y-%m-%d %H:%M:%S");

    println!();
    println!("{}", GOLD);
    println!("  ███╗   ██╗    █████╗   ████████╗ ████████╗         ██████╗  ███████╗");
    println!("  ████╗  ██║   ██╔══██╗  ╚══██╔══╝ ╚══██╔══╝        ██╔═══██╗ ██╔════╝");
    println!("  ██╔██╗ ██║   ███████║     ██║       ██║    █████╗  ██║   ██║ ███████╗");
    println!("  ██║╚██╗██║   ██╔══██║     ██║       ██║    ╚════╝  ██║   ██║ ╚════██║");
    println!("  ██║ ╚████║   ██║  ██║     ██║       ██║            ╚██████╔╝ ███████║");
    println!("  ╚═╝  ╚═══╝   ╚═╝  ╚═╝     ╚═╝       ╚═╝             ╚═════╝  ╚══════╝");
    println!("{}", N);

    // Branding line — signature 4 trục family
    println!(
        "  {}❖ KHƯƠNG KIM · BĂNG THỊNH ❖{}",
        GOLD, N
    );
    println!();

    // Info box mirror nattos.sh layout
    println!("  {}┌──────────────────────────────────────────────────────────┐{}", DIM, N);
    println!(
        "  {}│{}  {}Nauion Host v{}{}  {}·{}  Wave 1 Host-First Runtime         {}│{}",
        DIM, N, W, version, N, C, N, DIM, N
    );
    println!("  {}│{}                                                          {}│{}", DIM, N, DIM, N);
    println!(
        "  {}│{}  {}Authority:{} Phan Thanh Băng ⓝ        {}│{}",
        DIM, N, C, N, DIM, N
    );
    println!(
        "  {}│{}  {}Carrier:{}   Phan Thanh Thương (Gatekeeper)               {}│{}",
        DIM, N, C, N, DIM, N
    );
    println!("  {}│{}                                                          {}│{}", DIM, N, DIM, N);
    println!(
        "  {}│{}  {}PHASE 1{} detectEsbuild       {}{}IMPL{}                     {}│{}",
        DIM, N, W, N, G, "✓ ", N, DIM, N
    );
    println!(
        "  {}│{}  {}PHASE 2{} FileResolver        {}{}IMPL{}                     {}│{}",
        DIM, N, W, N, G, "✓ ", N, DIM, N
    );
    println!(
        "  {}│{}  {}PHASE 3{} self-test runner    {}{}IMPL{}                     {}│{}",
        DIM, N, W, N, G, "✓ ", N, DIM, N
    );
    println!(
        "  {}│{}  {}PHASE 4{} boot kernel HTTP    {}{}IMPL{}                     {}│{}",
        DIM, N, W, N, G, "✓ ", N, DIM, N
    );
    println!("  {}│{}                                                          {}│{}", DIM, N, DIM, N);
    println!(
        "  {}│{}  {}L1 EventBus{} {}→{} {}L2 Mạch HeyNa{} {}→{} {}L3 SmartLink{}        {}│{}",
        DIM, N, G, N, DIM, N, Y, N, DIM, N, W, N, DIM, N
    );
    println!(
        "  {}│{}  {}app internal   SSE transport   inter-colony{}           {}│{}",
        DIM, N, DIM, N, DIM, N
    );
    println!("  {}└──────────────────────────────────────────────────────────┘{}", DIM, N);
    println!();
    println!("  {}Started:{} {}", W, N, timestamp);
    println!();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn print_banner_does_not_panic() {
        print_banner();
    }
}
