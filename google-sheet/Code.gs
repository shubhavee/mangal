/**
 * Wedding RSVP + Travel → Google Sheet
 * Paste into: Google Sheet → Extensions → Apps Script. Then Deploy → New deployment → Web app
 * (Execute as: Me, Who has access: Anyone). Copy the URL into config.js → rsvp.sheetEndpoint.
 *
 * Tabs are created automatically: "RSVPs" and "Travel". Tickets are saved to a Drive folder.
 * File → Download → Microsoft Excel (.xlsx) any time.
 */

const TICKETS_FOLDER = "Wedding Travel Tickets";

const RSVP_HEADERS = ["Updated", "Name", "Phone", "Attending", "Side", "Guests", "Days", "From", "Message", "Source", "Travel shared?"];
const TRAVEL_HEADERS = ["Submitted", "Name", "Phone", "Mode", "Flight/Train", "Arrival", "Arriving at", "Departure", "Travellers", "Stay", "Ticket link", "Source"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.type === "rsvp") saveRsvp(d);
    else if (d.type === "travel") saveTravel(d);
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
  const row = [new Date(), d.name, "'" + d.phone, d.attending, d.side || "", d.guests || "", d.events || "", d.from || "", d.message || "", d.source || "Website"];
  // Same phone number again = guest changed their answer → update their row.
  const r = findRow(sh, d.phone);
  if (r) sh.getRange(r, 1, 1, row.length).setValues([row]);
  else sh.appendRow(row.concat(["No"]));
}

function saveTravel(d) {
  let link = d.fileUrl || "";
  if (d.fileData) {
    const blob = Utilities.newBlob(Utilities.base64Decode(d.fileData), d.fileType || "application/octet-stream", `${d.name} - ${d.phone} - ${d.fileName || "ticket"}`);
    link = folder().createFile(blob).getUrl();
  }
  tab("Travel", TRAVEL_HEADERS).appendRow([
    new Date(), d.name, "'" + d.phone, d.mode || "", d.number || "", d.arrival || "", d.arrivalAt || "",
    d.departure || "", d.travellers || "", d.stay || "", link, d.source || "Website",
  ]);
  const rs = tab("RSVPs", RSVP_HEADERS);
  const r = findRow(rs, d.phone);
  if (r) rs.getRange(r, RSVP_HEADERS.indexOf("Travel shared?") + 1).setValue("Yes");
}

/** Guests who said Yes but haven't shared travel yet. */
function pendingTravel() {
  const sh = tab("RSVPs", RSVP_HEADERS);
  return sh.getDataRange().getValues().slice(1)
    .filter((r) => r[RSVP_HEADERS.indexOf("Attending")] === "Yes" && r[RSVP_HEADERS.indexOf("Travel shared?")] !== "Yes")
    .map((r) => ({ name: r[1], phone: String(r[2]).replace(/\D/g, "") }));
}

/* ---------- Jan 1 travel reminders (sent from your own WhatsApp, one tap each) ---------- */

// Your hosted site URL, e.g. "https://our-wedding.netlify.app/"
const SITE_URL = "https://shubhikashubhavee.github.io/srishti-weds-shubham/";
const REMINDER_TEXT = (name, link) =>
  `Hi ${name}! 🙏 Hope you're excited for the wedding in Bengaluru 🎉\n\n` +
  `If you've booked your travel, please share your arrival details & ticket here so we can arrange your pickup:\n${link}\n\n` +
  `Takes 1 minute. Thank you! ❤️`;

function onOpen() {
  SpreadsheetApp.getUi().createMenu("💍 Wedding")
    .addItem("Build travel reminder links", "buildReminderLinks")
    .addToUi();
}

/**
 * Creates/refreshes the "Reminders" tab: every Yes guest who hasn't shared travel yet,
 * with a WhatsApp link that opens a chat with them and a personalised message ready to send.
 * On 1 Jan, open this tab on your phone and tap each link, then Send.
 */
function buildReminderLinks() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const old = ss.getSheetByName("Reminders");
  if (old) ss.deleteSheet(old);
  const sh = tab("Reminders", ["Name", "Phone", "Tap to send on WhatsApp", "Sent? (tick)"]);
  const rows = pendingTravel().map((g) => {
    const first = String(g.name).trim().split(" ")[0];
    const personal = `${SITE_URL}?name=${encodeURIComponent(g.name)}&phone=${g.phone.slice(-10)}#travel`;
    const wa = `https://wa.me/91${g.phone.slice(-10)}?text=${encodeURIComponent(REMINDER_TEXT(first, personal))}`;
    return [g.name, "'" + g.phone, `=HYPERLINK("${wa}","Send reminder ➜")`, false];
  });
  if (rows.length) {
    sh.getRange(2, 1, rows.length, 4).setValues(rows);
    sh.getRange(2, 4, rows.length, 1).insertCheckboxes();
  }
  SpreadsheetApp.getUi().alert(`${rows.length} guests still need to share travel details.`);
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

function findRow(sh, phone) {
  const want = String(phone).replace(/\D/g, "").slice(-10);
  const phones = sh.getRange(1, 3, Math.max(sh.getLastRow(), 1), 1).getValues();
  for (let i = 1; i < phones.length; i++) {
    if (String(phones[i][0]).replace(/\D/g, "").slice(-10) === want) return i + 1;
  }
  return 0;
}

function folder() {
  const it = DriveApp.getFoldersByName(TICKETS_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(TICKETS_FOLDER);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
