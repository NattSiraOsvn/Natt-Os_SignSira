export type generic_audit_level = "minimal" | "partial" | "full";
export type generic_frame_level = "none" | "shape" | "required";

export type generic_screen_binding_for_gate = {
  screen_id: string;
  domain: string;
  route: string;
  cell_binding: string;
  audit: generic_audit_level;
  sirasign: generic_frame_level;
  status: "manifested";
};

export type generic_gate_guard =
  | "gate_required_frame"
  | "gate_shape_frame"
  | "gate_minimal_read"
  | "gate_session_read";

export type generic_route_gate_entry = {
  screen_id: string;
  domain: string;
  route: string;
  cell_binding: string;
  audit: generic_audit_level;
  sirasign: generic_frame_level;
  gate_guard: generic_gate_guard;
  status: "manifested";
};

export type generic_route_gate_compile_result = {
  ok: boolean;
  total_routes: number;
  entries: generic_route_gate_entry[];
  errors: string[];
};

const allowed_audit_levels: readonly generic_audit_level[] = ["minimal", "partial", "full"];
const allowed_frame_levels: readonly generic_frame_level[] = ["none", "shape", "required"];

function is_valid_audit_level(value: string): value is generic_audit_level {
  return allowed_audit_levels.includes(value as generic_audit_level);
}

function is_valid_frame_level(value: string): value is generic_frame_level {
  return allowed_frame_levels.includes(value as generic_frame_level);
}

export function compile_generic_gate_guard(input: {
  audit: generic_audit_level;
  sirasign: generic_frame_level;
}): generic_gate_guard {
  if (input.sirasign === "required") {
    return "gate_required_frame";
  }

  if (input.sirasign === "shape") {
    return "gate_shape_frame";
  }

  if (input.audit === "minimal") {
    return "gate_minimal_read";
  }

  return "gate_session_read";
}

function validate_screen_for_route_gate(screen: generic_screen_binding_for_gate): string[] {
  const errors: string[] = [];
  const label = screen.screen_id || "unknown_screen";

  if (!/^PL-\d{3}$/.test(screen.screen_id)) {
    errors.push(`${label}: invalid screen_id`);
  }

  if (!screen.route || !screen.route.startsWith("/")) {
    errors.push(`${label}: route must start with slash`);
  }

  if (screen.route && screen.route.includes(" ")) {
    errors.push(`${label}: route must not contain spaces`);
  }

  if (!screen.cell_binding || !screen.cell_binding.startsWith("cell_")) {
    errors.push(`${label}: cell_binding must start with cell_`);
  }

  if (!is_valid_audit_level(screen.audit)) {
    errors.push(`${label}: invalid audit level`);
  }

  if (!is_valid_frame_level(screen.sirasign)) {
    errors.push(`${label}: invalid sirasign level`);
  }

  if (screen.status !== "manifested") {
    errors.push(`${label}: status must remain manifested`);
  }

  return errors;
}

export function compile_generic_route_gate_matrix(
  screens: generic_screen_binding_for_gate[]
): generic_route_gate_compile_result {
  const errors: string[] = [];
  const entries: generic_route_gate_entry[] = [];
  const route_set = new Set<string>();
  const screen_set = new Set<string>();

  for (const screen of screens) {
    errors.push(...validate_screen_for_route_gate(screen));

    if (screen_set.has(screen.screen_id)) {
      errors.push(`${screen.screen_id}: duplicate screen_id`);
    }

    if (route_set.has(screen.route)) {
      errors.push(`${screen.screen_id}: duplicate route`);
    }

    screen_set.add(screen.screen_id);
    route_set.add(screen.route);

    entries.push({
      screen_id: screen.screen_id,
      domain: screen.domain,
      route: screen.route,
      cell_binding: screen.cell_binding,
      audit: screen.audit,
      sirasign: screen.sirasign,
      gate_guard: compile_generic_gate_guard({
        audit: screen.audit,
        sirasign: screen.sirasign,
      }),
      status: screen.status,
    });
  }

  return {
    ok: errors.length === 0,
    total_routes: entries.length,
    entries,
    errors,
  };
}

export function summarize_generic_gate_guards(entries: generic_route_gate_entry[]): Record<generic_gate_guard, number> {
  return entries.reduce<Record<generic_gate_guard, number>>((acc, entry) => {
    acc[entry.gate_guard] = (acc[entry.gate_guard] || 0) + 1;
    return acc;
  }, {
    gate_required_frame: 0,
    gate_shape_frame: 0,
    gate_minimal_read: 0,
    gate_session_read: 0,
  });
}
