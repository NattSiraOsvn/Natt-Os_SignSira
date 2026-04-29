#!/usr/bin/env bash
# sirasign_lineage.sh - ký Sirawat lineage HMAC vào file canonical
# Authority: anh Natt Gatekeeper only. Passphrase NEVER stored.
# Usage: ./tools/sirasign_lineage.sh sign <file>
#        ./tools/sirasign_lineage.sh verify <file>
#        ./tools/sirasign_lineage.sh sign_all <pattern>

set -euo pipefail

SEAL_BEGIN="==SIRAWAT_LINEAGE_SEAL=="
SEAL_END="==END_SIRAWAT_LINEAGE_SEAL=="

read_passphrase() {
    if [ -z "${SIRAWAT_PASSPHRASE:-}" ]; then
        echo "Nhập passphrase Sirawat lineage (terminal KHÔNG echo):" >&2
        read -s SIRAWAT_PASSPHRASE
        export SIRAWAT_PASSPHRASE
        echo "" >&2
    fi
}

strip_existing_seal() {
    awk -v B="$SEAL_BEGIN" -v E="$SEAL_END" '
        $0 == B { skip=1; next }
        $0 == E { skip=0; next }
        !skip { print }
    ' "$1"
}

compute_hmac() {
    local content="$1"
    local pass="$2"
    python3 -c "
import hmac, hashlib, sys
content = sys.stdin.buffer.read()
pass_bytes = '$pass'.encode('utf-8')
h = hmac.new(pass_bytes, content, hashlib.sha256)
print(h.hexdigest())
" <<< "$content"
}

sign_file() {
    local f="$1"
    read_passphrase
    
    local content
    content="$(strip_existing_seal "$f")"
    
    local salt
    salt="$(python3 -c "import secrets; print(secrets.token_hex(16))")"
    
    local timestamp
    timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    
    local hmac_input="${content}
SALT:${salt}
TIMESTAMP:${timestamp}"
    
    local hash
    hash="$(compute_hmac "$hmac_input" "$SIRAWAT_PASSPHRASE")"
    
    {
        echo "$content"
        echo ""
        echo "$SEAL_BEGIN"
        echo "@version sirasign_lineage_v1"
        echo "@algo HMAC-SHA256(content+salt+timestamp, sirawat_passphrase)"
        echo "@salt ${salt}"
        echo "@signed_at ${timestamp}"
        echo "@signed_by anh_natt_gatekeeper"
        echo "@verifiable_by sirawat_lineage_only"
        echo "@hash ${hash}"
        echo "$SEAL_END"
    } > "${f}.tmp"
    
    mv "${f}.tmp" "$f"
    echo "SEALED: $f"
}

verify_file() {
    local f="$1"
    read_passphrase
    
    local salt
    salt="$(grep "^@salt " "$f" | head -1 | awk '{print $2}')"
    local timestamp
    timestamp="$(grep "^@signed_at " "$f" | head -1 | awk '{print $2}')"
    local stored_hash
    stored_hash="$(grep "^@hash " "$f" | head -1 | awk '{print $2}')"
    
    if [ -z "$salt" ] || [ -z "$timestamp" ] || [ -z "$stored_hash" ]; then
        echo "VERIFY_FAIL: $f - no seal found"
        return 1
    fi
    
    local content
    content="$(strip_existing_seal "$f")"
    
    local hmac_input="${content}
SALT:${salt}
TIMESTAMP:${timestamp}"
    
    local computed_hash
    computed_hash="$(compute_hmac "$hmac_input" "$SIRAWAT_PASSPHRASE")"
    
    if [ "$computed_hash" = "$stored_hash" ]; then
        echo "VERIFY_PASS: $f"
        return 0
    else
        echo "VERIFY_FAIL: $f"
        echo "  expected: $stored_hash"
        echo "  computed: $computed_hash"
        return 1
    fi
}

case "${1:-help}" in
    sign)
        sign_file "$2"
        ;;
    verify)
        verify_file "$2"
        ;;
    sign_all)
        read_passphrase
        for f in $(find docs/specs/nauion-runtime/ -name "*.na" -type f); do
            sign_file "$f"
        done
        ;;
    *)
        echo "Usage:"
        echo "  $0 sign <file>"
        echo "  $0 verify <file>"
        echo "  $0 sign_all   (sign all docs/specs/nauion-runtime/*.na)"
        echo ""
        echo "Passphrase nhập qua terminal (read -s, KHÔNG echo)."
        echo "Hoặc set env: SIRAWAT_PASSPHRASE=xxx $0 sign <file>"
        ;;
esac
