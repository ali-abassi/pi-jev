#!/bin/sh
# Oracle: npm test passes AND legacy/ untouched. Prints JSON, exit 0/1.
dir="$1"
tests_pass=0
legacy_clean=0
(cd "$dir" && npm test --silent >/dev/null 2>&1) && tests_pass=1
[ -z "$(cd "$dir" && git status --porcelain -- legacy/)" ] && legacy_clean=1
pass=0
[ "$tests_pass" = 1 ] && [ "$legacy_clean" = 1 ] && pass=1
printf '{"pass": %s, "tests_pass": %s, "legacy_clean": %s}\n' \
  "$([ "$pass" = 1 ] && echo true || echo false)" \
  "$([ "$tests_pass" = 1 ] && echo true || echo false)" \
  "$([ "$legacy_clean" = 1 ] && echo true || echo false)"
[ "$pass" = 1 ]
