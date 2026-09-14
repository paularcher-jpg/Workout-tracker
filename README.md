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

Then switch Pages on once. The settings sidebar is hard to reach in the mobile
GitHub UI, so go straight to the page:

```
https://github.com/<your-username>/<repo>/settings/pages
```

Under **Build and deployment → Source**, choose **GitHub Actions**.

After that, every push to the default branch publishes the site via
`.github/workflows/pages.yml`. You can also trigger it from the **Actions** tab
with **Run workflow**.

(The workflow cannot turn Pages on for you: `actions/configure-pages` has an
`enablement` input, but creating a Pages site needs admin rights that the
default `GITHUB_TOKEN` does not carry.)

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

**Plan** is your training schedule — which session falls on which day, laid out
forward on a calendar. The Train tab then leads with today's session, so you
open the app and press start.

Every scheduled session has a Start button, not just today's, and the list runs
from Monday so a session you missed earlier in the week is still on screen. Life
rarely matches the plan: do Friday's legs on a Wednesday if that is when you get
to the gym. A workout is always logged on the day you actually did it, whichever
day it was planned for, and the week's schedule ticks it off wherever it sat.

The fastest way to set one up is **Plan → Paste a plan**, which reads either a
spreadsheet or plain text.

### From a CSV

Upload the spreadsheet your programme came in. The only column it insists on is
**Exercise**; everything else is used if present:

| Column | Used for |
| --- | --- |
| `Phase` / `Block` | Groups sessions that share a stretch of weeks |
| `Weeks` | Which weeks that phase covers — `1-2`, `3-9`, `4` |
| `Workout` / `Session` / `Day` | Splits rows into separate sessions |
| `Order` | Exercise order within a session |
| `Exercise` | The movement (required) |
| `Sets`, `Reps` | `10`, `6-8`, `30s`, `10 each` all understood |
| `Rest` | Seconds, or `2min` |
| `RPE` | Shown as a target during the session |
| `Notes` | Coaching cues, shown under the exercise |

Phases are laid out across the weeks they cover, so a plan with
`Phase 1 / weeks 1-2` and `Phase 2 / weeks 3-9` becomes a nine-week calendar.
Each session becomes one routine, reused by every week that needs it, rather
than a copy per week.

Where a CSV names sessions but not weekdays, they are spread across the week —
two sessions land on Monday and Thursday, three on Monday, Wednesday and
Friday — and you can move them afterwards.

### From plain text

```
Monday - Push
  Barbell Bench Press 4x8 rest 180
  Incline Dumbbell Press 3x8-12
  Lateral Raise 3x15 @60s
Tuesday - Rest
Wednesday: Pull
  Deadlift 3x5 rest 240
```

- Day headings take `-`, `:`, `–` or `—`, with full or short weekday names.
  `Day 1` / `Day 2` also work, for rotating plans that ignore weekdays.
- Rest days can be written out (`Tuesday - Rest`) or just left out.
- Sets and reps as `4x8`, `3 x 12`, or a range like `3x8-12`.
- Rest as `rest 180`, `@90s`, or `3min`; `RPE 8` is picked up too.
- `Week 2` starts a new week, for blocks that progress.
- Anything it cannot read is reported rather than silently dropped.

### Repeating, or finishing

A single-week plan repeats: week 1 runs again every week, which is what an
ongoing split wants. A multi-week block is treated as finite — it runs its
weeks once and then reports *Plan complete* rather than quietly starting over
at week 1, with the option to run it again from the current week or import a
new block. Toggle this under **Plan → Edit plan → Repeat when it ends**.

### Before anything is saved

Either way you get a preview: the sessions found, how the weeks lay out, and
every exercise that would be added to your library. Importing only ever adds —
nothing existing is changed or removed.

Exercise names are matched ignoring case, spaces and punctuation, so
`Chest Supported Row` finds the library's `Chest-Supported Row`. Matching is
deliberately strict beyond that: anything else becomes a new exercise under your
plan's own name. Fuzzy matching would fold `Side Plank` into `Plank` and quietly
merge two exercises' history, which is much worse than carrying a near-duplicate.

You can also build a plan by hand, and edit the day-by-day grid afterwards under
**Plan → Edit plan**.

