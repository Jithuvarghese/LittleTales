#!/usr/bin/env bash
# Fails if any tracked file (or files under the given directory) contains a
# disallowed term. Terms are stored encoded so this script does not match itself.
# Usage: scripts/check-clean.sh          -> scan tracked files
#        scripts/check-clean.sh dist     -> scan a build directory
set -euo pipefail

decode() { printf '%s' "$1" | base64 -d; }
TERMS=(Y2xhdWRl YW50aHJvcGlj Y2hhdGdwdA== b3BlbmFp Y29waWxvdA== Z2VuZXJhdGVkIGJ5 Y28tYXV0aG9yZWQtYnk=)
WORD=QUk=

pattern=""
for t in "${TERMS[@]}"; do pattern+="${pattern:+|}$(decode "$t")"; done
word="$(decode "$WORD")"

if [[ $# -gt 0 ]]; then
  [[ -d "$1" ]] || { echo "check-clean: '$1' not found, skipping"; exit 0; }
  mapfile -t files < <(find "$1" -type f)
else
  mapfile -t files < <(git ls-files | grep -vE '(^|/)(node_modules/|package-lock\.json$|PROJECT_SPEC\.md$)')
fi

[[ ${#files[@]} -eq 0 ]] && exit 0

status=0
if grep -InEi -- "$pattern" "${files[@]}" 2>/dev/null; then status=1; fi
# Minified bundles contain short identifiers that trip the whole-word check.
word_files=()
for f in "${files[@]}"; do [[ $# -gt 0 && "$f" == *.js ]] || word_files+=("$f"); done
if [[ ${#word_files[@]} -gt 0 ]] && grep -InEiw -- "$word" "${word_files[@]}" 2>/dev/null; then status=1; fi

if [[ $status -ne 0 ]]; then
  echo "check-clean: disallowed terms found (see above)." >&2
  exit 1
fi
echo "check-clean: OK (${#files[@]} files)"
