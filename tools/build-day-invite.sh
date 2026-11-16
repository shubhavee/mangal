#!/bin/sh
# Builds the 18-Jan-only invitation into the sibling folder ../sri-shubh-vivah, which is its own
# git repo published at https://shubhavee.github.io/sri-shubh-vivah/ (kept separate on purpose so
# it can't be reached by trimming the main invitation's link).
# Same page as index.html, marked data-invite="day". Run after every change, then commit & push both repos.
cd "$(dirname "$0")/.." || exit 1
OUT="../sri-shubh-vivah"
mkdir -p "$OUT/.github"
sed -e 's|<html lang="en">|<html lang="en" data-invite="day">|' index.html > "$OUT/index.html"
cp styles.css script.js config.js "$OUT/"
cp .github/CODEOWNERS "$OUT/.github/CODEOWNERS"
[ -d assets ] && cp -R assets "$OUT/"
exit 0
