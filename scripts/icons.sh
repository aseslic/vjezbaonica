#!/usr/bin/env sh
# Pravi PNG ikone iz SVG izvora. Treba program rsvg-convert (paket librsvg2-bin).
set -e
cd "$(dirname "$0")/.."
rsvg-convert -w 192 -h 192 public/favicon.svg -o public/pwa-192x192.png
rsvg-convert -w 512 -h 512 public/favicon.svg -o public/pwa-512x512.png
rsvg-convert -w 512 -h 512 assets/icons/icon-maskable.svg -o public/pwa-maskable-512x512.png
rsvg-convert -w 180 -h 180 assets/icons/icon-maskable.svg -o public/apple-touch-icon.png
echo "Ikone su napravljene u folderu public/."
