#!/usr/bin/env python3
"""Generate the app icons (no image libraries needed).

Draws a barbell glyph on the app background and writes plain RGBA PNGs.
Run: python3 tools/make_icons.py
"""
import math
import struct
import zlib
from pathlib import Path

BG = (0x0A, 0x0C, 0x0F)
FG = (0xC3, 0xF5, 0x3C)
SS = 4  # supersampling factor for smooth edges


def rrect_cover(px, py, x0, y0, x1, y1, r):
    """Signed coverage test for a rounded rectangle."""
    cx = min(max(px, x0 + r), x1 - r)
    cy = min(max(py, y0 + r), y1 - r)
    if x0 + r <= px <= x1 - r or y0 + r <= py <= y1 - r:
        return x0 <= px <= x1 and y0 <= py <= y1
    return (px - cx) ** 2 + (py - cy) ** 2 <= r * r


# barbell: [x0, y0, x1, y1, radius] in 0..1 space
SHAPES = [
    (0.150, 0.395, 0.235, 0.605, 0.035),  # outer plate left
    (0.245, 0.325, 0.330, 0.675, 0.040),  # inner plate left
    (0.330, 0.462, 0.670, 0.538, 0.030),  # bar
    (0.670, 0.325, 0.755, 0.675, 0.040),  # inner plate right
    (0.765, 0.395, 0.850, 0.605, 0.035),  # outer plate right
]


def render(size, *, rounded=False):
    rows = []
    corner = size * 0.22
    for y in range(size):
        row = bytearray()
        for x in range(size):
            hits = 0
            for sy in range(SS):
                for sx in range(SS):
                    px = (x + (sx + 0.5) / SS) / size
                    py = (y + (sy + 0.5) / SS) / size
                    for (x0, y0, x1, y1, r) in SHAPES:
                        if rrect_cover(px, py, x0, y0, x1, y1, r):
                            hits += 1
                            break
            a = hits / (SS * SS)
            r = round(BG[0] + (FG[0] - BG[0]) * a)
            g = round(BG[1] + (FG[1] - BG[1]) * a)
            b = round(BG[2] + (FG[2] - BG[2]) * a)

            alpha = 255
            if rounded:
                inside = 0
                for sy in range(SS):
                    for sx in range(SS):
                        if rrect_cover(x + (sx + 0.5) / SS, y + (sy + 0.5) / SS,
                                       0, 0, size, size, corner):
                            inside += 1
                alpha = round(255 * inside / (SS * SS))
            row += bytes((r, g, b, alpha))
        rows.append(bytes(row))
    return rows


def write_png(path, rows, size):
    raw = b"".join(b"\x00" + r for r in rows)

    def chunk(tag, data):
        body = tag + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body))

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9))
    png += chunk(b"IEND", b"")
    Path(path).write_bytes(png)
    print(f"{path} ({len(png)} bytes)")


if __name__ == "__main__":
    out = Path(__file__).resolve().parent.parent / "icons"
    out.mkdir(exist_ok=True)
    for size, name, rounded in [
        (192, "icon-192.png", False),
        (512, "icon-512.png", False),
        (512, "icon-maskable-512.png", False),
        (180, "apple-touch-icon.png", False),
        (32, "favicon-32.png", False),
    ]:
        write_png(out / name, render(size, rounded=rounded), size)
