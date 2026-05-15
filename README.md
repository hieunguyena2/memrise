# Memrise Mini

A login-free English learning web app inspired by Memrise. Users can create multiple vocabulary or sentence lists, import TXT/CSV files, and study with automatic flashcards.

## Features

- Create and name multiple learning lists without an account.
- Paste entries or upload TXT/CSV files. Each line can be either `english` or `english | Vietnamese meaning`.
- Flashcards automatically enrich content with IPA via Dictionary API and Vietnamese translations via MyMemory when no manual translation is provided.
- Each flashcard uses an illustrative Unsplash background with a dark overlay so the text remains readable.
- Browser speech synthesis reads English content with an English voice, while Vietnamese meanings use Vietnamese TTS first so they are not pronounced with an English accent.
- Autoplay advances through the whole list and loops back to the beginning.
- Lists and enrichment cache are saved in `localStorage`.

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.
