"""
Remove background from game prop/asset images using rembg (U2-Net AI).

Usage:
  # Remove background from specific files
  python scripts/remove_bg.py prop_sofa.png prop_bed.png

  # Remove background from ALL prop_*.png files
  python scripts/remove_bg.py --all

  # Process files in a custom directory
  python scripts/remove_bg.py --dir ./images prop_sofa.png

Requirements:
  pip install 'rembg[cpu]' Pillow
"""
import os
import sys
import glob
from PIL import Image
from rembg import remove

DEFAULT_DIR = os.path.join(os.path.dirname(__file__), "..")


def process_file(filepath):
    if not os.path.exists(filepath):
        print(f"⏭️  Skipping {filepath} (not found)")
        return False
    print(f"🖼️  Processing {os.path.basename(filepath)}...")
    inp = Image.open(filepath)
    out = remove(inp)
    out.save(filepath, "PNG")
    print(f"✅ Saved with transparent background")
    return True


def main():
    args = sys.argv[1:]
    target_dir = DEFAULT_DIR
    files = []
    all_mode = False

    i = 0
    while i < len(args):
        if args[i] == "--dir" and i + 1 < len(args):
            target_dir = args[i + 1]
            i += 2
        elif args[i] == "--all":
            all_mode = True
            i += 1
        else:
            files.append(args[i])
            i += 1

    if all_mode:
        files = sorted(glob.glob(os.path.join(target_dir, "prop_*.png")))
        if not files:
            print("❌ No prop_*.png files found in", target_dir)
            return
    elif not files:
        print(__doc__)
        return
    else:
        files = [
            f if os.path.isabs(f) else os.path.join(target_dir, f) for f in files
        ]

    count = 0
    for f in files:
        if process_file(f):
            count += 1

    print(f"\n🎉 Done! Processed {count} file(s).")


if __name__ == "__main__":
    main()
