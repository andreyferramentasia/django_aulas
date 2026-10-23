# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, single-page Django tutorial for beginners on Windows, written in Brazilian Portuguese. Plain HTML/CSS/JS with ES modules: no build step, no package manager, no tests, no linter. Deployed as-is (`.nojekyll` suggests GitHub Pages).

The Python/Django code shown in the tutorial lives only inside HTML `<pre><code>` blocks; there is no real Django project in the repo. In that tutorial code, use absolute imports (`from courses.models import Course`), not relative ones (`.models`).

The running example is one app named `courses` with two models: `Person` (the teacher) and `Course` (FK to `Person`, plus `material` FileField and `image` ImageField, all defined once in the models step; the media step only configures settings and urls). The whole CRUD (parts 9 to 14) is on `Course`, included in `app/urls.py` as `path('courses/', include('courses.urls'))`; the app paths are `listar/`, `criar/`, `<int:pk>/ver/`, `<int:pk>/editar/`, `<int:pk>/deletar/` (so `/courses/listar/`, `/courses/3/editar/`...), with names `courses:course_list`, `course_create`, etc. In code blocks, wrap the app name in `<span class="input">courses</span>` and add one "troque courses pelo nome do seu app" comment per block (`cm` in Python, `t-cm` `{# #}` on its own line in templates, `comment` in shell and folder trees). Skip it in command output such as migrations.

## Running locally

The page loads its content with `fetch`, so it must be served over HTTP (opening `index.html` via `file://` shows a load error):

```
python -m http.server
```

or the VS Code Live Server extension.

## Architecture

- `index.html` holds the hero, sidebar, footer and an ordered list of `<div data-include="partes/NN-....html">` slots. Adding a part means creating the file in `partes/` and adding its slot here, in order.
- `js/main.js` replaces each `data-include` slot with the fetched file, then runs the builders below, then applies the URL hash manually (content arrives after load).
- `js/components.js` expands the lean markup in `partes/*.html` into the full markup the CSS expects. Write only the lean form in parts files:
  - `<section class="part" data-title="...">` gets a "Parte I/II/..." header. Roman numerals come from document order, not from the `id`.
  - `<details class="step" data-title="...">` gets a numbered `<summary>`. Numbers are counted automatically across the whole page; `step--extra` steps are skipped in the count and shown as "+" / "Extra". `data-number` and `data-label` override the defaults. `step--front` marks front-end steps (blue). `step--video` steps (id `video-N`) are also skipped in the count, shown as "▶" / "Vídeo" in plum, and hold a `.video` figure; place each one right before the content it covers.
  - `.terminal[data-title]` and `.screenshot[data-title]` get a window bar (dark for terminals).
  - `<figure class="video" data-src="partes/NN_video/x.mp4" data-title="...">` (vertical 9:16 videos) gets a play button; the `<video>` is only created on click, only one plays at a time, and closing its step stops it. Paths in `data-src` are relative to `index.html`.
- `js/feed.js` adds a floating "Vídeos" button that opens every `.video` on the page in a TikTok-style fullscreen feed (`<dialog>`, vertical scroll-snap). Only the visible video gets a `src`. Each video has an "Ir para a seção" button that closes the feed, opens and scrolls to the first non-video step after the video step, or to `data-target="id"` on the `.video` figure when set.
- `js/search.js` adds the sidebar search. A query matching a topic in `js/topics.js` ("media", "list view"...) shows only that topic's steps, in the listed order, with a panel (start/end, a note per step) and a tag above each step with prev/next; any other query filters steps by text. Hits are wrapped in `<mark class="search-hit">`. The query persists in `?busca=` and localStorage until cleared. When adding a step that belongs to a topic, add its id to `js/topics.js`. Links, the URL hash and the video feed call `reveal()` so a filtered-out target still opens.
- `js/toc.js` builds the sidebar from the assembled parts and steps; the TOC is never edited by hand.
- Element ids (`parte-N`, `passo-N`, `extra-...`, `video-N`) are hand-written anchors used by the TOC and links. They are not tied to the displayed numbers, so inserting a step does not require renumbering, but keep ids unique.

## Content markup conventions

- Step content goes inside `<div class="step__body">`. Sub-headings use `<h4 class="substep"><span>?</span> ...</h4>`.
- Notes: `<aside class="note">` (warning, gold) or `<aside class="note note--tip">` (tip, green), with `<p class="note__title">`.
- Term/explanation lists: `<dl class="files">`.
- Syntax highlighting inside `.terminal` is manual spans (see `css/components/terminal.css`):
  - Shell: `prompt`, `input`, `comment`
  - Python: `kw`, `str`, `cls`, `num`, `cm`
  - Django templates/HTML: `t-tag`, `t-attr`, `t-val`, `t-dtl` (`{% %}`), `t-var` (`{{ }}`), `t-cm`
  - `hl` wraps a whole line to mark new/changed code.
  Escape `<`, `>` and `&` in code blocks.
- Each CSS component file starts with a comment showing its expected markup. Colors and fonts are tokens in `css/base/tokens.css`; components use `--accent`, which modifiers swap.
- New CSS files must be linked in `index.html` (tokens and base first, then layout, then components).

## Writing style

User-facing text is Portuguese (pt-BR). Do not use em dashes (`—`); use commas instead.
