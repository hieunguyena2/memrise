# Memrise Mini

A login-free English learning web app inspired by Memrise. Users can create multiple vocabulary or sentence lists, import TXT/CSV files, and study with automatic flashcards.

## Features

- Create and name multiple learning lists without an account.
- Paste entries or upload TXT/CSV files. Each line can be either `english` or `english | Vietnamese meaning`.
- Flashcards automatically enrich content with IPA via Dictionary API and Vietnamese translations via MyMemory when no manual translation is provided.
- Each flashcard uses an illustrative Unsplash background with a dark overlay so the text remains readable.
- Browser speech synthesis reads English content with an English voice, while Vietnamese meanings use Vietnamese TTS first so they are not pronounced with an English accent.
- Autoplay advances through the whole list and loops back to the beginning.
- By default, lists are saved in browser `localStorage` for one-computer use.
- Users who want to study on multiple computers can switch to Google Drive mode and keep a `memrise-mini-data.json` file in their own Google Drive, with direct file access on supported browsers or import/export fallback elsewhere.

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Storage modes

- **Máy này**: keeps the learning data in the current browser using `localStorage`. This is best when the user only studies on one local computer.
- **Google Drive của tôi**: saves or loads a `memrise-mini-data.json` backup owned by the user. On browsers that support the File System Access API, choose a file in a Google Drive synced folder so changes can be written back automatically. On other browsers, use **Tải file dữ liệu** and **Nạp file Drive** to move the JSON file through Google Drive manually.
