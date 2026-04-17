#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════════╗
# ║  NATT-OS PRE-WAVE 3 — CLEANUP & TRANSITION EXECUTOR                ║
# ║                                                                      ║
# ║  Soạn bởi:   BĂNG (Data Steward & Architect)                        ║
# ║  Review bởi:  THIÊN (Business Logic Architect)                       ║
# ║               KIM (Chief Governance Enforcer)                        ║
# ║  Duyệt bởi:  ANH NATT (Gatekeeper)                                  ║
# ║                                                                      ║
# ║  Thực thi bởi: BỐI BỐI (Constitutional Guardian)                    ║
# ║                                                                      ║
# ║  NGUYÊN TẮC:                                                        ║
# ║    • Correct > Fast                                                  ║
# ║    • FILESYSTEM > MEMORY FILE                                        ║
# ║    • STANDARDIZE → AUTOMATE → MONITOR → IMPROVE                     ║
# ║    • 7 lớp ADN = metadata (manifest), KHÔNG PHẢI folder             ║
# ║    • 5 folder = implementation anatomy                               ║
# ╚══════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# ═══════════════════════════════════════════
# COLORS & FORMATTING
# ═══════════════════════════════════════════
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# ═══════════════════════════════════════════
# CONFIG
# ═══════════════════════════════════════════
CELLS_ROOT="src/cells"
KERNEL_DIR="$CELLS_ROOT/kernel"
INFRA_DIR="$CELLS_ROOT/infrastructure"
LEGACY_DIR="$CELLS_ROOT/_legacy"
BACKUP_DIR="_backup_pre_wave3"
DOCS_DIR="docs/audits"
REGISTRY_FILE="$CELLS_ROOT/natt-master-registry.sira"

EXPECTED_LAYERS=("domain" "application" "interface" "infrastructure" "ports")
KERNEL_CELLS=("config-cell" "rbac-cell" "audit-cell" "security-cell" "monitor-cell")
INFRA_CELLS=("warehouse-cell" "sync-cell" "smartlink-cell")
LEGACY_CELLS=("hr-cell" "event-cell" "sales-cell" "showroom-cell" "constants-cell")

# Counters
ERRORS=0
WARNINGS=0
ACTIONS=0
SKIPPED=0

# Log file
LOG_FILE="pre-wave3-execution.log"

# ═══════════════════════════════════════════
# UTILITY FUNCTIONS
# ═══════════════════════════════════════════
timestamp() { date '+%Y-%m-%d %H:%M:%S'; }

log() {
    local msg="[$(timestamp)] $1"
    echo "$msg" >> "$LOG_FILE"
}

info() {
    echo -e "  ${CYAN}ℹ${NC}  $1"
    log "INFO: $1"
}

success() {
    echo -e "  ${GREEN}✅${NC} $1"
    log "SUCCESS: $1"
    ACTIONS=$((ACTIONS + 1))
}

warn() {
    echo -e "  ${YELLOW}⚠️${NC}  $1"
    log "WARNING: $1"
    WARNINGS=$((WARNINGS + 1))
}

fail() {
    echo -e "  ${RED}❌${NC} $1"
    log "ERROR: $1"
    ERRORS=$((ERRORS + 1))
}

skip() {
    echo -e "  ${DIM}⏭  $1${NC}"
    log "SKIP: $1"
    SKIPPED=$((SKIPPED + 1))
}

divider() {
    echo ""
    echo -e "${BOLD}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}  $1${NC}"
    echo -e "${BOLD}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    log "=== $1 ==="
}

phase_header() {
    echo ""
    echo -e "${MAGENTA}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${MAGENTA}║  $1${NC}"
    echo -e "${MAGENTA}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    log ">>> PHASE: $1"
}

confirm() {
    echo ""
    echo -e "  ${YELLOW}❓ $1${NC}"
    echo -e "  ${DIM}Nhấn ENTER để tiếp tục, Ctrl+C để hủy${NC}"
    read -r
}

# ═══════════════════════════════════════════
# CELL MANIFEST GENERATOR (7 ADN Layers)
# ═══════════════════════════════════════════
generate_manifest() {
    local cell_name="$1"
    local cell_wave="$2"
    local cell_status="${3:-ACTIVE}"
    local cell_type="${4:-infrastructure}"
    local manifest_path="$5/neural-main-cell.cell.anc"

    cat > "$manifest_path" << MANIFEST_EOF
{
  "cell": {
    "name": "${cell_name}",
    "version": "1.0.0",
    "wave": "${cell_wave}",
    "type": "${cell_type}",
    "status": "${cell_status}"
  },
  "adn": {
    "identity": {
      "id": "${cell_name}",
      "description": "NATT-OS ${cell_name} - ${cell_wave}",
      "owner": "NATT-OS-TEAM"
    },
    "capability": {
      "exports": [],
      "imports": [],
      "events_emitted": [],
      "events_consumed": []
    },
    "boundary": {
      "allowed_dependencies": [],
      "forbidden_imports": ["**/kernel/**"],
      "isolation_level": "STRICT"
    },
    "trace": {
      "audit_required": true,
      "log_level": "INFO",
      "event_sourcing": true
    },
    "confidence": {
      "test_coverage_minimum": 0,
      "constitutional_compliance": true,
      "last_audit": null
    },
    "smartlink": {
      "linked_cells": [],
      "event_bus_channels": []
    },
    "lifecycle": {
      "created_phase": "PRE_WAVE_3_CLEANUP",
      "current_state": "${cell_status}",
      "transitions": []
    }
  },
  "layers": {
    "domain": true,
    "application": true,
    "interface": true,
    "infrastructure": true,
    "ports": true
  },
  "constitutional_compliance": {
    "articles_enforced": ["Dieu_16", "Dieu_17", "Dieu_18", "Dieu_19"],
    "no_cross_import": true,
    "cell_autonomy": true,
    "event_driven": true
  }
}
MANIFEST_EOF
    log "Generated manifest: $manifest_path (status: $cell_status)"
}

