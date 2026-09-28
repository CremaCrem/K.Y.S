#!/bin/sh
# Downloads the Material Symbols Rounded font, cut down to the icons KYS uses,
# into src/fonts/. The app never loads fonts from the network (see the CSP in
# public/index.html), so a new icon name only shows up after adding it here and
# running: sh scripts/fetch-icons.sh
set -e

ICONS="
account_balance add apps arrow_back auto_awesome badge category check check_circle
close content_copy crop_square currency_bitcoin dark_mode delete desktop_windows dns download edit
error expand_more filter_none forum home info key language license light_mode lock lock_reset mail
palette print remove search search_off shield shield_lock shopping_bag smart_display
sports_esports star swap_vert terminal upload visibility visibility_off warning wifi work
"

# Google Fonts wants the names sorted and comma-separated, and serves woff2 only to browsers.
NAMES=$(echo $ICONS | tr ' ' '\n' | sort | paste -sd, -)
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
CSS=$(curl -fsS -A "$UA" "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400..600,0..1,0&icon_names=$NAMES&display=block")
URL=$(echo "$CSS" | grep -o 'https://[^)]*' | head -1)

curl -fsS -o "$(dirname "$0")/../src/fonts/material-symbols-rounded-subset.woff2" "$URL"
echo "Saved $(echo $ICONS | wc -w | tr -d ' ') icons to src/fonts/material-symbols-rounded-subset.woff2"
