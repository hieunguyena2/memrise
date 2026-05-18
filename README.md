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
- Users who want to study on multiple computers can open the settings menu, switch to Google Drive, sign in, and let the app sync `memrise-mini-data.json` automatically through the Drive `appDataFolder`.
- When local and Drive copies both contain changes, the sync step reconciles lists, entries, caches, and voice settings before writing the merged result back to Drive.
- If Google Drive mode was selected previously, the next app launch locks the study UI until the user signs in to Drive again.

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Storage modes

- **Máy này**: keeps the learning data in the current browser using `localStorage`. This is best when the user only studies on one local computer.
- **Google Drive của tôi**: stores `memrise-mini-data.json` in the signed-in user's Google Drive `appDataFolder`, then automatically pushes new or edited lists to Drive and polls Drive for newer data from another browser session.

## Google Drive setup

Google Drive sync uses Google Identity Services in the browser, so the static app needs an OAuth Client ID for the origin where it is hosted.

1. Create a Google Cloud OAuth 2.0 Web client and allow the local or production origin that serves this app.
2. Open **Cài đặt** from the top-right corner of the app.
3. Select **Google Drive của tôi**, enter the OAuth Client ID, and click **Đăng nhập Drive**.
4. On later visits, sign in to Drive first; the app intentionally blocks the study UI until Drive is connected again so cloud data remains the source of truth.

Alternatively, define `window.MEMRISE_GOOGLE_CLIENT_ID` before `app.js` loads if you want to preconfigure the Client ID in a hosted deployment.
