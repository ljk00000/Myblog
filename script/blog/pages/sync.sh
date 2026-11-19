#!/usr/bin/env bash
set -euo pipefail
umask 027
: "${STATE_DIRECTORY:?Run using myblog-pages.service}"
cd "$STATE_DIRECTORY"
work=$(mktemp -d -- "$STATE_DIRECTORY/sync.XXXXXX")
trap 'rm -rf -- "$work"' EXIT
previous=()
if [[ -r "$STATE_DIRECTORY/public.tar.gz" ]]; then previous=(--previous "$STATE_DIRECTORY"); fi
python3 /usr/local/lib/myblog-pages/collect.py "$work/content" "${previous[@]}"
[[ -d "$work/content" ]] || exit 0
# Readers always get a complete archive, even if an export is interrupted.
tar -czf "$work/public.tar.gz" -C "$work/content" snapshot.json source.sha256 media
mv -f -- "$work/public.tar.gz" "$STATE_DIRECTORY/public.tar.gz"
mv -f -- "$work/content/source.sha256" "$STATE_DIRECTORY/source.sha256"
