(() => {
  const D = window.NEXAH;
  function lang() { return document.body.getAttribute("data-lang") === "en" ? "en" : "es"; }
  function paintShows() {
    const box = document.getElementById("shows");
    if (!box || !D.dayparts) return;
    const en = lang() === "en";
    box.innerHTML = D.dayparts.map((p) =>
      "<article><small class=\"mono\">" + p.range + " · " + p.host + "</small><h4>" +
      (en && p.titleEn ? p.titleEn : p.title) + "</h4><p>" +
      (en && p.textEn ? p.textEn : p.text) + "</p></article>"
    ).join("");
  }
  function paintWire() {
    const box = document.getElementById("wire");
    if (!box) return;
    const en = lang() === "en";
    box.innerHTML = (D.notes || []).slice(0, 4).map((n) =>
      "<article><small class=\"mono\">" + n.tag + "</small><h4>" +
      (en && n.titleEn ? n.titleEn : n.title) + "</h4><p>" +
      (en && n.leadEn ? n.leadEn : n.lead) + "</p></article>"
    ).join("");
  }
  function mountYouTube() {
    const box = document.getElementById("ytBox");
    if (!box) return;
    const video = D.youtubeVideo || "BbXKzd7cZkI";
    const channel = D.youtube || "https://www.youtube.com/@somosnexah";
    box.innerHTML =
      "<iframe title=\"NEXAH YouTube\" src=\"https://www.youtube-nocookie.com/embed/" + video +
      "?rel=0&modestbranding=1&mute=1\" allow=\"accelerometer; clipboard-write; encrypted-media; picture-in-picture\" allowfullscreen></iframe>" +
      "<a class=\"yt-link mono\" href=\"" + channel + "\" target=\"_blank\" rel=\"noopener\">@somosnexah →</a>";
  }
  function syncOnAir() {
    const live = document.body.classList.contains("is-live");
    const stamp = document.getElementById("onairState");
    if (stamp) stamp.textContent = live ? "ON AIR" : "STANDBY";
  }
  new MutationObserver(syncOnAir).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  syncOnAir();
  paintShows(); paintWire(); mountYouTube();
  window.addEventListener("nexah-lang", () => { paintShows(); paintWire(); });
  const vol = document.getElementById("vol");
  if (vol) vol.addEventListener("input", () => {
    const a = document.getElementById("stream");
    if (a) a.volume = Number(vol.value);
  });
  const cams = [
    "https://assets.mixkit.co/videos/52189/52189-720.mp4",
    "https://assets.mixkit.co/videos/2952/2952-720.mp4",
    "https://assets.mixkit.co/videos/2948/2948-720.mp4",
    "https://assets.mixkit.co/videos/2960/2960-720.mp4"
  ];
  let cam = 0;
  const bed = document.getElementById("bgStudio");
  if (bed) {
    bed.play().catch(() => {});
    setInterval(() => {
      cam = (cam + 1) % cams.length;
      bed.src = cams[cam];
      bed.play().catch(() => {});
    }, 22000);
  }
})();
