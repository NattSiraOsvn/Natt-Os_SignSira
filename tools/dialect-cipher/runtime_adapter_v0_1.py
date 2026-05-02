import json
from pathlib import Path

RULES_PATH = Path("src/governance/registry/dialect_rules_v0_1.na")
PROTECTED_PATH = Path("src/governance/registry/protected_tokens_v0_1.na")

MIRROR = {
    "C0": "C7",
    "C1": "C6",
    "C2": "C5",
    "C3": "C4",
    "C4": "C3",
    "C5": "C2",
    "C6": "C1",
    "C7": "C0",
}

TONE_TO_COLOR = {
    "T0": "C0",
    "T1": "C1",
    "T2": "C2",
    "T3": "C3",
    "T4": "C4",
    "T5": "C5",
    "CTRL_ESCAPE": "C6",
    "CTRL_PARITY": "C7",
}


class RuntimeAdapter:
    def __init__(self, rules_path: Path = RULES_PATH, protected_path: Path = PROTECTED_PATH) -> None:
        self.rules_doc = json.loads(rules_path.read_text("utf-8"))
        self.protected_doc = json.loads(protected_path.read_text("utf-8"))
        self.rule_index = {row["rime_rule_id"]: int(row["rime_rule_index"]) for row in self.rules_doc["rules"]}
        self.protected_tokens = {row["token"] for row in self.protected_doc["records"]}

    def compute_parity(self, rime_rule_index: int, tone_index: int, color_class: str, polarity: str) -> int:
        color_index = int(color_class.replace("C", ""))
        polarity_bit = 1 if polarity == "INVERTED" else 0
        return (int(rime_rule_index) ^ int(tone_index) ^ color_index ^ polarity_bit) % 2

    def _expected_mirror(self, color_class: str) -> str:
        if color_class not in MIRROR:
            raise ValueError(f"unknown color_class: {color_class}")
        return MIRROR[color_class]

    def encode(
        self,
        origin_text: str,
        base_surface: str,
        cipher_surface: str,
        rime_rule_id: str,
        tone_code: str,
        tone_index: int,
        color_class: str,
        polarity: str = "NORMAL",
    ) -> dict:
        if rime_rule_id not in self.rule_index:
            raise ValueError(f"unknown rule: {rime_rule_id}")
        expected_color = TONE_TO_COLOR.get(tone_code)
        if expected_color != color_class:
            raise ValueError(f"tone/color mismatch: {tone_code} -> {expected_color}, got {color_class}")

        protected_flag = rime_rule_id == "R_PROTECTED"
        if protected_flag:
            if origin_text not in self.protected_tokens:
                raise ValueError(f"protected token missing from registry: {origin_text}")
            if tone_code != "CTRL_ESCAPE":
                raise ValueError("protected token must use CTRL_ESCAPE")
            if color_class != "C6":
                raise ValueError("protected token must use C6")

        mirror_class = self._expected_mirror(color_class)
        rime_rule_index = self.rule_index[rime_rule_id]
        parity_bit = self.compute_parity(rime_rule_index, tone_index, color_class, polarity)
        decode_key = f"{base_surface}|{rime_rule_id}|{color_class}"

        return {
            "origin_text": origin_text,
            "base_surface": base_surface,
            "cipher_surface": cipher_surface,
            "rime_rule_id": rime_rule_id,
            "rime_rule_index": rime_rule_index,
            "tone_code": tone_code,
            "tone_index": tone_index,
            "color_class": color_class,
            "mirror_class": mirror_class,
            "polarity": polarity,
            "protected_flag": protected_flag,
            "decode_key": decode_key,
            "parity_bit": parity_bit,
            "row_hmac_ref": "required",
        }

    def encode_vector(self, row: dict) -> dict:
        return self.encode(
            origin_text=row["origin_text"],
            base_surface=row["base_surface"],
            cipher_surface=row["cipher_surface"],
            rime_rule_id=row["rime_rule_id"],
            tone_code=row["tone_code"],
            tone_index=int(row["tone_index"]),
            color_class=row["color_class"],
            polarity=row.get("polarity", "NORMAL"),
        )

    def validate_frame(self, frame: dict) -> dict:
        if frame["rime_rule_id"] not in self.rule_index:
            raise ValueError("frame references unknown rule")
        expected_color = TONE_TO_COLOR.get(frame["tone_code"])
        if expected_color != frame["color_class"]:
            raise ValueError("frame tone/color mismatch")
        if frame["mirror_class"] != self._expected_mirror(frame["color_class"]):
            raise ValueError("frame mirror_class mismatch")
        expected_parity = self.compute_parity(
            self.rule_index[frame["rime_rule_id"]],
            int(frame["tone_index"]),
            frame["color_class"],
            frame.get("polarity", "NORMAL"),
        )
        if int(frame["parity_bit"]) != expected_parity:
            raise ValueError("frame parity mismatch")
        if frame["rime_rule_id"] == "R_PROTECTED":
            if frame["origin_text"] not in self.protected_tokens:
                raise ValueError("protected frame token not in registry")
            if frame["color_class"] != "C6":
                raise ValueError("protected frame must use C6")
        return {"status": "PASS", "decode_key": frame["decode_key"]}

    def decode(self, frame: dict) -> dict:
        self.validate_frame(frame)
        return {
            "origin_text": frame["origin_text"],
            "cipher_surface": frame["cipher_surface"],
            "decode_key": frame["decode_key"],
            "protected_flag": frame["protected_flag"],
        }
