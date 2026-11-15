/**
 * Wedding RSVPs → Google Sheet
 * Paste into: Google Sheet → Extensions → Apps Script. Then Deploy → New deployment → Web app
 * (Execute as: Me, Who has access: Anyone). Copy the URL into config.js → rsvp.sheetEndpoint.
 *
 * The "RSVPs" tab is created automatically. File → Download → Microsoft Excel (.xlsx) any time.
 * Ticket follow-ups: menu 💍 Wedding → Build ticket follow-up links (see README.md).
 */

const RSVP_HEADERS = ["Updated", "Name", "Phone", "Attending", "Side", "Guests", "Days", "From", "Message", "Source", "Ticket received?"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.type === "rsvp") saveRsvp(d);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json({ ok: true, message: "Wedding RSVP endpoint is running." });
}

function saveRsvp(d) {
  const sh = tab("RSVPs", RSVP_HEADERS);
  const row = [new Date(), d.name, d.phone ? "'" + d.phone : "", d.attending, d.side || "", d.guests || "", d.events || "", d.from || "", d.message || "", d.source || "Website"];
  // Same guest again = they changed their answer → update their row (keeps "Ticket received?" and any phone added by hand).
  const r = findRow(sh, d.name);
  if (r) {
    if (!d.phone) row[2] = sh.getRange(r, 3).getValue();
    sh.getRange(r, 1, 1, row.length).setValues([row]);
  }
  else {
    sh.appendRow(row);
    sh.getRange(sh.getLastRow(), RSVP_HEADERS.length).insertCheckboxes();
  }
}

/* ---------- Ticket follow-ups (sent from Divya's WhatsApp, one tap each) ---------- */

const FOLLOW_UP_TEXT = (name) =>
  `Hi ${name}! 🙏 This is Divya, the wedding planner for Srishti & Shubham's wedding in Bengaluru (17–19 Jan) 🎉\n\n` +
  `To arrange your airport/station pickup, could you please reply here with your travel ticket (PDF or screenshot)?\n\n` +
  `Thank you! ❤️`;

function onOpen() {
  SpreadsheetApp.getUi().createMenu("💍 Wedding")
    .addItem("Build ticket follow-up links", "buildFollowUps")
    .addToUi();
}

/**
 * Creates/refreshes the "Follow-ups" tab: every Yes guest whose "Ticket received?" box isn't ticked,
 * with a WhatsApp link that opens a chat with them and the message ready to send.
 * The website doesn't ask for phone numbers, so add each guest's number in the RSVPs tab's Phone column
 * (copy it from the WhatsApp chat where their RSVP arrived). Guests without a number are listed with a note.
 * Guests reply with their ticket in that same chat; tick "Ticket received?" on the RSVPs tab when it arrives.
 */
function buildFollowUps() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const old = ss.getSheetByName("Follow-ups");
  if (old) ss.deleteSheet(old);
  const sh = tab("Follow-ups", ["Name", "Phone", "Guests", "Tap to message on WhatsApp", "Sent? (tick)"]);
  const col = (h) => RSVP_HEADERS.indexOf(h);
  const rows = tab("RSVPs", RSVP_HEADERS).getDataRange().getValues().slice(1)
    .filter((r) => r[col("Attending")] === "Yes" && r[col("Ticket received?")] !== true)
    .map((r) => {
      const phone = String(r[col("Phone")]).replace(/\D/g, "").slice(-10);
      const first = String(r[col("Name")]).trim().split(" ")[0];
      if (phone.length !== 10) return [r[col("Name")], "", r[col("Guests")], "Add phone in RSVPs tab", false];
      const wa = `https://wa.me/91${phone}?text=${encodeURIComponent(FOLLOW_UP_TEXT(first))}`;
      return [r[col("Name")], "'" + phone, r[col("Guests")], `=HYPERLINK("${wa}","Message ➜")`, false];
    });
  if (rows.length) {
    sh.getRange(2, 1, rows.length, 5).setValues(rows);
    sh.getRange(2, 5, rows.length, 1).insertCheckboxes();
  }
  SpreadsheetApp.getUi().alert(`${rows.length} guests still need to send their tickets.`);
}

function tab(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f6e7c4");
    sh.setFrozenRows(1);
  }
  return sh;
}

function findRow(sh, name) {
  const norm = (v) => String(v).trim().toLowerCase().replace(/\s+/g, " ");
  const want = norm(name);
  const names = sh.getRange(1, 2, Math.max(sh.getLastRow(), 1), 1).getValues();
  for (let i = 1; i < names.length; i++) if (norm(names[i][0]) === want) return i + 1;
  return 0;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
