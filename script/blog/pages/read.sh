#!/usr/bin/env sh
set -eu
[ "${SSH_ORIGINAL_COMMAND:-}" = 'public-snapshot' ] || exit 1
exec /usr/bin/cat /var/lib/myblog-pages/public.tar.gz
