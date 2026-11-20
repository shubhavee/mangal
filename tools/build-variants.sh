#!/bin/sh
# Builds the other three invitations from this one (index.html = groom's side, 17–18 Jan with stay).
# Each goes to a sibling folder that is its own git repo / GitHub Pages site, so no invitation's
# link can be reached by trimming another's:
#   ../sri-shubh-vivah        groom's side, 18 Jan only   → shubhavee.github.io/sri-shubh-vivah/
#   ../srishti-shubham-vivah  bride's side, 17–18 Jan     → shubhavee.github.io/srishti-shubham-vivah/
#   ../shubh-vivah-utsav      bride's side, 18 Jan only   → shubhavee.github.io/shubh-vivah-utsav/
# Same page each time; only the <html data-side / data-invite> attributes differ.
# Run after every change, then commit & push all four repos.
cd "$(dirname "$0")/.." || exit 1
build() { # folder side invite
  OUT="../$1"
  mkdir -p "$OUT/.github"
  SWAP=""; [ "$2" = bride ] && SWAP="s|Mumbai ❤ Delhi|Delhi ❤ Mumbai|" # link preview: host's city first
  sed -e "s|<html lang=\"en\" data-side=\"groom\" data-invite=\"full\">|<html lang=\"en\" data-side=\"$2\" data-invite=\"$3\">|" -e "$SWAP" index.html > "$OUT/index.html"
  cp styles.css script.js config.js "$OUT/"
  cp .github/CODEOWNERS "$OUT/.github/CODEOWNERS"
  [ -d assets ] && cp -R assets "$OUT/"
}
build sri-shubh-vivah groom day
build srishti-shubham-vivah bride full
build shubh-vivah-utsav bride day
exit 0
