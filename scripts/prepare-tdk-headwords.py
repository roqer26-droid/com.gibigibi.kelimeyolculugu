"""Extract simple Turkish headwords from the TDK 12th-edition archive.

Download the `tdk.tar.gz` asset from:
https://github.com/metwse/tdk-sozluk/releases/tag/12-ham
Then run: python3 scripts/prepare-tdk-headwords.py /tmp/tdk.tar.gz /tmp/tdk-headwords.json

The archive is used only during level generation; the game works offline.
"""

import json
import re
import sys
import tarfile
from pathlib import Path


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Usage: prepare-tdk-headwords.py <archive.tar.gz> <output.json>")

    accepted: set[str] = set()
    forbidden_tags = {"argo", "kaba konuşmada", "teklifsiz konuşmada", "ağızlardan", "eskimiş"}
    accepted_tags = {"isim", "sıfat", "zarf", "nesnesiz", "-i", "-e", "-den", "-le"}

    with tarfile.open(sys.argv[1], "r|gz") as archive:
        for member in archive:
            if not member.isfile():
                continue
            try:
                handle = archive.extractfile(member)
                data = json.load(handle) if handle else None
            except (ValueError, UnicodeDecodeError):
                continue
            if not isinstance(data, list):
                continue

            for item in data:
                if not isinstance(item, dict):
                    continue
                word = item.get("madde")
                if not isinstance(word, str) or not re.fullmatch(r"[a-zçğıöşü]{3,9}", word):
                    continue
                if item.get("ozel_mi") not in (None, "0", 0) or item.get("cogul_mu") not in (None, "0", 0):
                    continue
                senses = item.get("anlamlarListe") or []
                if not senses:
                    continue
                tags = {
                    tag.get("tam_adi") or tag.get("kisa_adi") or ""
                    for sense in senses
                    for tag in (sense.get("ozelliklerListe") or [])
                }
                if tags & forbidden_tags or not tags & accepted_tags:
                    continue
                accepted.add(word)

    Path(sys.argv[2]).write_text(json.dumps(sorted(accepted), ensure_ascii=False), encoding="utf-8")
    print(f"{len(accepted)} TDK headwords saved to {sys.argv[2]}")


if __name__ == "__main__":
    main()