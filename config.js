/* ==========================================================================
   WEDDING DETAILS — edit everything in this one file.
   Anything in [SQUARE BRACKETS] is a placeholder to fill in later.
   ========================================================================== */
window.WEDDING = {
  bride: {
    name: "Srishti",
    fullName: "Srishti Jain",
    city: "New Delhi",
    relation: "Daughter of",
    parents: ["Mrs. Shashi Jain", "Mr. Kamlesh Kumar Jain"],
  },
  groom: {
    name: "Shubham",
    fullName: "Shubham Shamanyu",
    city: "Bihar",
    relation: "Son of",
    parents: ["Mrs. Sangeeta Prasad", "Mr. Surendra Prasad"],
  },

  hashtag: "#SriShubhVivah",

  // Main wedding muhurat — drives the countdown. Keep the +05:30 (IST).
  weddingDate: "2027-01-18T18:00:00+05:30",
  displayDate: "17 – 19 January 2027",

  venue: {
    name: "Nature Knots",
    address: "Nrithyagram, Hesaraghatta Grass Farm, Bengaluru, Karnataka 560089",
    // Google Maps → Share → copy link
    mapsLink: "https://maps.app.goo.gl/bYrDofh3DhiKNLjR9",
    // Google Maps → Share → Embed a map → copy only the src="..." URL
    mapsEmbed: "https://www.google.com/maps?q=Nature+Knots,+Nrithyagram,+Hesaraghatta,+Bengaluru&output=embed",
  },

  // Day-by-day programme, in order of time. Replace "[Time]" and "[Dress code]" once fixed.
  days: [
    {
      label: "Day One", date: "Sunday, 17 January 2027", short: "Sun, 17 Jan", key: "17 Jan",
      events: [
        { name: "Puja", hindi: "पूजा", period: "Morning", time: "[Time]", dress: "[Dress code]" },
        { name: "Haldi", hindi: "हल्दी", period: "Afternoon", time: "[Time]", dress: "Shades of yellow" },
        { name: "Sangeet", hindi: "संगीत", period: "Night", time: "[Time]", dress: "Festive / Indo-western" },
      ],
    },
    {
      label: "Day Two", date: "Monday, 18 January 2027", short: "Mon, 18 Jan", key: "18 Jan",
      events: [
        { name: "Puja", hindi: "पूजा", period: "Morning", time: "[Time]", dress: "[Dress code]" },
        { name: "Baraat", hindi: "बारात", period: "Afternoon", time: "[Time]", dress: "Traditional" },
        { name: "Vivah", hindi: "विवाह", period: "Evening", time: "[Time]", dress: "Traditional" },
        { name: "Reception", hindi: "स्वागत समारोह", period: "Night", time: "[Time]", dress: "Formal / Glam" },
      ],
    },
    {
      label: "Day Three", date: "Tuesday, 19 January 2027", short: "Tue, 19 Jan", key: "19 Jan",
      events: [
        { name: "Vidaai", hindi: "विदाई", period: "Morning", time: "[Time]", dress: "[Dress code]" },
      ],
    },
  ],

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
    { side: "Bride's side", people: [
      { name: "Kamlesh Kumar Jain", relation: "Father of the bride", phone: "+91 [XXXXX XXXXX]" },
      { name: "Kanishk Jain", relation: "Brother of the bride", phone: "+91 [XXXXX XXXXX]" },
    ] },
    { side: "Groom's side", people: [
      { name: "Surendra Prasad", relation: "Father of the groom", phone: "+91 77380 12309" },
      { name: "Shubhika Shubhavee", relation: "Sister of the groom", phone: "+91 77388 36237" },
    ] },
    { side: "Wedding planner", people: [
      { name: "Divya", relation: "Travel & stay", phone: "+91 [XXXXX XXXXX]" },
    ] },
  ],

  // Background music. Either drop an mp3 at `music` (preferred), OR paste a YouTube
  // link/ID in `musicYouTube` (used only when the mp3 is missing). Button hides if neither works.
  music: "assets/music.mp3",
  musicYouTube: "https://www.youtube.com/watch?v=3qpxJEp4Ec4", // Kudmayi (Film Version), Saregama
  musicStart: 6, // seconds to skip at the start (also used when it loops)
};
