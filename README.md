# Wedding Invitation Website

A one-page Indian wedding invite (Delhi ❤ Bihar, in Bengaluru) with an RSVP Yes/No menu, travel-ticket collection,
background music, countdown, events, map and contacts. It's all plain HTML/CSS/JS with no build step.

| File | What it is |
|---|---|
| `config.js` | **All names, dates, events, venue, contacts and links. Edit only this file.** |
| `index.html`, `styles.css`, `script.js` | The site |
| `assets/` | Put `music.mp3` (and optionally `preview.jpg`) here |
| `google-sheet/Code.gs` | Saves RSVPs and travel details into a Google Sheet |

## 1. Preview on your laptop
Double-click `index.html`. (The map and fonts need internet.)

## 2. Connect the Google Sheet (free, about 10 min)
1. Create a new Google Sheet, e.g. "Wedding RSVPs".
2. **Extensions → Apps Script**. Delete what's there and paste in all of `google-sheet/Code.gs`. Save.
3. **Deploy → New deployment →** gear icon **→ Web app**. Set *Execute as*: **Me** and *Who has access*: **Anyone**. Click Deploy, then authorise.
4. Copy the **Web app URL** (ends in `/exec`) into `config.js` → `rsvp.sheetEndpoint`.
5. Submit a test RSVP. Tabs **RSVPs** and **Travel** appear automatically. Ticket uploads go to a Drive folder named
   *Wedding Travel Tickets*, and their links are saved in the sheet.
6. To get Excel: **File → Download → Microsoft Excel (.xlsx)**.

> If you change `Code.gs` later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.

Until `sheetEndpoint` is set, RSVPs still arrive as WhatsApp messages; they just aren't copied into the Sheet. Travel details go to `rsvp.fallbackNumber` on WhatsApp.

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
- People who say **Yes** also see **Remind me on 1 Jan** (a Google Calendar or iPhone calendar reminder to share tickets) and **Share tickets now**.
- If someone RSVPs again with the same phone number, their row is **updated**, not duplicated.
- The Travel tab marks **Travel shared? = Yes** on their RSVP row, so you can filter for who still hasn't shared.

## Jan 1 travel reminder (₹0, sent from your own WhatsApp)
1. In `Code.gs`, set `SITE_URL` to your hosted link and redeploy.
2. On 1 Jan 2027, open the Sheet and choose **💍 Wedding → Build travel reminder links**. (Reload the Sheet once if the menu isn't showing.)
3. The **Reminders** tab lists every Yes guest who hasn't shared travel yet, each with a **Send reminder ➜** link.
   On your phone (or your brother's), tap a link, then Send in WhatsApp, then tick it off. Each message includes a personal
   link that opens the travel form with the guest's name and number already filled in.
4. Their reply goes straight into the **Travel** tab. Run the menu again a week later to catch anyone who still hasn't shared.

Guests who tapped "Remind me" when they RSVP'd also get a reminder in their own calendar that day.

## Music
Add `assets/music.mp3` (see `assets/README.md`). Commercial Bollywood songs are copyrighted. For a private family invite
this is generally low-risk, but an instrumental or licensed version is the safest choice.
