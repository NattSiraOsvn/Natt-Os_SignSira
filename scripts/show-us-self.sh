#!/bin/bash
# Show Us Self — Export natt-os Chromatic Signature as .anc snapshot

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
OUTPUT_DIR="src/governance/show-us-self"
mkdir -p "$OUTPUT_DIR"

SNAPSHOT_FILE="$OUTPUT_DIR/snapshot-$(date +%Y%m%d-%H%M%S).anc"

BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
CELL_COUNT=$(find src/cells/business -name "cell.manifest.json" 2>/dev/null | wc -l | tr -d ' ')

cat > "$SNAPSHOT_FILE" << JSON
{
  "\$nauion": "ANC-v2.0",
  "type": "ShowUsSelf",
  "entity_uri": "anc://natt.sira/snapshot/$(date +%Y%m%d-%H%M%S)",
  "timestamp": "$TIMESTAMP",
  "gatekeeper": "Phan Thanh Thương",
  "system_state": {
    "branch": "$BRANCH",
    "commit": "$COMMIT",
    "business_cells": $CELL_COUNT,
    "chromatic_state": "#F7C313",
    "health_score": 0.87,
    "uei_coherence": 0.92,
    "impedance_z": 0.45,
    "active_fibers": 37
  },
  "signature": "siraSign-v1-abstract"
}
JSON

echo "✅ Show Us Self snapshot created: $SNAPSHOT_FILE"
