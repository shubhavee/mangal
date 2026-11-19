# Wedding Invitation Website

A one-page Indian wedding invite (Delhi ❤ Bihar, in Bengaluru) with an RSVP Yes/No menu, ticket follow-ups,
background music, countdown, events, map and contacts. It's all plain HTML/CSS/JS with no build step.

| File | What it is |
|---|---|
| `config.js` | **All names, dates, events, venue, contacts and links. Edit only this file.** |
| `index.html`, `styles.css`, `script.js` | The site |
| `assets/` | Put `music.mp3` (and optionally `preview.jpg`) here |
| `google-sheet/Code.gs` | Saves RSVPs into a Google Sheet and builds the ticket follow-up list |

## 1. Preview on your laptop
Double-click `index.html`. (The map and fonts need internet.)

## 2. Connect the Google Sheet (free, about 10 min)
1. Create a new Google Sheet, e.g. "Wedding RSVPs".
2. **Extensions → Apps Script**. Delete what's there and paste in all of `google-sheet/Code.gs`. Save.
3. **Deploy → New deployment →** gear icon **→ Web app**. Set *Execute as*: **Me** and *Who has access*: **Anyone**. Click Deploy, then authorise.
4. Copy the **Web app URL** (ends in `/exec`) into `config.js` → `rsvp.sheetEndpoint`.
5. Submit a test RSVP. A tab called **RSVPs** appears automatically.
6. To get Excel: **File → Download → Microsoft Excel (.xlsx)**.

> If you change `Code.gs` later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.

Until `sheetEndpoint` is set, RSVPs still arrive as WhatsApp messages; they just aren't copied into the Sheet.

## 3. Host it for free
**Option A: Netlify Drop (easiest, no Git).** Go to https://app.netlify.com/drop and drag this whole folder in.
You get a URL like `something.netlify.app` (renamable under Site settings). To update, drag the folder in again on the site's Deploys page.

**Option B: GitHub Pages.** Create a public repo, upload these files, then go to **Settings → Pages → Deploy from branch → main**.
The URL will be `yourname.github.io/repo`.

Both are free, fast (CDN) and HTTPS. A custom domain (e.g. `srishtiwedsshubham.in`, about ₹500–800/yr) is optional.

## How RSVP and travel work
- Guests open the link, tap **Open Invitation** (this starts the music, since browsers block autoplay), choose **Yes / No**,
  pick **Srishti's side / Shubham's side**, and fill in a few details.
- Tapping **Send RSVP on WhatsApp** opens a private chat with Srishti or Shubham (based on the side picked) with the RSVP
  pre-written, so they just hit Send. No group is involved, and nobody sees anyone else's reply. A copy also goes into the Google Sheet.
  Fill their numbers in `config.js` → `rsvp.sides`. Until then, RSVPs go to `rsvp.fallbackNumber`.
- If someone RSVPs again with the same phone number, their row is **updated**, not duplicated.

## Travel follow-ups (₹0, from Divya's WhatsApp)
Guests can add their arrival and departure (date, time, flight/train/road, number) in the RSVP form, or later by
submitting again with the same number. Share the Sheet with Divya (**Share → add her email as Editor**). For the rest:
1. In the Sheet, choose **💍 Wedding → Build travel follow-up links**. (Reload the Sheet once if the menu isn't showing.)
2. The **Follow-ups** tab lists every Yes guest whose **Arrival** is still empty, each with a **Message ➜** link.
3. Divya taps a link on her phone. WhatsApp opens the guest's chat with a polite message already written, and she hits Send.
4. When the guest replies, Divya fills in their Arrival / Departure columns on the RSVPs tab.
5. Run the menu again a few days later. Only guests still missing travel details will show up.

## Music
Add `assets/music.mp3` (see `assets/README.md`). Commercial Bollywood songs are copyrighted. For a private family invite
this is generally low-risk, but an instrumental or licensed version is the safest choice.
