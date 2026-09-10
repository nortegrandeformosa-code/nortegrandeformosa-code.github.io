(() => {
  const D = window.NEXAH;
  const E = window.NexahEngine;
  const box = document.getElementById("shows");
  if (box) {
    box.innerHTML = D.dayparts.map((p) =>
      "<article><small class=\"mono\">" + p.range + " · " + p.host + "</small><h4>" + p.title + "</h4><p>" + p.text + "</p></article>"
    ).join("");
  }
  async function cover() {
    try {
      const term = D.tracks[Math.floor(Math.random() * D.tracks.length)];
      const u = "https://itunes.apple.com/search?term=" + encodeURIComponent(term) + "&entity=song&limit=1";
      const j = await (await fetch(u)).json();
      const hit = j.results && j.results[0];
      if (!hit) return;
      const img = document.getElementById("nowArt");
      if (img) img.src = hit.artworkUrl100.replace("100x100", "1000x1000");
      E.setText("nowTrack", hit.trackName + " — " + hit.artistName);
      E.setText("pTitle", hit.trackName);
    } catch (e) {}
  }
  const cams = [
    "https://assets.mixkit.co/videos/52189/52189-720.mp4",
    "https://assets.mixkit.co/videos/52188/52188-720.mp4"
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
  cover();
  setInterval(cover, 52000);
  const vol = document.getElementById("vol");
  if (vol) vol.addEventListener("input", () => {
    document.getElementById("stream").volume = Number(vol.value);
  });
})();
