(() => {
  const W = window.WEDDING;
  const $ = (s, el = document) => el.querySelector(s);
  const get = (path) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), W);
  const digits = (s) => String(s || "").replace(/\D/g, "");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const waLink = (number, text) => `https://wa.me/${digits(number)}?text=${encodeURIComponent(text)}`;

  /* ---------- Fill in text from config ---------- */
  document.querySelectorAll("[data-bind]").forEach((el) => { el.textContent = get(el.dataset.bind) ?? ""; });
  document.title = `${W.bride.name} & ${W.groom.name} · Wedding Invitation`;
  $("#mapFrame").src = W.venue.mapsEmbed;
  $("#mapsLink").href = W.venue.mapsLink;

  $("#eventList").innerHTML = W.days.map((day) => `
    <article class="day">
      <header class="day-head">
        <p class="day-label">${esc(day.label)}</p>
        <h3>${esc(day.date)}</h3>
      </header>
      <ol class="timeline">
        ${day.events.map((e) => `
        <li>
          <div class="t-when"><span class="t-period">${esc(e.period)}</span><span class="t-time">${esc(e.time)}</span></div>
          <div class="t-what">
            <p class="hindi">${esc(e.hindi)}</p>
            <h4>${esc(e.name)}</h4>
            ${e.dress ? `<p class="dress"><span>Dress code</span> ${esc(e.dress)}</p>` : ""}
          </div>
        </li>`).join("")}
      </ol>
    </article>`).join("");

  $("#eventChecks").innerHTML = W.days.map((day) =>
    `<label title="${esc(day.events.map((e) => e.name).join(", "))}"><input type="checkbox" name="events" value="${esc(day.short)}" checked /> ${esc(day.short)}</label>`).join("");

  $("#sideChoice").innerHTML = W.rsvp.sides.map((s, i) =>
    `<label class="choice-btn side"><input type="radio" name="side" value="${i}" required /><span>${esc(s.label)}</span></label>`).join("");
  const sideNumber = (side) => (digits(side.whatsapp).length >= 10 ? side.whatsapp : W.rsvp.fallbackNumber);

  $("#contactList").innerHTML = W.contacts.map((g) => `
    <div class="contact-group">
      <p class="role">${esc(g.side)}</p>
      ${g.people.map((c) => `
      <div class="contact">
        <h3>${esc(c.name)}</h3>
        <p class="relation">${esc(c.relation)}</p>
        <p class="contact-links">
          <a href="tel:+${esc(digits(c.phone))}">📞 ${esc(c.phone)}</a>
          ${digits(c.phone).length >= 10 ? `<a href="https://wa.me/${esc(digits(c.phone))}" target="_blank" rel="noopener">WhatsApp</a>` : ""}
        </p>
      </div>`).join("")}
    </div>`).join("");

  /* ---------- Scroll reveal ---------- */
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { threshold: 0.15 });
  document.querySelectorAll(".day, .family-card").forEach((el) => io.observe(el));

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
  const start = W.musicStart || 0;
  const setPlaying = (on) => musicBtn.classList.toggle("playing", on);
  // Guest's on/off choice, remembered for their next visit.
  let musicOn = true;
  try { musicOn = localStorage.getItem("music") !== "off"; } catch {}
  function setMusicOn(on) {
    musicOn = on;
    try { localStorage.setItem("music", on ? "on" : "off"); } catch {}
    musicBtn.setAttribute("aria-pressed", on);
    $(".music-label", musicBtn).textContent = on ? "Music On" : "Music Off";
    on ? player.play() : player.pause();
  }
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
  audio.addEventListener("loadedmetadata", () => { if (audio.currentTime < start) audio.currentTime = start; });
  audio.addEventListener("ended", () => { audio.currentTime = start; audio.play().catch(() => {}); });
  audio.addEventListener("error", () => {
    if (!ytId) return (musicBtn.hidden = true);
    useYt = true; loadYouTube();
  });
  audio.load();
  musicBtn.addEventListener("click", () => setMusicOn(!musicOn));

  // YouTube fallback: the player is kept invisible so only the audio comes through.
  function loadYouTube() {
    const box = document.createElement("div");
    box.id = "ytBox"; box.className = "yt-box";
    box.innerHTML = '<div id="ytPlayer"></div>';
    document.body.append(box);
    window.onYouTubeIframeAPIReady = () => {
      yt = new YT.Player("ytPlayer", {
        width: 120, height: 68, videoId: ytId,
        playerVars: { start, controls: 0, playsinline: 1, modestbranding: 1 },
        events: {
          onReady: () => { yt.setVolume(60); if (opened && musicOn) yt.playVideo(); },
          onStateChange: (e) => {
            setPlaying(e.data === 1);
            // Loop ourselves so every repeat also starts at musicStart.
            if (e.data === 0) { yt.seekTo(start, true); yt.playVideo(); }
          },
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
    setMusicOn(musicOn);
    if (!reduced) { burst(40); setInterval(dropPetal, 900); }
  });

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
    if (d.attending === "No") { delete d.guests; delete d.events; delete d.from; }

    const side = W.rsvp.sides[d.side];
    d.side = side.label;

    // Private copy in the Google Sheet (fire-and-forget so WhatsApp opens instantly).
    if (W.rsvp.sheetEndpoint) sendToSheet({ type: "rsvp", ...d }).catch(() => {});

    // The RSVP itself is a personal WhatsApp message to Srishti or Shubham.
    const lines = [
      d.attending === "Yes" ? `Hi ${side.name}! 🎉 Yes, I'll be there for your wedding!` : `Hi ${side.name}! 🙏 Sorry, I won't be able to make it to the wedding.`,
      "", `Name: ${d.name.trim()}`,
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
    $("#doneText").innerHTML = `Thank you, ${first}! Just hit <b>Send</b> in WhatsApp to confirm. Our wedding planner will get in touch closer to the date about your travel and pickup.`;
    if (!reduced) burst(60);

    done.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function linkBtn(label, href, cls, newTab = true) {
    const a = document.createElement("a");
    a.className = `btn ${cls}`; a.textContent = label; a.href = href;
    if (newTab) { a.target = "_blank"; a.rel = "noopener"; }
    return a;
  }


})();