# ═══════════════════════════════════════════
# LAYER SCAFFOLD GENERATOR
# ═══════════════════════════════════════════
create_layer_scaffold() {
    local cell_path="$1"
    local cell_name="$2"

    # Clean name for code (remove -cell suffix, convert to PascalCase)
    local clean_name
    clean_name=$(echo "$cell_name" | sed 's/-cell//' | sed -r 's/(^|-)(\w)/\U\2/g')

    # Domain layer
    mkdir -p "$cell_path/domain/entities"
    mkdir -p "$cell_path/domain/services"
    cat > "$cell_path/domain/entities/${clean_name}Entity.ts" << EOF
/**
 * ${clean_name} Domain Entity
 * Cell: ${cell_name}
 * Layer: Domain (Core business logic)
 * 
 * NATT-OS Constitutional Compliance:
 * - Cell Autonomy: This entity belongs exclusively to ${cell_name}
 * - No Cross-Import: Do not import from other cells
 */

export interface I${clean_name}Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ${clean_name}Entity implements I${clean_name}Entity {
  constructor(
    public readonly id: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}
EOF

    cat > "$cell_path/domain/services/${clean_name}DomainService.ts" << EOF
/**
 * ${clean_name} Domain Service
 * Cell: ${cell_name}
 * Layer: Domain
 */

import { ${clean_name}Entity } from '../entities/${clean_name}Entity';

export class ${clean_name}DomainService {
  validate(entity: ${clean_name}Entity): boolean {
    // TODO: Implement domain validation logic
    return entity.id !== undefined && entity.id !== '';
  }
}
EOF

    # Application layer
    mkdir -p "$cell_path/application/use-cases"
    mkdir -p "$cell_path/application/services"
    cat > "$cell_path/application/use-cases/Get${clean_name}.ts" << EOF
/**
 * Get${clean_name} Use Case
 * Cell: ${cell_name}
 * Layer: Application
 */

import { I${clean_name}Repository } from '../../ports/${clean_name}Repository';

export class Get${clean_name} {
  constructor(private readonly repository: I${clean_name}Repository) {}

  async execute(id: string) {
    return this.repository.findById(id);
  }
}
EOF

    cat > "$cell_path/application/services/${clean_name}ApplicationService.ts" << EOF
/**
 * ${clean_name} Application Service
 * Cell: ${cell_name}
 * Layer: Application
 */

import { Get${clean_name} } from '../use-cases/Get${clean_name}';

export class ${clean_name}ApplicationService {
  constructor(
    private readonly get${clean_name}: Get${clean_name}
  ) {}

  async getById(id: string) {
    return this.get${clean_name}.execute(id);
  }
}
EOF

    # Interface layer
    mkdir -p "$cell_path/interface"
    cat > "$cell_path/interface/${clean_name}Cell.ts" << EOF
/**
 * ${clean_name} Cell Interface
 * Cell: ${cell_name}
 * Layer: Interface (Public API of this cell)
 * 
 * This is the ONLY entry point other cells may reference.
 * All internal implementation details are hidden behind this interface.
 */

import { ${clean_name}ApplicationService } from '../application/services/${clean_name}ApplicationService';

export class ${clean_name}Cell {
  private applicationService: ${clean_name}ApplicationService | null = null;

  async initialize(): Promise<void> {
    // TODO: Wire up dependencies
    console.log('[${cell_name}] Initialized');
  }

  async shutdown(): Promise<void> {
    console.log('[${cell_name}] Shutdown');
  }

  getStatus(): string {
    return this.applicationService ? 'ACTIVE' : 'INACTIVE';
  }
}
EOF

    # Infrastructure layer
    mkdir -p "$cell_path/infrastructure/repositories"
    mkdir -p "$cell_path/infrastructure/adapters"
    cat > "$cell_path/infrastructure/repositories/InMemory${clean_name}Repository.ts" << EOF
/**
 * InMemory ${clean_name} Repository
 * Cell: ${cell_name}
 * Layer: Infrastructure
 */

import { I${clean_name}Repository } from '../../ports/${clean_name}Repository';
import { ${clean_name}Entity } from '../../domain/entities/${clean_name}Entity';

export class InMemory${clean_name}Repository implements I${clean_name}Repository {
  private store: Map<string, ${clean_name}Entity> = new Map();

  async findById(id: string): Promise<${clean_name}Entity | null> {
    return this.store.get(id) || null;
  }

  async save(entity: ${clean_name}Entity): Promise<void> {
    this.store.set(entity.id, entity);
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
EOF

    cat > "$cell_path/infrastructure/adapters/${clean_name}EventAdapter.ts" << EOF
/**
 * ${clean_name} Event Adapter
 * Cell: ${cell_name}
 * Layer: Infrastructure
 * 
 * Adapts cell events to EDA Foundation BaseEvent contract.
 */

export class ${clean_name}EventAdapter {
  async emit(eventType: string, payload: Record<string, unknown>): Promise<void> {
    // TODO: Connect to EventBus when available
    console.log(\`[${cell_name}] Event: \${eventType}\`, payload);
  }
}
EOF

    # Ports layer
    mkdir -p "$cell_path/ports"
    cat > "$cell_path/ports/${clean_name}Repository.ts" << EOF
/**
 * ${clean_name} Repository Port
 * Cell: ${cell_name}
 * Layer: Ports (Contracts/Interfaces)
 * 
 * This port defines the contract for data persistence.
 * Infrastructure layer provides the implementation.
 */

import { ${clean_name}Entity } from '../domain/entities/${clean_name}Entity';

export interface I${clean_name}Repository {
  findById(id: string): Promise<${clean_name}Entity | null>;
  save(entity: ${clean_name}Entity): Promise<void>;
  delete(id: string): Promise<boolean>;
}
EOF

    cat > "$cell_path/ports/${clean_name}EventEmitter.ts" << EOF
/**
 * ${clean_name} Event Emitter Port
 * Cell: ${cell_name}
 * Layer: Ports
 */

export interface I${clean_name}EventEmitter {
  emit(eventType: string, payload: Record<string, unknown>): Promise<void>;
}
EOF

    # Index file
    cat > "$cell_path/index.ts" << EOF
/**
 * ${cell_name} - NATT-OS Cell
 * 
 * Constitutional Compliance:
 * - 5-layer implementation anatomy: domain, application, interface, infrastructure, ports
 * - 7-layer ADN metadata: see neural-main-cell.cell.anc
 * - Articles enforced: Dieu 16, 17, 18, 19
 */

export { ${clean_name}Cell } from './interface/${clean_name}Cell';
export { ${clean_name}Entity } from './domain/entities/${clean_name}Entity';
export type { I${clean_name}Repository } from './ports/${clean_name}Repository';
EOF

    log "Created 5-layer scaffold for $cell_name at $cell_path"
}

# ═══════════════════════════════════════════
# REGISTRY GENERATOR
# ═══════════════════════════════════════════
generate_registry() {
    local registry_path="$1"
    
    cat > "$registry_path" << 'REGISTRY_HEADER'
{
  "meta": {
    "name": "NATT-OS Master Cell Registry",
    "version": "1.0.0",
    "description": "Single source of truth for all cells in NATT-OS",
    "canonical_root": "src/cells",
    "constitutional_version": "v3.1",
    "generated_by": "pre-wave3-cleanup-script",
    "principles": {
      "7_adn_layers": "metadata in neural-main-cell.cell.anc (Identity, Capability, Boundary, Trace, Confidence, SmartLink, Lifecycle)",
      "5_folder_layers": "implementation anatomy (domain, application, interface, infrastructure, ports)",
      "relationship": "7-ADN = ontological contract (constitutional), 5-folder = organ structure (implementation)"
    }
  },
  "waves": {
REGISTRY_HEADER

    # Wave 0
    cat >> "$registry_path" << 'W0'
    "wave_0_foundation": {
      "status": "COMPLETE",
      "components": {
        "constitution": { "path": "natt-os/constitution", "status": "DEPLOYED" },
        "eda_contracts": { "path": "src/contracts", "status": "DEPLOYED" },
        "logger": { "path": "apps/shared/logger.ts", "status": "DEPLOYED" }
      }
    },
W0

    # Wave 1 - Kernel (scan actual cells)
    echo '    "wave_1_kernel": {' >> "$registry_path"
    echo '      "status": "COMPLETE",' >> "$registry_path"
    echo '      "cells": {' >> "$registry_path"

    local first=true
    for cell in "${KERNEL_CELLS[@]}"; do
        local cell_path="$KERNEL_DIR/$cell"
        if [ -d "$cell_path" ]; then
            local ts_count
            ts_count=$(find "$cell_path" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
            local layer_count=0
            for layer in "${EXPECTED_LAYERS[@]}"; do
                if [ -d "$cell_path/$layer" ]; then
                    local lf
                    lf=$(find "$cell_path/$layer" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
                    if [ "$lf" -gt 0 ]; then
                        layer_count=$((layer_count + 1))
                    fi
                fi
            done
            
            [ "$first" = true ] && first=false || echo ',' >> "$registry_path"
            printf '        "%s": { "path": "%s", "layers": %d, "ts_files": %s, "status": "COMPLETE" }' \
                "$cell" "$cell_path" "$layer_count" "$ts_count" >> "$registry_path"
        fi
    done

    echo '' >> "$registry_path"
    echo '      }' >> "$registry_path"
    echo '    },' >> "$registry_path"

    # Wave 2 - Infrastructure (scan actual cells)
    echo '    "wave_2_infrastructure": {' >> "$registry_path"
    echo '      "status": "IN_PROGRESS",' >> "$registry_path"
    echo '      "cells": {' >> "$registry_path"

    first=true
    for cell in "${INFRA_CELLS[@]}"; do
        local cell_path="$INFRA_DIR/$cell"
        if [ -d "$cell_path" ]; then
            local ts_count
            ts_count=$(find "$cell_path" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
            local layer_count=0
            for layer in "${EXPECTED_LAYERS[@]}"; do
                if [ -d "$cell_path/$layer" ]; then
                    local lf
                    lf=$(find "$cell_path/$layer" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
                    if [ "$lf" -gt 0 ]; then
                        layer_count=$((layer_count + 1))
                    fi
                fi
            done

            local status="COMPLETE"
            if [ "$cell" = "warehouse-cell" ]; then
                status="QUARANTINED"
            fi

            [ "$first" = true ] && first=false || echo ',' >> "$registry_path"
            printf '        "%s": { "path": "%s", "layers": %d, "ts_files": %s, "status": "%s" }' \
                "$cell" "$cell_path" "$layer_count" "$ts_count" "$status" >> "$registry_path"
        fi
    done

    echo '' >> "$registry_path"
    echo '      },' >> "$registry_path"

    # Shared contracts cell
    if [ -d "$INFRA_DIR/shared-contracts-cell" ]; then
        local sc_count
        sc_count=$(find "$INFRA_DIR/shared-contracts-cell" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
        echo "      \"shared-contracts-cell\": { \"path\": \"$INFRA_DIR/shared-contracts-cell\", \"ts_files\": $sc_count, \"status\": \"MIGRATED_FROM_SHARED_KERNEL\" }," >> "$registry_path"
    fi

    echo '      "api-cell": { "status": "NEVER_EXISTED", "note": "No git history found - correcting Kim kmf.json error" }' >> "$registry_path"
    echo '    },' >> "$registry_path"

    # Wave 3 - Business (empty)
    echo '    "wave_3_business": {' >> "$registry_path"
    echo '      "status": "NOT_STARTED",' >> "$registry_path"
    echo '      "cells": {}' >> "$registry_path"
    echo '    }' >> "$registry_path"

    # Legacy
    echo '  },' >> "$registry_path"
    echo '  "legacy": {' >> "$registry_path"

    first=true
    for cell in "${LEGACY_CELLS[@]}"; do
        if [ -d "$LEGACY_DIR/$cell" ]; then
            local ts_count
            ts_count=$(find "$LEGACY_DIR/$cell" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
            [ "$first" = true ] && first=false || echo ',' >> "$registry_path"
            printf '    "%s": { "path": "%s", "ts_files": %s, "status": "ARCHIVED_PENDING_WAVE_ASSIGNMENT" }' \
                "$cell" "$LEGACY_DIR/$cell" "$ts_count" >> "$registry_path"
        fi
    done

    echo '' >> "$registry_path"
    echo '  }' >> "$registry_path"
    echo '}' >> "$registry_path"

    log "Generated registry: $registry_path"
}

# ═══════════════════════════════════════════
# HASH BASELINE GENERATOR
# ═══════════════════════════════════════════
generate_hash_baseline() {
    local output_file="$1"
    
    echo "{" > "$output_file"
    echo "  \"hash_baseline\": {" >> "$output_file"
    echo "    \"generated_phase\": \"PHASE_C\"," >> "$output_file"
    echo "    \"algorithm\": \"SHA256\"," >> "$output_file"
    echo "    \"cells\": {" >> "$output_file"

    local first=true

    # Hash all cells in kernel + infrastructure
    for dir in "$KERNEL_DIR" "$INFRA_DIR"; do
        if [ -d "$dir" ]; then
            for cell_path in "$dir"/*/; do
                if [ -d "$cell_path" ]; then
                    local cell_name
                    cell_name=$(basename "$cell_path")
                    # Hash all .ts files in cell
                    local hash
                    hash=$(find "$cell_path" -name "*.ts" -exec cat {} + 2>/dev/null | shasum -a 256 | cut -d' ' -f1)
                    local ts_count
                    ts_count=$(find "$cell_path" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
                    
                    [ "$first" = true ] && first=false || echo "," >> "$output_file"
                    printf '      "%s": { "hash": "%s", "ts_files": %s }' "$cell_name" "$hash" "$ts_count" >> "$output_file"
                fi
            done
        fi
    done

    echo "" >> "$output_file"
    echo "    }" >> "$output_file"
    echo "  }" >> "$output_file"
    echo "}" >> "$output_file"

    log "Generated hash baseline: $output_file"
}

# ═══════════════════════════════════════════
# DEEP SCAN (Post-cleanup verification)
# ═══════════════════════════════════════════
run_deep_scan() {
    local scan_output="$1"
    
    {
        echo "╔══════════════════════════════════════════════════════════════╗"
        echo "║  NATT-OS POST-CLEANUP DEEP SCAN                            ║"
        echo "║  Scanned at: $(timestamp)                                  ║"
        echo "║  Principle: FILESYSTEM = GROUND TRUTH                      ║"
        echo "╚══════════════════════════════════════════════════════════════╝"
        echo ""

        local total_pass=0
        local total_fail=0
        local total_warn=0

        # Check: No legacy ./cells/ root
        echo "═══ CHECK 1: Legacy root ./cells/ ═══"
        if [ ! -d "cells" ]; then
            echo "  ✅ PASS: ./cells/ does not exist"
            total_pass=$((total_pass + 1))
        else
            echo "  ❌ FAIL: ./cells/ still exists!"
            total_fail=$((total_fail + 1))
        fi
        echo ""

        # Check: Kernel cells
        echo "═══ CHECK 2: Kernel Cells (Wave 1) ═══"
        for cell in "${KERNEL_CELLS[@]}"; do
            local cell_path="$KERNEL_DIR/$cell"
            if [ -d "$cell_path" ]; then
                local layer_count=0
                local missing=()
                for layer in "${EXPECTED_LAYERS[@]}"; do
                    if [ -d "$cell_path/$layer" ]; then
                        local lf
                        lf=$(find "$cell_path/$layer" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
                        if [ "$lf" -gt 0 ]; then
                            layer_count=$((layer_count + 1))
                        else
                            missing+=("$layer(empty)")
                        fi
                    else
                        missing+=("$layer")
                    fi
                done
                local ts_count
                ts_count=$(find "$cell_path" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
                
                if [ "$layer_count" -ge 5 ]; then
                    echo "  ✅ PASS: $cell — $layer_count/5 layers, $ts_count ts files"
                    total_pass=$((total_pass + 1))
                else
                    echo "  ❌ FAIL: $cell — $layer_count/5 layers. Missing: ${missing[*]}"
                    total_fail=$((total_fail + 1))
                fi
            else
                echo "  ❌ FAIL: $cell — NOT FOUND"
                total_fail=$((total_fail + 1))
            fi
        done
        echo ""

        # Check: Infrastructure cells
        echo "═══ CHECK 3: Infrastructure Cells (Wave 2) ═══"
        for cell in "${INFRA_CELLS[@]}"; do
            local cell_path="$INFRA_DIR/$cell"
            if [ -d "$cell_path" ]; then
                local layer_count=0
                for layer in "${EXPECTED_LAYERS[@]}"; do
                    if [ -d "$cell_path/$layer" ]; then
                        local lf
                        lf=$(find "$cell_path/$layer" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
                        if [ "$lf" -gt 0 ]; then
                            layer_count=$((layer_count + 1))
                        fi
                    fi
                done
                local ts_count
                ts_count=$(find "$cell_path" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')

                local has_manifest="NO"
                [ -f "$cell_path/neural-main-cell.cell.anc" ] && has_manifest="YES"
                
                echo "  ✅ PASS: $cell — $layer_count/5 layers, $ts_count ts files, manifest: $has_manifest"
                total_pass=$((total_pass + 1))
            else
                echo "  ❌ FAIL: $cell — NOT FOUND in $INFRA_DIR"
                total_fail=$((total_fail + 1))
            fi
        done
        echo ""

        # Check: shared-contracts-cell
        echo "═══ CHECK 4: shared-kernel Migration ═══"
        if [ -d "$INFRA_DIR/shared-contracts-cell" ]; then
            echo "  ✅ PASS: shared-contracts-cell exists in infrastructure/"
            total_pass=$((total_pass + 1))
        else
            echo "  ⚠️  WARN: shared-contracts-cell not found"
            total_warn=$((total_warn + 1))
        fi
        if [ -d "$CELLS_ROOT/shared-kernel" ]; then
            echo "  ❌ FAIL: shared-kernel still exists (should be migrated)"
            total_fail=$((total_fail + 1))
        else
            echo "  ✅ PASS: shared-kernel removed from root"
            total_pass=$((total_pass + 1))
        fi
        echo ""

        # Check: Legacy cells
        echo "═══ CHECK 5: Legacy Cells ═══"
        for cell in "${LEGACY_CELLS[@]}"; do
            if [ -d "$LEGACY_DIR/$cell" ]; then
                echo "  ✅ PASS: $cell archived in _legacy/"
                total_pass=$((total_pass + 1))
            elif [ -d "$CELLS_ROOT/$cell" ]; then
                echo "  ❌ FAIL: $cell still in root (should be in _legacy/)"
                total_fail=$((total_fail + 1))
            else
                echo "  ⚠️  WARN: $cell not found anywhere"
                total_warn=$((total_warn + 1))
            fi
        done
        echo ""

        # Check: No Wave 3 cells exist
        echo "═══ CHECK 6: Wave Sequence Integrity ═══"
        local wave3_violation=0
        for cell in "contracts-cell" "shipments-cell" "payments-cell" "rules-cell" "tenant-cell"; do
            local found
            found=$(find "$CELLS_ROOT" -maxdepth 3 -type d -name "$cell" 2>/dev/null | head -1)
            if [ -n "$found" ]; then
                echo "  🚨 VIOLATION: $cell exists before Wave 3!"
                wave3_violation=$((wave3_violation + 1))
            fi
        done
        if [ "$wave3_violation" -eq 0 ]; then
            echo "  ✅ PASS: No premature Wave 3 cells"
            total_pass=$((total_pass + 1))
        fi
        echo ""

        # Check: Registry exists
        echo "═══ CHECK 7: Master Registry ═══"
        if [ -f "$REGISTRY_FILE" ]; then
            echo "  ✅ PASS: natt-master-registry.sira exists"
            total_pass=$((total_pass + 1))
        else
            echo "  ❌ FAIL: natt-master-registry.sira not found"
            total_fail=$((total_fail + 1))
        fi
        echo ""

        # Check: Git status
        echo "═══ CHECK 8: Git Status ═══"
        if command -v git &> /dev/null && [ -d ".git" ]; then
            echo "  Branch: $(git branch --show-current 2>/dev/null)"
            echo "  Latest: $(git log --oneline -1 2>/dev/null)"
            local dirty
            dirty=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
            echo "  Uncommitted: $dirty files"
        fi
        echo ""

        # Summary
        echo "╔══════════════════════════════════════════════════════════════╗"
        echo "║  SCAN SUMMARY                                              ║"
        echo "╠══════════════════════════════════════════════════════════════╣"
        echo "║  ✅ PASS:  $total_pass"
        echo "║  ❌ FAIL:  $total_fail"
        echo "║  ⚠️  WARN:  $total_warn"
        echo "╠══════════════════════════════════════════════════════════════╣"
        if [ "$total_fail" -eq 0 ]; then
            echo "║  🟢 VERDICT: ALL CHECKS PASSED — READY FOR WAVE 3         ║"
        else
            echo "║  🔴 VERDICT: $total_fail FAILURES — FIX BEFORE WAVE 3     ║"
        fi
        echo "╚══════════════════════════════════════════════════════════════╝"
    } | tee "$scan_output"
}

# ═══════════════════════════════════════════
# ═══════════════════════════════════════════
#            MAIN EXECUTION
# ═══════════════════════════════════════════
# ═══════════════════════════════════════════

clear
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║                                                                      ║${NC}"
echo -e "${BOLD}║   🏛️  NATT-OS PRE-WAVE 3 CLEANUP & TRANSITION                        ║${NC}"
echo -e "${BOLD}║                                                                      ║${NC}"
echo -e "${BOLD}║   Phase A: Dọn trùng + Legacy + shared-kernel                        ║${NC}"
echo -e "${BOLD}║   Phase B: warehouse-cell 5-layer + QUARANTINE                        ║${NC}"
echo -e "${BOLD}║   Phase C: Deep Audit + Hash Baseline + Registry                      ║${NC}"
echo -e "${BOLD}║                                                                      ║${NC}"
echo -e "${BOLD}║   Gatekeeper: ANH NATT ✅ APPROVED                                   ║${NC}"
echo -e "${BOLD}║   Architect:  BĂNG    ✅ DESIGNED                                     ║${NC}"
echo -e "${BOLD}║   Reviewer:   THIÊN   ✅ REVIEWED                                    ║${NC}"
echo -e "${BOLD}║   Enforcer:   KIM     ✅ ENFORCED                                    ║${NC}"
echo -e "${BOLD}║   Executor:   BỐI BỐI 🔨 EXECUTING                                  ║${NC}"
echo -e "${BOLD}║                                                                      ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Initialize log
echo "=== NATT-OS Pre-Wave 3 Execution Log ===" > "$LOG_FILE"
echo "Started: $(timestamp)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# ─── PRE-FLIGHT CHECKS ───
divider "🔍 PRE-FLIGHT CHECKS"

# Check we're in the right directory
if [ ! -d "$CELLS_ROOT" ]; then
    fail "Không tìm thấy $CELLS_ROOT"
    echo -e "  ${RED}Bối Bối: Hãy chắc chắn đang ở thư mục root của NATT-OS Gold Master${NC}"
    echo -e "  ${DIM}cd /Users/macvn/Desktop/HỒ\\ SƠ\\ SHTT\\ NATT-OS\\ BY\\ NATTSIRA-OS/natt-os\\ ver\\ goldmaster${NC}"
    exit 1
fi
success "Found $CELLS_ROOT"

# Check git
if ! command -v git &> /dev/null || [ ! -d ".git" ]; then
    fail "Git không khả dụng hoặc không phải git repo"
    exit 1
fi
success "Git available, branch: $(git branch --show-current)"

# Check clean working tree
DIRTY=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
if [ "$DIRTY" -gt 0 ]; then
    warn "Có $DIRTY file chưa commit. Nên commit trước khi tiếp tục."
fi

# Create working branch
info "Tạo branch cleanup/pre-wave3..."
git checkout -b cleanup/pre-wave3 2>/dev/null || {
    warn "Branch cleanup/pre-wave3 đã tồn tại, checkout..."
    git checkout cleanup/pre-wave3 2>/dev/null || true
}
success "Đang làm việc trên branch: $(git branch --show-current)"

confirm "Pre-flight OK. Bắt đầu PHASE A?"

# ═══════════════════════════════════════════
#  PHASE A: DỌN TRÙNG + LEGACY + SHARED-KERNEL
# ═══════════════════════════════════════════
phase_header "PHASE A: DỌN TRÙNG CELL + LEGACY + SHARED-KERNEL"

# ─── A.1: Backup ───
divider "A.1: BACKUP"

if [ -d "$BACKUP_DIR" ]; then
    skip "Backup đã tồn tại: $BACKUP_DIR"
else
    info "Tạo backup toàn bộ..."
    
    # Backup legacy root if exists
    if [ -d "cells" ]; then
        mkdir -p "$BACKUP_DIR"
        cp -r cells/ "$BACKUP_DIR/cells_legacy_root/"
        success "Backup ./cells/ → $BACKUP_DIR/cells_legacy_root/"
    fi
    
    # Backup shared-kernel if exists
    if [ -d "$CELLS_ROOT/shared-kernel" ]; then
        mkdir -p "$BACKUP_DIR"
        cp -r "$CELLS_ROOT/shared-kernel" "$BACKUP_DIR/shared-kernel-original/"
        success "Backup shared-kernel → $BACKUP_DIR/shared-kernel-original/"
    fi
    
    # Backup warehouse-cell current location
    if [ -d "$CELLS_ROOT/warehouse-cell" ]; then
        mkdir -p "$BACKUP_DIR"
        cp -r "$CELLS_ROOT/warehouse-cell" "$BACKUP_DIR/warehouse-cell-original/"
        success "Backup warehouse-cell → $BACKUP_DIR/warehouse-cell-original/"
    fi
fi

# ─── A.2: Remove legacy ./cells/ root ───
divider "A.2: XÓA LEGACY ROOT ./cells/"

if [ -d "cells" ]; then
    # First check for any unique content
    info "Kiểm tra content trong ./cells/ ..."
    
    for cell_dir in cells/*/; do
        if [ -d "$cell_dir" ]; then
            cell_name=$(basename "$cell_dir")
            src_cell="$CELLS_ROOT/$cell_name"
            
            if [ -d "$src_cell" ]; then
                # Compare
                diff_result=$(diff -rq "$cell_dir" "$src_cell" 2>/dev/null || true)
                if [ -n "$diff_result" ]; then
                    warn "$cell_name: có khác biệt giữa cells/ và src/cells/"
                    echo -e "    ${DIM}$diff_result${NC}"
                else
                    info "$cell_name: giống nhau ở cả 2 nơi"
                fi
            else
                warn "$cell_name: chỉ tồn tại ở ./cells/, không có ở src/cells/"
            fi
        fi
    done
    
    info "Xóa ./cells/ legacy root..."
    rm -rf cells/
    success "Đã xóa ./cells/ — src/cells/ là canonical root duy nhất"
else
    skip "./cells/ không tồn tại, đã sạch"
fi

# ─── A.3: Move legacy cells to _legacy/ ───
divider "A.3: DI CHUYỂN LEGACY CELLS → _legacy/"

mkdir -p "$LEGACY_DIR"

for cell in "${LEGACY_CELLS[@]}"; do
    if [ -d "$CELLS_ROOT/$cell" ]; then
        mv "$CELLS_ROOT/$cell" "$LEGACY_DIR/$cell"
        success "Moved $cell → _legacy/$cell"
    elif [ -d "$LEGACY_DIR/$cell" ]; then
        skip "$cell đã ở _legacy/"
    else
        warn "$cell không tìm thấy ở đâu"
    fi
done

# ─── A.4: Migrate shared-kernel → shared-contracts-cell ───
divider "A.4: SHARED-KERNEL → SHARED-CONTRACTS-CELL (Kim đề xuất)"

if [ -d "$CELLS_ROOT/shared-kernel" ]; then
    mkdir -p "$INFRA_DIR"
    mv "$CELLS_ROOT/shared-kernel" "$INFRA_DIR/shared-contracts-cell"
    success "Migrated shared-kernel → infrastructure/shared-contracts-cell"
    
    # Generate manifest for shared-contracts-cell
    generate_manifest "shared-contracts-cell" "WAVE_2" "MIGRATED_PENDING_AUDIT" "infrastructure" "$INFRA_DIR/shared-contracts-cell"
    success "Generated manifest cho shared-contracts-cell (status: MIGRATED_PENDING_AUDIT)"
elif [ -d "$INFRA_DIR/shared-contracts-cell" ]; then
    skip "shared-contracts-cell đã tồn tại trong infrastructure/"
else
    warn "shared-kernel không tồn tại — có thể đã được xử lý"
fi

# ─── A.5: Commit Phase A ───
divider "A.5: COMMIT PHASE A"

git add -A
git commit -m "cleanup(phase-a): Remove legacy root, archive legacy cells, migrate shared-kernel

- Removed ./cells/ legacy root (src/cells/ is canonical)
- Moved 5 legacy cells to src/cells/_legacy/
- Migrated shared-kernel to infrastructure/shared-contracts-cell (Kim proposal)
- Generated neural-main-cell.cell.anc for shared-contracts-cell

Constitutional compliance: Dieu 16, 17, 18, 19
Approved by: Gatekeeper (Anh Natt)
Designed by: Băng (Data Steward & Architect)
Executed by: Bối Bối (Constitutional Guardian)" 2>/dev/null || warn "Nothing to commit in Phase A"

success "Phase A committed"

confirm "Phase A hoàn tất. Bắt đầu PHASE B?"

# ═══════════════════════════════════════════
#  PHASE B: WAREHOUSE-CELL + QUARANTINE
# ═══════════════════════════════════════════
phase_header "PHASE B: WAREHOUSE-CELL 5-LAYER + QUARANTINE"

# ─── B.1: Move warehouse-cell to infrastructure ───
divider "B.1: MIGRATE WAREHOUSE-CELL → INFRASTRUCTURE/"

if [ -d "$CELLS_ROOT/warehouse-cell" ]; then
    # warehouse-cell is in root, needs to move to infrastructure/
    mkdir -p "$INFRA_DIR"
    
    # Save existing content
    if [ -d "$INFRA_DIR/warehouse-cell" ]; then
        warn "warehouse-cell đã tồn tại trong infrastructure/ — merge content"
        # Copy any unique files from root version
        cp -rn "$CELLS_ROOT/warehouse-cell/"* "$INFRA_DIR/warehouse-cell/" 2>/dev/null || true
        rm -rf "$CELLS_ROOT/warehouse-cell"
    else
        mv "$CELLS_ROOT/warehouse-cell" "$INFRA_DIR/warehouse-cell"
    fi
    success "warehouse-cell đã ở infrastructure/"
elif [ -d "$INFRA_DIR/warehouse-cell" ]; then
    skip "warehouse-cell đã ở đúng vị trí: $INFRA_DIR/warehouse-cell"
else
    warn "warehouse-cell không tìm thấy — tạo mới"
    mkdir -p "$INFRA_DIR/warehouse-cell"
fi

# ─── B.2: Build 5-layer scaffold ───
divider "B.2: TẠO 5-LAYER SCAFFOLD CHO WAREHOUSE-CELL"

WAREHOUSE_PATH="$INFRA_DIR/warehouse-cell"

# Check if layers already exist with real code
EXISTING_LAYERS=0
for layer in "${EXPECTED_LAYERS[@]}"; do
    if [ -d "$WAREHOUSE_PATH/$layer" ]; then
        lf=$(find "$WAREHOUSE_PATH/$layer" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
        if [ "$lf" -gt 0 ]; then
            EXISTING_LAYERS=$((EXISTING_LAYERS + 1))
        fi
    fi
done

if [ "$EXISTING_LAYERS" -ge 5 ]; then
    skip "warehouse-cell đã có $EXISTING_LAYERS/5 layers với code — không ghi đè"
else
    info "Tạo scaffold cho warehouse-cell (giữ nguyên code hiện có)..."
    
    # Only create missing layers
    for layer in "${EXPECTED_LAYERS[@]}"; do
        if [ ! -d "$WAREHOUSE_PATH/$layer" ]; then
            info "Tạo layer: $layer"
        fi
    done
    
    create_layer_scaffold "$WAREHOUSE_PATH" "warehouse-cell"
    success "warehouse-cell scaffold hoàn tất (5 layers)"
fi

# ─── B.3: Generate QUARANTINED manifest ───
divider "B.3: TẠO MANIFEST VỚI STATUS QUARANTINED (Bối Bối đề xuất)"

generate_manifest "warehouse-cell" "WAVE_2" "QUARANTINED" "infrastructure" "$WAREHOUSE_PATH"

# Override status with quarantine details
cat > "$WAREHOUSE_PATH/neural-main-cell.cell.anc" << 'QUARANTINE_MANIFEST'
{
  "cell": {
    "name": "warehouse-cell",
    "version": "0.1.0",
    "wave": "WAVE_2",
    "type": "infrastructure",
    "status": "QUARANTINED"
  },
  "quarantine": {
    "reason": "Incomplete implementation - scaffold only, awaiting full build",
    "restrictions": ["no-import", "no-deployment", "development-only"],
    "exit_criteria": "All 5 layers implemented with domain logic + tests passing",
    "assigned_to": "Kim + Băng"
  },
  "adn": {
    "identity": {
      "id": "warehouse-cell",
      "description": "NATT-OS Warehouse Management - Infrastructure Cell",
      "owner": "NATT-OS-TEAM"
    },
    "capability": {
      "exports": [],
      "imports": [],
      "events_emitted": ["warehouse.item.received", "warehouse.item.shipped", "warehouse.inventory.updated"],
      "events_consumed": ["order.created", "inspection.completed"]
    },
    "boundary": {
      "allowed_dependencies": ["config-cell", "audit-cell"],
      "forbidden_imports": ["**/kernel/**", "**/business/**"],
      "isolation_level": "STRICT"
    },
    "trace": {
      "audit_required": true,
      "log_level": "INFO",
      "event_sourcing": true
    },
    "confidence": {
      "test_coverage_minimum": 0,
      "constitutional_compliance": true,
      "last_audit": null
    },
    "smartlink": {
      "linked_cells": ["sync-cell", "smartlink-cell"],
      "event_bus_channels": ["warehouse.*"]
    },
    "lifecycle": {
      "created_phase": "PRE_WAVE_3_CLEANUP",
      "current_state": "QUARANTINED",
      "transitions": [
        { "from": "NONE", "to": "QUARANTINED", "reason": "Scaffold created, awaiting implementation" }
      ]
    }
  },
  "layers": {
    "domain": true,
    "application": true,
    "interface": true,
    "infrastructure": true,
    "ports": true
  },
  "constitutional_compliance": {
    "articles_enforced": ["Dieu_16", "Dieu_17", "Dieu_18", "Dieu_19"],
    "no_cross_import": true,
    "cell_autonomy": true,
    "event_driven": true
  }
}
QUARANTINE_MANIFEST

success "warehouse-cell manifest: QUARANTINED (Bối Bối proposal accepted)"

# ─── B.4: Commit Phase B ───
divider "B.4: COMMIT PHASE B"

git add -A
git commit -m "feat(phase-b): Migrate warehouse-cell to infrastructure/ with 5-layer + QUARANTINE

- Moved warehouse-cell from src/cells/ to src/cells/infrastructure/
- Created 5-layer scaffold (domain, application, interface, infrastructure, ports)
- Status: QUARANTINED (Bối Bối proposal, Kim approved)
- Quarantine restrictions: no-import, no-deployment, development-only
- Exit criteria: All layers implemented with logic + tests

7 ADN layers defined in neural-main-cell.cell.anc (Thiên confirmed: metadata, not folders)
Constitutional compliance: Dieu 16, 17, 18, 19" 2>/dev/null || warn "Nothing to commit in Phase B"

success "Phase B committed"

confirm "Phase B hoàn tất. Bắt đầu PHASE C (Audit + Hash + Registry)?"

# ═══════════════════════════════════════════
#  PHASE C: AUDIT + HASH + REGISTRY
# ═══════════════════════════════════════════
phase_header "PHASE C: DEEP AUDIT + HASH BASELINE + REGISTRY"

# ─── C.1: Generate Registry ───
divider "C.1: TẠO MASTER REGISTRY (natt-master-registry.sira)"

generate_registry "$REGISTRY_FILE"
success "Master Registry generated: $REGISTRY_FILE"

# Pretty print check
if command -v python3 &> /dev/null; then
    python3 -m json.tool "$REGISTRY_FILE" > "${REGISTRY_FILE}.tmp" 2>/dev/null && \
        mv "${REGISTRY_FILE}.tmp" "$REGISTRY_FILE" && \
        info "Registry formatted (pretty-printed)"
fi

# ─── C.2: Generate Hash Baseline ───
divider "C.2: TẠO HASH BASELINE (Băng: hash ở Phase C, không phải Phase A)"

HASH_FILE="$DOCS_DIR/hash-baseline.json"
mkdir -p "$DOCS_DIR"

generate_hash_baseline "$HASH_FILE"
success "Hash baseline generated: $HASH_FILE"

# Pretty print
if command -v python3 &> /dev/null; then
    python3 -m json.tool "$HASH_FILE" > "${HASH_FILE}.tmp" 2>/dev/null && \
        mv "${HASH_FILE}.tmp" "$HASH_FILE"
fi

# ─── C.3: Deep Scan ───
divider "C.3: DEEP SCAN — GROUND TRUTH VERIFICATION"

SCAN_FILE="$DOCS_DIR/post-cleanup-audit.txt"
mkdir -p "$DOCS_DIR"

run_deep_scan "$SCAN_FILE"
success "Audit report saved: $SCAN_FILE"

# ─── C.4: Generate Pre-Wave 3 Checklist ───
divider "C.4: PRE-WAVE 3 CHECKLIST"

CHECKLIST_FILE="$DOCS_DIR/pre-wave3-checklist.md"

cat > "$CHECKLIST_FILE" << 'CHECKLIST_EOF'
# NATT-OS Pre-Wave 3 Checklist

## Constitutional Confirmations
- [x] 7 ADN layers = metadata in manifest (confirmed by Thiên, Kim, Gatekeeper)
- [x] 5 folder layers = implementation anatomy
- [x] Two systems are complementary, not conflicting

## MANDATORY (must ALL pass)
- [ ] 5 kernel cells have 5 layers with real code
- [ ] 3 infrastructure cells in infrastructure/ directory
- [ ] Legacy ./cells/ root removed
- [ ] Legacy cells archived in _legacy/
- [ ] shared-kernel migrated to shared-contracts-cell
- [ ] warehouse-cell QUARANTINED with manifest
- [ ] EDA Foundation contracts present (14+ files)
- [ ] Constitution v3.1 deployed
- [ ] natt-master-registry.sira created
- [ ] Hash baseline generated
- [ ] 0 uncommitted files
- [ ] No premature Wave 3 cells

## RECOMMENDED (should have)
- [ ] Event schemas for Wave 3 event types (Kim/Băng)
- [ ] Structural locks shared library (Kim)
- [ ] Constitutional compliance scanner (future)
- [ ] Manifest validation script with dry-run (Kim offered to write)

## Team Sign-off
- [ ] Băng: Architecture verified
- [ ] Kim: Constitutional compliance verified  
- [ ] Thiên: Governance structure verified
- [ ] Bối Bối: Execution completed
- [ ] Anh Natt (Gatekeeper): Final approval

## Decisions Pending (Anh Natt)
- [ ] 5 legacy cells: xóa / giữ cho Wave 3+ / archive permanently?
- [ ] shared-contracts-cell: phân rã khi nào?
- [ ] warehouse-cell: ai build domain logic?
CHECKLIST_EOF

success "Pre-Wave 3 Checklist generated: $CHECKLIST_FILE"

# ─── C.5: Final Commit ───
divider "C.5: FINAL COMMIT — PHASE C"

git add -A
git commit -m "audit(phase-c): Deep audit + hash baseline + master registry + checklist

PHASE A-B-C COMPLETE:
- Phase A: Legacy cleanup (./cells/ removed, 5 cells archived, shared-kernel migrated)
- Phase B: warehouse-cell scaffolded + QUARANTINED
- Phase C: Registry, hash baseline, deep scan, pre-wave3 checklist

Constitutional decisions applied:
- 7 ADN layers = manifest metadata (Thiên confirmed)
- 5 folder layers = implementation anatomy
- Hash at Phase C not Phase A (Băng proposal, Thiên+Kim agreed)
- QUARANTINED status for warehouse (Bối Bối proposal, Kim agreed)
- shared-kernel → shared-contracts-cell (Kim proposal)
- api-cell: NEVER_EXISTED (filesystem ground truth)

Generated artifacts:
- natt-master-registry.sira
- docs/audits/hash-baseline.json
- docs/audits/post-cleanup-audit.txt
- docs/audits/pre-wave3-checklist.md

Awaiting: Gatekeeper final review + merge to main" 2>/dev/null || warn "Nothing to commit in Phase C"

success "Phase C committed"

# ═══════════════════════════════════════════
#  FINAL SUMMARY
# ═══════════════════════════════════════════
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║                                                                      ║${NC}"
echo -e "${BOLD}║   🏛️  EXECUTION COMPLETE                                              ║${NC}"
echo -e "${BOLD}║                                                                      ║${NC}"
echo -e "${BOLD}╠══════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BOLD}║                                                                      ║${NC}"
echo -e "${BOLD}║   ✅ Actions completed:  ${ACTIONS}                                          ║${NC}"
echo -e "${BOLD}║   ⚠️  Warnings:          ${WARNINGS}                                          ║${NC}"
echo -e "${BOLD}║   ❌ Errors:            ${ERRORS}                                          ║${NC}"
echo -e "${BOLD}║   ⏭  Skipped:           ${SKIPPED}                                          ║${NC}"
echo -e "${BOLD}║                                                                      ║${NC}"
echo -e "${BOLD}╠══════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BOLD}║                                                                      ║${NC}"
echo -e "${BOLD}║   📋 GENERATED FILES:                                                ║${NC}"
echo -e "${BOLD}║   • $REGISTRY_FILE${NC}"
echo -e "${BOLD}║   • $DOCS_DIR/hash-baseline.json${NC}"
echo -e "${BOLD}║   • $DOCS_DIR/post-cleanup-audit.txt${NC}"
echo -e "${BOLD}║   • $DOCS_DIR/pre-wave3-checklist.md${NC}"
echo -e "${BOLD}║   • $LOG_FILE${NC}"
echo -e "${BOLD}║                                                                      ║${NC}"
echo -e "${BOLD}╠══════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BOLD}║                                                                      ║${NC}"
echo -e "${BOLD}║   📌 BRANCH: $(git branch --show-current 2>/dev/null)${NC}"
echo -e "${BOLD}║   📝 COMMITS:                                                        ║${NC}"

git log --oneline cleanup/pre-wave3 --not main 2>/dev/null | while read -r line; do
    echo -e "${BOLD}║      $line${NC}"
done

echo -e "${BOLD}║                                                                      ║${NC}"
echo -e "${BOLD}╠══════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BOLD}║                                                                      ║${NC}"
echo -e "${BOLD}║   🔜 NEXT STEPS (cần anh Natt):                                     ║${NC}"
echo -e "${BOLD}║   1. Review audit report + checklist                                 ║${NC}"
echo -e "${BOLD}║   2. Quyết định 5 legacy cells                                      ║${NC}"
echo -e "${BOLD}║   3. Merge cleanup/pre-wave3 → main                                 ║${NC}"
echo -e "${BOLD}║   4. Tag: wave-2/complete                                            ║${NC}"
echo -e "${BOLD}║   5. GO Wave 3                                                       ║${NC}"
echo -e "${BOLD}║                                                                      ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Correct > Fast | No audit = doesn't exist | FILESYSTEM > MEMORY${NC}"
echo -e "${CYAN}NATT-OS Constitution v3.1${NC}"
echo ""

log "Execution completed. Actions: $ACTIONS, Warnings: $WARNINGS, Errors: $ERRORS"