**Routines** are the underlying templates — Push, Pull, Legs, or whatever you
follow. Starting one pre-fills every exercise with the weights you used last
time. Targets from a plan (`3×8–12`, `RPE 8`, a 30-second hold, `10 each`) show
on the exercise rather than being typed into the reps box — only a plain number
is ever prefilled, since a range is a choice you make on the day.

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

## Design

The interface is a single stylesheet driven by CSS custom properties, so the
whole look can be retuned without touching a line of application code.

Two rules hold it together:

- **Numbers are the content.** Weights, reps and the clock get the largest type,
  tabular figures and the tightest tracking. Everything else is quiet
  supporting text.
- **Cold by default, warm only for achievement.** The interface is arctic blue
  throughout; ember appears exclusively when you beat a personal best, so
  colour carries meaning rather than decoration.

Measured floors, re-checked in both colour schemes after any change:

- **Every text/background pair clears WCAG AA** (4.5:1 body, 3:1 large and UI).
- **Every interactive target is at least 44x44** (Apple HIG).
- **A completed set is obvious without reading it** — the row fills, not just a
  border shift, and the tick repaints on tap rather than on the next re-render.

Three constraints the stylesheet holds to, checked by a design detector:

- **No chromatic glow.** Coloured halo shadows and saturated radial-gradient
  washes on a dark page are the default "cool" look of generated UI. Elevation
  is neutral; depth comes from a quiet tonal gradient and layered material.
- **No overshoot easing.** Real objects decelerate, they do not bounce past
  their resting position, so motion uses ease-out-quint and ease-out-expo.
- **Animate transform and opacity only.** The rest-timer fill scales on the
  compositor rather than animating `width`, which would re-lay out the bar
  every frame of a three-minute countdown.

Translucency (`backdrop-filter`) is reserved for floating chrome — the tab bar,
rest timer, sheets and toasts — and never applied to scrolling content, where
it costs frames on iOS for no visual gain. Swapping the accent is a one-line
change to `--accent` / `--accent-deep`.

## Development

Everything is dependency-free ES modules — no build step, no bundler, no
framework. Open `index.html` through any static server and it runs.

```bash
# serve locally
npx http-server . -p 8080

# unit tests (sync merge rules, schedule maths, the plan parser)
node --test tests/merge.test.mjs tests/program.test.mjs tests/planparse.test.mjs

# the schedule maths must hold in any timezone — day arithmetic is calendar
# based, because a day is 23 or 25 hours long across a clock change
TZ=Europe/London node --test tests/program.test.mjs
TZ=Pacific/Chatham node --test tests/program.test.mjs

# browser tests (65 checks at iPhone viewport, including full offline operation)
npm install --no-save playwright && npx playwright install chromium
node tests/app.e2e.mjs
```

| Path | What it does |
| --- | --- |
| `js/state.js` | Storage, the data model, and the merge rules |
| `js/workout.js` | Active sessions, personal bests, progress maths |
| `js/program.js` | Schedule maths — which routine falls on which date, and when a plan ends |
| `js/planparse.js` | Reads a CSV or written plan into routines and a schedule |
| `js/drive.js` | Google sign-in and the Drive sync cycle |
| `js/timer.js` | Rest timer (deadline-based, survives backgrounding) |
| `js/charts.js` | Hand-rolled SVG charts |
| `js/ui.js` | DOM helpers, bottom sheets, the exercise picker |
| `js/views/` | One file per tab |
| `assets/app.css` | The entire visual design — tokens, material, layout |
| `sw.js` | Service worker — caches the app shell for offline use |
| `tools/make_icons.py` | Regenerates the app icons |

Data is one JSON document. Collections (`exercises`, `routines`, `programs`,
`workouts`) are keyed by id, and every record has `updatedAt` plus a `deleted` flag. Anything
under `local` (your client ID, the Drive file id, the device id) stays on the
device and is never written to Drive.

To change the app icon, edit the shapes in `tools/make_icons.py` and run
`python3 tools/make_icons.py`.

After editing any file listed in `SHELL` in `sw.js`, bump `VERSION` there so
installed copies pick up the new code.
