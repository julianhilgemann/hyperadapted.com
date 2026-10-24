#!/bin/sh
# Renders the site's raster images from their sources, on macOS with Google
# Chrome. Run from the repo root and commit the results:
#
#   public/og-image.jpg         <- scripts/og-image.html (1200 x 630)
#   public/apple-touch-icon.png <- public/favicon.svg (180 x 180)
#   public/favicon-32.png       <- public/favicon.svg (32 x 32)
#
# JPEG keeps the preview image well under the ~300 KB some apps (WhatsApp)
# accept for link previews.
set -e
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

shot() { # url width height out.png
    "$CHROME" --headless=new --hide-scrollbars --force-device-scale-factor=1 \
        --default-background-color=00000000 \
        --window-size="$2,$3" --virtual-time-budget=3000 \
        --screenshot="$4" "$1" 2>/dev/null
}

shot "file://$PWD/scripts/og-image.html" 1200 630 public/og-image.png
sips -s format jpeg -s formatOptions 88 public/og-image.png --out public/og-image.jpg >/dev/null
rm public/og-image.png

# Headless Chrome will not open a window narrower than about 500px, so the
# mark is drawn large through scripts/icon.html and scaled down.
shot "file://$PWD/scripts/icon.html" 720 720 public/icon-720.png
sips -z 180 180 public/icon-720.png --out public/apple-touch-icon.png >/dev/null
sips -z 32 32 public/icon-720.png --out public/favicon-32.png >/dev/null
rm public/icon-720.png
