import json
from pathlib import Path
from importlib.util import spec_from_file_location, module_from_spec

RUNTIME_ADAPTER_PATH = Path("tools/dialect-cipher/runtime_adapter_v0_1.py")

def load_runtime_adapter():
    spec = spec_from_file_location("runtime_adapter_v0_1", RUNTIME_ADAPTER_PATH)
    mod = module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.RuntimeAdapter

MIRROR = {
    "C0": "C7", "C1": "C6", "C2": "C5", "C3": "C4",
    "C4": "C3", "C5": "C2", "C6": "C1", "C7": "C0",
}

class HardwareTranslator:
    def __init__(self) -> None:
        self.RuntimeAdapter = load_runtime_adapter()
        self.adapter = self.RuntimeAdapter()

    def frame_to_signal(self, frame: dict) -> dict:
        return {
            "frame_version": "NATT-HARDWARE-SIGNAL-v0.1",
            "origin_text": frame["origin_text"],
            "decode_key": frame["decode_key"],
            "color_class": frame["color_class"],
            "mirror_class": frame["mirror_class"],
            "polarity": frame.get("polarity", "NORMAL"),
            "parity_bit": frame["parity_bit"],
            "protected_flag": frame["protected_flag"],
            "carrier_profile": "SIMULATED_OPTICAL",
            "signal_payload": {
                "lane_color": frame["color_class"],
                "lane_mirror": frame["mirror_class"],
                "lane_parity": frame["parity_bit"],
                "lane_polarity": frame.get("polarity", "NORMAL"),
            },
        }

    def signal_to_sensor_readback(self, signal: dict) -> dict:
        return {
            "origin_text": signal["origin_text"],
            "read_color_class": signal["signal_payload"]["lane_color"],
            "read_mirror_class": signal["signal_payload"]["lane_mirror"],
            "read_parity_bit": signal["signal_payload"]["lane_parity"],
            "read_polarity": signal["signal_payload"]["lane_polarity"],
            "protected_flag": signal["protected_flag"],
            "confidence": 0.99,
        }

    def validate_signal(self, frame: dict, signal: dict, readback: dict) -> dict:
        if signal["color_class"] != frame["color_class"]:
            raise ValueError("signal color mismatch")
        if signal["mirror_class"] != MIRROR[frame["color_class"]]:
            raise ValueError("signal mirror mismatch")
        if int(signal["parity_bit"]) != int(frame["parity_bit"]):
            raise ValueError("signal parity mismatch")
        if readback["read_color_class"] != frame["color_class"]:
            raise ValueError("readback color mismatch")
        if readback["read_mirror_class"] != frame["mirror_class"]:
            raise ValueError("readback mirror mismatch")
        if int(readback["read_parity_bit"]) != int(frame["parity_bit"]):
            raise ValueError("readback parity mismatch")
        if readback["read_polarity"] != frame.get("polarity", "NORMAL"):
            raise ValueError("readback polarity mismatch")
        if bool(readback["protected_flag"]) != bool(frame["protected_flag"]):
            raise ValueError("readback protected mismatch")
        return {"status": "PASS", "decode_key": frame["decode_key"]}

    def translate_vector(self, vector: dict) -> dict:
        frame = self.adapter.encode_vector(vector)
        signal = self.frame_to_signal(frame)
        readback = self.signal_to_sensor_readback(signal)
        validation = self.validate_signal(frame, signal, readback)
        return {
            "frame": frame,
            "signal": signal,
            "readback": readback,
            "validation": validation,
        }
