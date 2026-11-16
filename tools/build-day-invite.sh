#!/bin/sh
# Builds shubh-vivah/index.html (the 18-Jan-only invitation) from index.html.
# Same page, marked data-invite="day", with asset paths pointing one folder up.
# Run this after every change to index.html, before committing.
cd "$(dirname "$0")/.." || exit 1
mkdir -p shubh-vivah
sed -e 's|<html lang="en">|<html lang="en" data-invite="day">|' \
    -e 's|href="styles.css|href="../styles.css|' \
    -e 's|src="config.js|src="../config.js|' \
    -e 's|src="script.js|src="../script.js|' \
    -e 's|content="assets/|content="../assets/|' \
    index.html > shubh-vivah/index.html
