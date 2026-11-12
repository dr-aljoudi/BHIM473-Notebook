# BHIM473 — Interactive Health Informatics Notebook

A standalone, source-grounded educational website for **Weeks 1, 2, 3, 4, 5, 6, 8, and 9**. Week 7 is intentionally omitted and is not included anywhere in the lesson navigation.

## Features

- Eight chapters with 190 lesson study cards and 906 teaching points extracted from the lecture PDFs
- Four reader themes: Notebook, Minimal, Studio, Dark Focus
- English/Arabic language selector; Arabic interface and week summaries, original English lesson content
- Search within the current week, collapsible source-page cards, progress tracking saved locally
- Print or save each week as PDF; responsive on mobile and desktop
- Accessible via static hosting; no server, database, account, AI service, or runtime fees required

## Render Static Site configuration

- **Repository:** `https://github.com/dr-aljoudi/BHIM473-Notebook`
- **Branch:** `main`
- **Build command:** `echo ready`
- **Publish directory:** `public`
- **Auto deploy:** Yes

## Materials and attribution

The structured study content was extracted from eight uploaded lecture decks provided by the course owner. Each card includes its original PDF page number. The public website provides downloadable/printable lesson pages through the browser. Original PDF files are not committed to this repository.

The Arabic language option translates the interface and weekly summaries, **not the full original English lesson slides**. No additional source facts are generated.

## Developer notes

There is no build step. Serve the `public` folder using any local HTTP server (for example `python -m http.server 8000 -d public`) and open `http://localhost:8000`.
