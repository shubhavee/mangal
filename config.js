/* ==========================================================================
   WEDDING DETAILS — edit everything in this one file.
   Anything in [SQUARE BRACKETS] is a placeholder to fill in later.
   ========================================================================== */
window.WEDDING = {
  bride: {
    name: "Srishti",
    fullName: "Srishti [Surname]",
    city: "New Delhi",
    parents: "D/o [Mr. & Mrs. Bride's Parents]",
  },
  groom: {
    name: "Shubham",
    fullName: "Shubham [Surname]",
    city: "[City], Bihar",
    parents: "S/o [Mr. & Mrs. Groom's Parents]",
  },

  hashtag: "#SriShubhVivah",

  // Main wedding muhurat — drives the countdown. Keep the +05:30 (IST).
  weddingDate: "2027-01-18T18:00:00+05:30",
  displayDate: "17 – 19 January 2027",
  rsvpBy: "15th December 2026",

  venue: {
    name: "Nature Knots",
    address: "Nrithyagram, Hesaraghatta Grass Farm, Bengaluru, Karnataka 560089",
    // Google Maps → Share → copy link
    mapsLink: "https://maps.app.goo.gl/bYrDofh3DhiKNLjR9",
    // Google Maps → Share → Embed a map → copy only the src="..." URL
    mapsEmbed: "https://www.google.com/maps?q=Nature+Knots,+Nrithyagram,+Hesaraghatta,+Bengaluru&output=embed",
  },

  // Edit, add or remove events freely. "time", "dress" and "note" are optional.
  // Replace "Morning" etc. with exact times once fixed, e.g. "9:30 AM".
  events: [
    { name: "Puja", hindi: "पूजा", date: "Sunday, 17 Jan 2027", time: "Morning", note: "We begin with blessings for the days ahead." },
    { name: "Haldi", hindi: "हल्दी", date: "Sunday, 17 Jan 2027", time: "Afternoon", dress: "Yellow", note: "Turmeric, laughter and a lot of mess." },
    { name: "Sangeet", hindi: "संगीत", date: "Sunday, 17 Jan 2027", time: "Night", dress: "Festive / Indo-western", note: "Dhol, dance-offs and Delhi-meets-Bihar beats." },
    { name: "Puja", hindi: "पूजा", date: "Monday, 18 Jan 2027", time: "Morning", note: "Wedding-day rituals with the families." },
    { name: "Baraat", hindi: "बारात", date: "Monday, 18 Jan 2027", time: "Afternoon", dress: "Traditional", note: "Dance the groom all the way to the mandap." },
    { name: "Vivah", hindi: "विवाह", date: "Monday, 18 Jan 2027", time: "Evening", dress: "Traditional", note: "The pheras — the moment we've all been waiting for." },
    { name: "Reception", hindi: "स्वागत समारोह", date: "Monday, 18 Jan 2027", time: "Night", dress: "Formal / Glam", note: "Celebrate the newlyweds over dinner and music." },
    { name: "Vidaai", hindi: "विदाई", date: "Tuesday, 19 Jan 2027", time: "Morning", note: "Shubham takes Srishti home as the families send them off with love." },
  ],
  mealsNote: "Breakfast, lunch, hi-tea and dinner will be served on all days.",

  rsvp: {
    // Guests pick whose side they're from; their RSVP opens a WhatsApp chat with that person.
    // Country code + number, digits only, e.g. "919876543210".
    sides: [
      { label: "Srishti's side", name: "Srishti", whatsapp: "[91XXXXXXXXXX]" },
      { label: "Shubham's side", name: "Shubham", whatsapp: "[91XXXXXXXXXX]" },
    ],
    // Used if a side's number above isn't filled in yet.
    fallbackNumber: "917738836237",
    // Paste the Google Apps Script Web App URL here (see README.md, step 2)
    // so every RSVP is also saved privately in your Google Sheet.
    sheetEndpoint: "https://script.google.com/macros/s/AKfycbxXevmqaALIbCEW3Xc_FlMqs7lAH4VTy6siavBF8szm3Fv-phLzKGVqVaIFyKl3AzvJDw/exec",
  },

  // Points of contact shown on the site
  contacts: [
    { role: "Bride's side", name: "[Name]", phone: "+91 [XXXXX XXXXX]" },
    { role: "Groom's side", name: "[Name]", phone: "+91 [XXXXX XXXXX]" },
    { role: "Wedding Planner · Travel & Stay", name: "Divya", phone: "+91 [XXXXX XXXXX]" },
  ],

  // Background music. Either drop an mp3 at `music` (preferred), OR paste a YouTube
  // link/ID in `musicYouTube` (used only when the mp3 is missing). Button hides if neither works.
  music: "assets/music.mp3",
  musicYouTube: "https://www.youtube.com/watch?v=3qpxJEp4Ec4", // Kudmayi (Film Version), Saregama
  musicStart: 6, // seconds to skip at the start (also used when it loops)
};
