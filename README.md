# Workout Tracker

A private gym log for iPhone. It works with no signal, keeps your data in a
single file in **your own** Google Drive, and shows you whether the numbers are
going up.

No account, no subscription, no third-party server. The only two places your
data exists are your phone and your Drive.

---

## Setting it up

### 1. Put it online

The app is plain static files, so any static host will serve it.

**This repository is currently private.** GitHub Pages only serves private
repositories on a paid plan, and even then it puts the site behind a GitHub
login, which stops it working properly as a home-screen app. So pick one:

**Option A — make the repository public (simplest).**
*Settings → General → Danger Zone → Change visibility → Public.*

This publishes the *code*, not your workouts. Your training data is never in
this repository — it lives on your phone and in your Drive, and the app has no
server to leak it to.

Then just push to the default branch. The included workflow
(`.github/workflows/pages.yml`) enables Pages itself the first time it runs
(`enablement: true`), so there is nothing to configure by hand — handy on a
phone, where the Pages settings screen is hard to reach. You can also run it
from the **Actions** tab via **Run workflow**.

Your app will be at:

```
https://<your-github-username>.github.io/<repository-name>/
```

**Option B — keep the repository private, host it elsewhere.**
[Netlify](https://netlify.com), [Vercel](https://vercel.com) and
[Cloudflare Pages](https://pages.cloudflare.com) all serve private repositories
on their free tiers. Connect the repository, leave the build command empty and
set the publish directory to `/`. You will get a URL like
`https://your-app.netlify.app` — use that everywhere this README says "your
Pages origin".

Either way, keep the URL stable. Changing it means re-adding the app to your
home screen and re-registering the origin with Google.

### 2. Add it to your iPhone

1. Open the URL in **Safari** (it must be Safari, not Chrome).
2. Tap the **Share** button, then **Add to Home Screen**.
3. Open it from the home screen icon.

It now runs full screen with no browser chrome, keeps working in aeroplane mode,
and survives being swiped away mid-workout.

### 3. Connect Google Drive

Sync is optional — the app works fully without it — but it is what gets your
history off a single device and into your Drive.

This is a one-off, five-minute job:

1. Go to [console.cloud.google.com](https://console.cloud.google.com/projectcreate)
   and create a project (any name).
2. Search for **Google Drive API** and press **Enable**.
3. Open **APIs & Services → OAuth consent screen**. Choose **External**, fill in
   an app name and your own email address, and save. Then press **Publish app**
   — if you leave it in Testing mode, Google expires your sign-in every 7 days.
4. Open **Credentials → Create credentials → OAuth client ID** and pick
   **Web application**.
5. Under **Authorised JavaScript origins**, add your Pages origin exactly:
   ```
   https://<your-github-username>.github.io
   ```
   (just the origin — no path, no trailing slash)
6. Copy the client ID and paste it into **Settings → Google client ID** in the
   app, then tap **Sync now** and approve the Google prompt.

The same instructions are inside the app under
**Settings → How do I get a client ID?**, which shows the exact origin to paste.

---

## Using it

**Train** is the screen you use in the gym.

- Start an empty session, or start from a routine.
- Add an exercise, then fill in weight and reps and tap **✓**.
- The **Previous** column shows what you did for that same set last time — tap it
  to copy those numbers in.
- When you log a set, any blank sets below it inherit the same numbers, so a
  straight-sets exercise is one tap per set.
- Tap the set number to mark it as a **warm-up** (warm-ups are excluded from
  volume, records and charts).
- Completing a set starts the **rest timer** automatically. It beeps and vibrates
  when it finishes, keeps counting if you lock the phone, and survives the app
  being backgrounded or reloaded.
- Beat your best estimated 1-rep max on an exercise and you get a PR flash.

**Routines** are templates for the sessions you repeat — Push, Pull, Legs, or
whatever you follow. Starting one pre-fills every exercise with the weights you
used last time.

**History** is every session you have logged, with sets, volume and duration.

**Progress** has your weekly volume, per-exercise charts of estimated 1RM and
heaviest set, and a personal-bests table. Estimated 1RM uses the Epley formula
(`weight × (1 + reps / 30)`).

**Settings** covers units (kg/lb), default rest, sound and vibration, Drive sync,
and file export/import.

---

## How your data is kept safe

Reliability was the main design constraint, so:

- **Nothing needs a network.** Every change is written to on-device storage
  (IndexedDB, mirrored to localStorage) the moment you make it. Gyms have bad
  signal; the app does not care.
- **An in-progress session survives anything.** Reload the page, lock the phone,
  or have iOS kill the tab mid-set — reopening puts you back exactly where you
  were, rest timer included.
- **Sync merges, it never overwrites.** Every record carries a timestamp. A sync
  downloads the Drive file, merges it with what is on the device (newest change
  per record wins, deletions propagate as tombstones), and uploads the result. A
  session logged offline on your phone cannot be wiped by a sync from anywhere
  else.
- **The app can only see its own file.** It asks for the `drive.file` scope,
  which grants access to files the app itself created — one file called
  `workout-tracker-data.json` — and nothing else in your Drive.
- **You always have an escape hatch.** *Settings → Export file* writes a plain
  JSON backup; *Import file* merges one back in. Drive also keeps its own
  version history for that file, so you can roll back from
  [drive.google.com](https://drive.google.com) if you ever need to.

Sync runs on launch, after you finish a workout, when the connection comes back,
and whenever you tap the badge in the top-right. The badge tells you where things
stand; you should never need to open the JSON file yourself.

---

## Development

Everything is dependency-free ES modules — no build step, no bundler, no
framework. Open `index.html` through any static server and it runs.

```bash
# serve locally
npx http-server . -p 8080

# unit tests (the sync merge rules)
node --test tests/merge.test.mjs

# browser tests (33 checks at iPhone viewport, including full offline operation)
npm install --no-save playwright && npx playwright install chromium
node tests/app.e2e.mjs
```

| Path | What it does |
| --- | --- |
| `js/state.js` | Storage, the data model, and the merge rules |
| `js/workout.js` | Active sessions, personal bests, progress maths |
| `js/drive.js` | Google sign-in and the Drive sync cycle |
| `js/timer.js` | Rest timer (deadline-based, survives backgrounding) |
| `js/charts.js` | Hand-rolled SVG charts |
| `js/ui.js` | DOM helpers, bottom sheets, the exercise picker |
| `js/views/` | One file per tab |
| `sw.js` | Service worker — caches the app shell for offline use |
| `tools/make_icons.py` | Regenerates the app icons |

Data is one JSON document. Collections (`exercises`, `routines`, `workouts`) are
keyed by id, and every record has `updatedAt` plus a `deleted` flag. Anything
under `local` (your client ID, the Drive file id, the device id) stays on the
device and is never written to Drive.

To change the app icon, edit the shapes in `tools/make_icons.py` and run
`python3 tools/make_icons.py`.

After editing any file listed in `SHELL` in `sw.js`, bump `VERSION` there so
installed copies pick up the new code.
