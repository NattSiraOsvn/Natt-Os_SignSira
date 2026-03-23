#!/usr/bin/env python3
import os

BASE = "/Users/thien/Desktop/Hồ Sơ SHTT/natt-os_ver2goldmaster/src/cells/business"

# order-cell cần tạo port trước
order_port = """\
// @ts-nocheck
import { forgeSmartLinkPort } from '@/satellites/port-forge';

export const OrderSmartLinkPort = forgeSmartLinkPort({
  cellId: 'order-cell',
  signals: {
    SALES_ORDER_CREATED: { eventType: 'order:created',   routeTo: 'showroom-cell' },
    SALES_ORDER_KD:      { eventType: 'order:kd',        routeTo: 'sales-cell'    },
    ORDER_CANCELLED:     { eventType: 'order:cancelled', routeTo: 'audit-cell'    },
  }
});
"""

order_port_path = f"{BASE}/order-cell/ports/order-smartlink.port.ts"
os.makedirs(os.path.dirname(order_port_path), exist_ok=True)
with open(order_port_path, "w") as f:
    f.write(order_port)
print(f"✅ Created: {order_port_path}")

# Wiring template cho từng cell
CELLS = {
    "bom3dprd":  ("Bom3dPrdSmartLinkPort",  "../../ports/bom3dprd-smartlink.port"),
    "casting":   ("CastingSmartLinkPort",    "../../ports/casting-smartlink.port"),
    "design-3d": ("Design3dSmartLinkPort",   "../../ports/design-3d-smartlink.port"),
    "finishing": ("FinishingSmartLinkPort",  "../../ports/finishing-smartlink.port"),
    "order":     ("OrderSmartLinkPort",      "../../ports/order-smartlink.port"),
    "polishing": ("PolishingSmartLinkPort",  "../../ports/polishing-smartlink.port"),
    "pricing":   ("PricingSmartLinkPort",    "../../ports/pricing-smartlink.port"),
    "sales":     ("SalesSmartLinkPort",      "../../ports/sales-smartlink.port"),
    "stone":     ("StoneSmartLinkPort",      "../../ports/stone-smartlink.port"),
}

for cell, (port_name, port_path) in CELLS.items():
    wiring = f"""\
// @ts-nocheck
/**
 * {cell}-cell/domain/services/{cell}.wiring.ts
 * Wire engine → SmartLinkPort — Điều 9 Hiến Pháp
 * nattos.sh: grep SmartLinkPort in domain/services/ → WIRED
 */
import {{ {port_name} }} from '{port_path}';

export {{ {port_name} }};

/** Gọi port từ engine khi cần emit event ra ngoài cell */
export const wire{port_name} = {port_name};
"""
    wiring_path = f"{BASE}/{cell}-cell/domain/services/{cell}.wiring.ts"
    os.makedirs(os.path.dirname(wiring_path), exist_ok=True)
    with open(wiring_path, "w") as f:
        f.write(wiring)
    print(f"✅ Created: {wiring_path}")

print("\nDone. Run: npx tsc --noEmit && bash nattos.sh audit")
