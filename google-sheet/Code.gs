/**
 * Wedding RSVPs → Google Sheet
 * Paste into: Google Sheet → Extensions → Apps Script. Then Deploy → New deployment → Web app
 * (Execute as: Me, Who has access: Anyone). Copy the URL into config.js → rsvp.sheetEndpoint.
 *
 * The "RSVPs" tab is created automatically. File → Download → Microsoft Excel (.xlsx) any time.
 * Travel follow-ups: menu 💍 Wedding → Build travel follow-up links (see README.md).
 */

// One Yes/No column per RSVP day; must match the "key" of each day in the website's config.js.
// Guests on the 18-Jan-only invitation never pick 17 Jan, so theirs is always "No".
const DAY_KEYS = ["17 Jan", "18 Jan"];
// Travel details (all optional on the form) — for Divya's pickups and drops.
const TRAVEL = [["Arrival", "arrivalDate"], ["Arrival time", "arrivalTime"], ["Arrival by", "arrivalBy"], ["Arrival no.", "arrivalNo"],
  ["Departure", "departureDate"], ["Departure time", "departureTime"], ["Departure by", "departureBy"], ["Departure no.", "departureNo"]];
const RSVP_HEADERS = ["Updated", "Name", "Phone", "Invited by", "Invited for", "Attending", "Guests", "Guest 2", "Guest 3", "Guest 4",
  ...DAY_KEYS, "From", ...TRAVEL.map((t) => t[0]), "Message"];

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
  ensureLayout(sh);
  const row = [new Date(), d.name, d.phone ? "'" + d.phone : "", d.side || "", d.invite || "", d.attending, d.guests || "",
    d.guest2 || "", d.guest3 || "", d.guest4 || "",
    ...DAY_KEYS.map((k) => ((d.days || []).includes(k) ? "Yes" : "No")), d.from || "",
    // ' keeps "17 Jan" / "2:30 PM" as typed. Invitations that don't ask about travel (18 Jan only) get "N/A".
    ...TRAVEL.map((t) => (d.travelAsked === false ? "N/A" : d[t[1]] ? "'" + d[t[1]] : "")), d.message || ""];
  // Same phone number again = guest changed their answer (or added travel later) → update their row.
  const r = findRow(sh, d.phone);
  const rowNum = r || sh.getLastRow() + 1;
  sh.getRange(rowNum, 1, 1, row.length).setValues([row]);
  sh.getRange(rowNum, 1).setNumberFormat("dd/MM/yyyy HH:mm:ss");
  // Day columns are Yes/No dropdowns (harder to flip by accident than a tick box).
  const yesNo = SpreadsheetApp.newDataValidation().requireValueInList(["Yes", "No"], true).setAllowInvalid(false).build();
  sh.getRange(rowNum, RSVP_HEADERS.indexOf(DAY_KEYS[0]) + 1, 1, DAY_KEYS.length).setDataValidation(yesNo);
}

/* ---------- Travel follow-ups (sent from Divya's WhatsApp, one tap each) ---------- */

const FOLLOW_UP_TEXT = (name) =>
  `Hi ${name}! 🙏 This is Divya, the wedding planner for Srishti & Shubham's wedding in Bengaluru 🎉\n\n` +
  `To arrange your pickup and drop, could you please reply here with your arrival and departure ` +
  `date, time and flight/train number (or a screenshot of your ticket)?\n\n` +
  `Thank you! ❤️`;

function onOpen() {
  SpreadsheetApp.getUi().createMenu("💍 Wedding")
    .addItem("Build travel follow-up links", "buildFollowUps")
    .addToUi();
}

/**
 * Creates/refreshes the "Follow-ups" tab: every Yes guest whose Arrival is still empty,
 * with a WhatsApp link that opens a chat with them and the message ready to send.
 * Guests without a valid number (e.g. typed wrongly) are listed with a note to fix it on the RSVPs tab.
 * When a guest replies, fill in their Arrival / Departure columns on the RSVPs tab.
 */
function buildFollowUps() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const old = ss.getSheetByName("Follow-ups");
  if (old) ss.deleteSheet(old);
  const sh = tab("Follow-ups", ["Name", "Phone", "Guests", "Tap to message on WhatsApp", "Sent? (tick)"]);
  const col = (h) => RSVP_HEADERS.indexOf(h);
  const rows = tab("RSVPs", RSVP_HEADERS).getDataRange().getValues().slice(1)
    .filter((r) => r[col("Attending")] === "Yes" && !String(r[col("Arrival")]).trim())
    .map((r) => {
      const phone = String(r[col("Phone")]).replace(/\D/g, "").slice(-10);
      const first = String(r[col("Name")]).trim().split(" ")[0];
      if (phone.length !== 10) return [r[col("Name")], "", r[col("Guests")], "Fix phone in RSVPs tab", false];
      const wa = `https://wa.me/91${phone}?text=${encodeURIComponent(FOLLOW_UP_TEXT(first))}`;
      return [r[col("Name")], "'" + phone, r[col("Guests")], `=HYPERLINK("${wa}","Message ➜")`, false];
    });
  if (rows.length) {
    sh.getRange(2, 1, rows.length, 5).setValues(rows);
    sh.getRange(2, 5, rows.length, 1).insertCheckboxes();
  }
  SpreadsheetApp.getUi().alert(`${rows.length} guests still need to share their travel details.`);
}

function tab(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setNumberFormat("@").setValues([headers]).setFontWeight("bold").setBackground("#f6e7c4");
    sh.setFrozenRows(1);
  }
  return sh;
}

function findRow(sh, phone) {
  const norm = (v) => String(v).replace(/\D/g, "").slice(-10);
  const want = norm(phone);
  if (want.length !== 10) return 0;
  const vals = sh.getRange(1, RSVP_HEADERS.indexOf("Phone") + 1, Math.max(sh.getLastRow(), 1), 1).getValues();
  for (let i = 1; i < vals.length; i++) if (norm(vals[i][0]) === want) return i + 1;
  return 0;
}

// Bump this whenever RSVP_HEADERS or the formatting below changes; the sheet is re-laid-out once.
const LAYOUT_VERSION = "6";

// Header row as plain text (so "17 Jan" isn't read as a date), Yes = green / No = red colouring.
function ensureLayout(sh) {
  const props = PropertiesService.getDocumentProperties();
  if (props.getProperty("layout") === LAYOUT_VERSION) return;
  const n = RSVP_HEADERS.length;
  sh.getRange(1, 1, 1, n).setNumberFormat("@").setValues([RSVP_HEADERS])
    .setFontWeight("bold").setBackground("#f6e7c4").setHorizontalAlignment("left");
  const extra = sh.getLastColumn() - n; // leftover headers from an older layout
  if (extra > 0) sh.getRange(1, n + 1, 1, extra).clearContent().setBackground(null);

  const col = (h) => RSVP_HEADERS.indexOf(h) + 1;
  const ranges = [sh.getRange(2, col("Attending"), sh.getMaxRows() - 1, 1),
                  sh.getRange(2, col(DAY_KEYS[0]), sh.getMaxRows() - 1, DAY_KEYS.length)];
  const rule = (text, bg, fg) => SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo(text).setBackground(bg).setFontColor(fg).setBold(true).setRanges(ranges).build();
  sh.setConditionalFormatRules([rule("Yes", "#d8f3e1", "#1b7a43"), rule("No", "#fbdcdc", "#b3261e")]);
  sh.getRange(2, col(DAY_KEYS[0]), sh.getMaxRows() - 1, DAY_KEYS.length).setHorizontalAlignment("center");
  props.setProperty("layout", LAYOUT_VERSION);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
