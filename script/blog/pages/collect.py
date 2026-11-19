#!/usr/bin/env python3
"""Stage the anonymous blog API and the local files it references for Pages."""
import argparse
import hashlib
import html
import io
import json
import re
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import unquote, urlencode, urlsplit
from urllib.request import HTTPRedirectHandler, ProxyHandler, Request, build_opener
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


class NoRedirects(HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


LOOPBACK = 'http://127.0.0.1:8080'
UPLOAD = re.compile(r'/admin-api/infra/file/[0-9]+/get/(.+)')
SLUG = re.compile(r'[a-z0-9]+(?:-[a-z0-9]+)*')
ATTR = re.compile(r'\b(href|src)="([^"]+)"')
MAX_FILE = 25 * 1024 * 1024
MAX_MEDIA = 200 * 1024 * 1024
HTTP = build_opener(ProxyHandler({}), NoRedirects())
RASTER = {'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif',
          'image/webp': 'webp', 'image/avif': 'avif', 'image/bmp': 'bmp',
          'image/x-icon': 'ico', 'image/vnd.microsoft.icon': 'ico'}
DOWNLOAD = {'application/pdf': {'pdf'}, 'application/zip': {'zip', 'docx', 'xlsx', 'pptx'},
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {'docx'},
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {'xlsx'},
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': {'pptx'},
            'text/plain': {'txt', 'log', 'csv'}, 'text/csv': {'csv'},
            'audio/mpeg': {'mp3'}, 'video/mp4': {'mp4'}, 'application/json': {'json'}}


def get(path, limit):
    try:
        with HTTP.open(Request(LOOPBACK + path), timeout=15) as response:
            body = response.read(limit + 1)
            if len(body) > limit:
                raise ValueError('A Pages export response exceeded its size limit')
            return body, response.headers.get_content_type()
    except HTTPError as error:
        raise ValueError(f'Public export returned HTTP {error.code}') from None


def api(route, **query):
    path = '/app-api/blog/' + route + ('?' + urlencode(query) if query else '')
    body, _ = get(path, 8 * 1024 * 1024)
    result = json.loads(body)
    if result['code'] != 0 or result['data'] is None:
        raise ValueError(f'Anonymous blog API failed: {route}')
    return result['data']


def items(kind):
    output = []
    slugs = set()
    for number in range(1, 101):
        page = api(f'{kind}/page', pageNo=number, pageSize=100)
        if not isinstance(page['total'], int) or not isinstance(page['list'], list):
            raise ValueError(f'Invalid {kind} page')
        for item in page['list']:
            slug = item['slug']
            if not SLUG.fullmatch(slug) or slug in slugs:
                raise ValueError(f'Invalid or repeated public {kind} slug')
            detail = api(f'{kind}/get', slug=slug)
            if detail['slug'] != slug:
                raise ValueError(f'Public {kind} changed during export')
            slugs.add(slug)
            output.append(detail)
        if len(output) == page['total']:
            return output
        if not page['list'] or len(output) > page['total']:
            break
    raise ValueError(f'Could not collect all public {kind} entries')


def collect():
    return dict(site=api('site/get'), categories=api('category/list'), tags=api('tag/list'),
                archives=api('article/archives'), sitemap=api('sitemap'),
                articles=items('article'), resources=items('resource'))


def json_bytes(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')) + '\n').encode()


class Media:
    def __init__(self, folder):
        self.folder = folder
        self.urls = {}
        self.size = 0

    def url(self, value, image=False):
        if not value:
            return value
        url = urlsplit(value)
        match = UPLOAD.fullmatch(url.path)
        if not match:
            return value
        if url.netloc or url.scheme:
            if (url.scheme not in ('http', 'https') or url.username or url.password
                    or url.hostname not in ('127.0.0.1', 'localhost', '::1')
                    or url.port not in (None, 80, 443, 8080, 18081)):
                return value
        segments = [unquote(part) for part in match[1].split('/')]
        if any(not part or part in ('.', '..') or re.search(r'[/\\%\x00-\x1f\x7f]', part) for part in segments):
            raise ValueError('Invalid uploaded file path in public content')
        if url.query:
            raise ValueError('Unexpected query on a local uploaded file')
        if url.path not in self.urls:
            self.urls[url.path] = self.copy(url.path, segments[-1])
        public_path, raster = self.urls[url.path]
        if image and not raster:
            raise ValueError('Use a raster image (for example PNG or JPEG) for Pages previews')
        return public_path + ('#' + url.fragment if url.fragment else '')

    def copy(self, path, filename):
        body, mime = get(path, MAX_FILE)
        suffix = filename.rpartition('.')[2].lower()
        raster = mime in RASTER
        if raster:
            suffix = RASTER[mime]
        elif suffix not in DOWNLOAD.get(mime, set()):
            # Pages does not preserve the backend's attachment-only response headers.
            # Archive unrecognized or active formats instead of serving them on the site origin.
            archive = io.BytesIO()
            entry = ZipInfo(re.sub(r'[:*?"<>|]', '_', filename))
            with ZipFile(archive, 'w', compression=ZIP_DEFLATED) as zipped:
                zipped.writestr(entry, body, compress_type=ZIP_DEFLATED)
            body, suffix = archive.getvalue(), 'zip'
        stem = re.sub('[^a-zA-Z0-9_-]+', '-', filename.rpartition('.')[0]).strip('-')[:64] or 'attachment'
        name = f'{hashlib.sha256(body).hexdigest()[:24]}-{stem}.{suffix}'
        if not (self.folder / name).exists():
            self.size += len(body)
            if self.size > MAX_MEDIA:
                raise ValueError('Published attachments exceed the Pages export budget')
            (self.folder / name).write_bytes(body)
        return '/pages-media/' + name, raster

    def markup(self, value):
        def replace(match):
            name, original = match.groups()
            decoded = html.unescape(original)
            public = self.url(decoded, image=name == 'src')
            return match[0] if public == decoded else f'{name}="{html.escape(public, quote=True)}"'
        return ATTR.sub(replace, value or '')

    def rewrite(self, snapshot):
        site = snapshot['site']
        site['avatarUrl'] = self.url(site['avatarUrl'], image=True)
        site['aboutHtml'] = self.markup(site['aboutHtml'])
        for item in snapshot['articles'] + snapshot['resources']:
            item['coverUrl'] = self.url(item['coverUrl'], image=True)
            item['contentHtml'] = self.markup(item['contentHtml'])
            if 'url' in item:
                item['url'] = self.url(item['url'])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output', type=Path)
    parser.add_argument('--previous', type=Path)
    args = parser.parse_args()
    snapshot = collect()
    raw = json_bytes(snapshot)
    digest = hashlib.sha256(Path(__file__).read_bytes() + raw).hexdigest() + '\n'
    previous = args.previous / 'source.sha256' if args.previous else None
    if previous and previous.is_file() and previous.read_text() == digest:
        return
    args.output.mkdir()
    folder = args.output / 'media'
    folder.mkdir()
    Media(folder).rewrite(snapshot)
    # Do not send an old public copy if a post was unpublished while copying attachments.
    if json_bytes(collect()) != raw:
        raise ValueError('Public content changed during export; the next run will retry')
    (args.output / 'snapshot.json').write_bytes(json_bytes(snapshot))
    (args.output / 'source.sha256').write_text(digest)
    print(f"Collected {len(snapshot['articles'])} published articles and {len(snapshot['resources'])} published resources")


if __name__ == '__main__':
    try:
        main()
    except (KeyError, OSError, TypeError, ValueError) as error:
        raise SystemExit(f'Pages collection failed: {error}') from None
