(() => {
  const W = window.WEDDING;
  const $ = (s, el = document) => el.querySelector(s);
  const get = (path) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), W);
  const digits = (s) => String(s || "").replace(/\D/g, "");
  const phone10 = (s) => digits(s).slice(-10);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const waLink = (number, text) => `https://wa.me/${digits(number)}?text=${encodeURIComponent(text)}`;

  /* ---------- Fill in text from config ---------- */
  document.querySelectorAll("[data-bind]").forEach((el) => { el.textContent = get(el.dataset.bind) ?? ""; });
  document.title = `${W.bride.name} & ${W.groom.name} · Wedding Invitation`;
  $("#mapFrame").src = W.venue.mapsEmbed;
  $("#mapsLink").href = W.venue.mapsLink;

  $("#eventList").innerHTML = W.events.map((e) => `
    <article class="event">
      <p class="hindi">${esc(e.hindi)}</p>
      <h3>${esc(e.name)}</h3>
      <p class="meta">${esc(e.date)}${e.time ? ` · ${esc(e.time)}` : ""}</p>
      ${e.place ? `<p class="loc">${esc(e.place)}</p>` : ""}
      ${e.note ? `<p class="note">${esc(e.note)}</p>` : ""}
      ${e.dress ? `<span class="dress">Dress code: ${esc(e.dress)}</span>` : ""}
    </article>`).join("");

  const days = [...new Set(W.events.map((e) => e.date))];
  $("#eventChecks").innerHTML = days.map((day) => {
    const names = W.events.filter((e) => e.date === day).map((e) => e.name).join(", ");
    return `<label title="${esc(names)}"><input type="checkbox" name="events" value="${esc(day)}" checked /> ${esc(day)}</label>`;
  }).join("");

  $("#sideChoice").innerHTML = W.rsvp.sides.map((s, i) =>
    `<label class="choice-btn side"><input type="radio" name="side" value="${i}" required /><span>${esc(s.label)}</span></label>`).join("");
  const sideNumber = (side) => (digits(side.whatsapp).length >= 10 ? side.whatsapp : W.rsvp.fallbackNumber);

  $("#contactList").innerHTML = W.contacts.map((c) => `
    <div class="contact">
      <p class="role">${esc(c.role)}</p>
      <h3>${esc(c.name)}</h3>
      <a href="tel:${esc(digits(c.phone))}">${esc(c.phone)}</a>
    </div>`).join("");

  /* ---------- Scroll reveal ---------- */
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { threshold: 0.15 });
  document.querySelectorAll(".event").forEach((el) => io.observe(el));

  /* ---------- Countdown ---------- */
  const target = new Date(W.weddingDate).getTime();
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    const ms = Math.max(0, target - Date.now());
    $("#cd-d").textContent = Math.floor(ms / 864e5);
    $("#cd-h").textContent = pad(Math.floor(ms / 36e5) % 24);
    $("#cd-m").textContent = pad(Math.floor(ms / 6e4) % 60);
    $("#cd-s").textContent = pad(Math.floor(ms / 1e3) % 60);
  };
  tick(); setInterval(tick, 1000);

  /* ---------- Petals ---------- */
  const petals = $("#petals");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function dropPetal() {
    const p = document.createElement("span");
    p.className = "petal" + (Math.random() < 0.3 ? " rose" : "");
    p.style.left = Math.random() * 100 + "vw";
    p.style.setProperty("--drift", (Math.random() * 160 - 80) + "px");
    p.style.setProperty("--spin", (Math.random() * 720 - 360) + "deg");
    p.style.animationDuration = 6 + Math.random() * 6 + "s";
    petals.appendChild(p);
    p.addEventListener("animationend", () => p.remove());
  }
  function burst(n) { for (let i = 0; i < n; i++) setTimeout(dropPetal, i * 60); }

  /* ---------- Music (starts on "Open Invitation" tap; browsers block autoplay) ---------- */
  const audio = $("#bgm"), musicBtn = $("#musicBtn");
  const setPlaying = (on) => musicBtn.classList.toggle("playing", on);
  const ytId = (W.musicYouTube || "").match(/(?:v=|youtu\.be\/|embed\/|shorts\/)?([\w-]{11})(?:[?&#]|$)/)?.[1];
  let yt = null, useYt = false, opened = false;
  const player = {
    play: () => (useYt ? yt?.playVideo?.() : audio.play().catch(() => {})),
    pause: () => (useYt ? yt?.pauseVideo?.() : audio.pause()),
    paused: () => (useYt ? yt?.getPlayerState?.() !== 1 : audio.paused),
  };
  audio.preload = "metadata"; // so a missing file errors early and we can fall back
  audio.src = W.music;
  audio.addEventListener("play", () => setPlaying(true));
  audio.addEventListener("pause", () => setPlaying(false));
  audio.addEventListener("error", () => {
    if (!ytId) return (musicBtn.hidden = true);
    useYt = true; loadYouTube();
  });
  audio.load();
  musicBtn.addEventListener("click", () => (player.paused() ? player.play() : player.pause()));

  // YouTube fallback: a tiny player in the corner (YouTube needs it on screen to play).
  function loadYouTube() {
    const box = document.createElement("div");
    box.id = "ytBox"; box.className = "yt-box";
    box.innerHTML = '<div id="ytPlayer"></div>';
    document.body.append(box);
    window.onYouTubeIframeAPIReady = () => {
      yt = new YT.Player("ytPlayer", {
        width: 120, height: 68, videoId: ytId,
        playerVars: { loop: 1, playlist: ytId, controls: 0, playsinline: 1, modestbranding: 1 },
        events: {
          onReady: () => { yt.setVolume(60); if (opened) yt.playVideo(); },
          onStateChange: (e) => setPlaying(e.data === 1),
        },
      });
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.append(s);
  }

  /* ---------- Intro ---------- */
  document.body.classList.add("locked");
  $("#openInvite").addEventListener("click", () => {
    $("#intro").classList.add("gone");
    document.body.classList.remove("locked");
    opened = true;
    musicBtn.hidden = false;
    audio.volume = 0.6;
    player.play();
    if (!reduced) { burst(40); setInterval(dropPetal, 900); }
  });
  // Deep links (e.g. the travel reminder) skip the envelope.
  if (location.hash === "#travel") $("#openInvite").click();

  /* ---------- Sending to Google Sheet ---------- */
  async function sendToSheet(payload) {
    // text/plain keeps it a "simple" request so Apps Script accepts it without CORS preflight.
    await fetch(W.rsvp.sheetEndpoint, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
  }
  const formData = (form) => {
    const fd = new FormData(form), out = {};
    for (const [k, v] of fd) if (!(v instanceof File)) out[k] = out[k] ? `${out[k]}, ${v}` : v;
    return out;
  };

  /* ---------- RSVP ---------- */
  const rsvpForm = $("#rsvpForm");

  rsvpForm.addEventListener("change", (e) => {
    if (e.target.name === "attending") rsvpForm.classList.toggle("attending-yes", e.target.value === "Yes");
  });

  rsvpForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const status = $("#rsvpStatus");
    const d = formData(rsvpForm);
    if (!d.attending) return (status.textContent = "Please choose Yes or No.");
    if (d.side === undefined) return (status.textContent = "Please choose whose side you're from.");
    if (!d.name?.trim()) return (status.textContent = "Please enter your name.");
    if (phone10(d.phone).length !== 10) return (status.textContent = "Please enter a valid 10-digit mobile number.");
    if (d.attending === "No") { delete d.guests; delete d.events; delete d.from; }

    const side = W.rsvp.sides[d.side];
    d.side = side.label;

    // Private copy in the Google Sheet (fire-and-forget so WhatsApp opens instantly).
    if (W.rsvp.sheetEndpoint) sendToSheet({ type: "rsvp", ...d, phone: phone10(d.phone) }).catch(() => {});

    // The RSVP itself is a personal WhatsApp message to Srishti or Shubham.
    const lines = [
      d.attending === "Yes" ? `Hi ${side.name}! 🎉 Yes, I'll be there for your wedding!` : `Hi ${side.name}! 🙏 Sorry, I won't be able to make it to the wedding.`,
      "", `Name: ${d.name.trim()}`, `Phone: ${d.phone}`,
    ];
    if (d.attending === "Yes") lines.push(`Guests: ${d.guests}`, `Days: ${d.events || "-"}`, `Travelling from: ${d.from || "-"}`);
    if (d.message) lines.push("", d.message);
    const link = waLink(sideNumber(side), lines.join("\n"));
    window.open(link, "_blank");
    showDone(d, side, link);
  });

  function showDone(d, side, link) {
    rsvpForm.hidden = true;
    const done = $("#rsvpDone"); done.hidden = false;
    const actions = $("#doneActions"); actions.innerHTML = "";
    const first = esc(d.name.trim().split(" ")[0]);
    // In case the browser blocked the pop-up, or they closed WhatsApp without sending.
    actions.append(linkBtn(`Send my RSVP to ${side.name} on WhatsApp`, link, "btn-wa"));

    if (d.attending === "No") {
      $("#doneTitle").textContent = "We'll miss you 🙏";
      $("#doneText").innerHTML = `Thank you for letting us know, ${first}. Just hit <b>Send</b> in WhatsApp. Your blessings mean the world to us.`;
      done.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    $("#doneTitle").textContent = "Yay! See you in Bengaluru 🎉";
    $("#doneText").innerHTML = `Thank you, ${first}! Just hit <b>Send</b> in WhatsApp to confirm. Once you've booked your tickets, please share your travel details so we can arrange pickups. Set a reminder below so you don't forget.`;
    if (!reduced) burst(60);

    actions.append(linkBtn("Remind me on Google Calendar", googleCalLink(d), "btn-outline"));
    const ics = linkBtn("Remind me (iPhone / Outlook)", "#", "btn-outline");
    ics.addEventListener("click", (ev) => { ev.preventDefault(); downloadIcs(d); });
    actions.append(ics);
    actions.append(linkBtn("Already booked? Share tickets now", travelUrl(d), "btn-gold", false));
    done.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function linkBtn(label, href, cls, newTab = true) {
    const a = document.createElement("a");
    a.className = `btn ${cls}`; a.textContent = label; a.href = href;
    if (newTab) { a.target = "_blank"; a.rel = "noopener"; }
    return a;
  }

  /* ---------- Travel reminder (on the guest's own calendar) ---------- */
  function travelUrl(d) {
    const u = new URL(location.href.split("#")[0].split("?")[0]);
    u.searchParams.set("name", d.name); u.searchParams.set("phone", phone10(d.phone));
    return u + "#travel";
  }
  const reminder = (d) => {
    const ymd = W.travel.reminderDate.replace(/-/g, "");
    return {
      title: `Share travel tickets for ${W.bride.name} & ${W.groom.name}'s wedding`,
      details: `Please share your travel details so we can arrange pickups: ${travelUrl(d)}`,
      start: `${ymd}T043000Z`, end: `${ymd}T050000Z`, // 10:00–10:30 AM IST
    };
  };
  function googleCalLink(d) {
    const r = reminder(d);
    return "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(r.title)}&dates=${r.start}/${r.end}&details=${encodeURIComponent(r.details)}`;
  }
  function downloadIcs(d) {
    const r = reminder(d);
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding//Invite//EN", "BEGIN:VEVENT",
      `UID:${Date.now()}@wedding-invite`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART:${r.start}`, `DTEND:${r.end}`, `SUMMARY:${r.title}`, `DESCRIPTION:${r.details}`,
      "BEGIN:VALARM", "TRIGGER:-PT0M", "ACTION:DISPLAY", "DESCRIPTION:Share your travel tickets", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "share-travel-tickets.ics"; a.click();
  }

  /* ---------- Travel form ---------- */
  const travelForm = $("#travelForm");
  const params = new URLSearchParams(location.search);
  if (params.get("name")) travelForm.name.value = params.get("name");
  const travelPhone = phone10(params.get("phone")); // from the personal reminder link, if any

  const toBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1]);
    r.onerror = rej; r.readAsDataURL(file);
  });

  travelForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = $("#travelStatus");
    const name = travelForm.name.value.trim();
    const file = travelForm.ticket.files[0];
    if (!name) return (status.textContent = "Please enter your name.");
    if (!file) return (status.textContent = "Please choose your ticket file.");
    if (file.size > 5 * 1024 * 1024) return (status.textContent = "That file is over 5 MB. Please upload a smaller file or a screenshot.");

    const btn = $("button[type=submit]", travelForm);
    btn.disabled = true; status.textContent = "Uploading…";

    if (W.rsvp.sheetEndpoint) {
      try {
        await sendToSheet({ type: "travel", name, phone: travelPhone, fileName: file.name, fileType: file.type, fileData: await toBase64(file) });
        status.textContent = "Thank you! We've got your ticket ✈️";
        travelForm.reset();
      } catch { status.textContent = "Couldn't upload. Please try again."; }
    } else {
      // No sheet yet → hand the file to WhatsApp via the phone's share menu, or fall back to a chat.
      const text = `${name}'s travel ticket for ${W.bride.name} & ${W.groom.name}'s wedding`;
      if (navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], text }); status.textContent = "Thank you! ✈️"; } catch { status.textContent = ""; }
      } else {
        window.open(waLink(W.rsvp.fallbackNumber, text), "_blank");
        status.textContent = "Opening WhatsApp. Please attach your ticket in the chat.";
      }
    }
    btn.disabled = false;
  });
})();
