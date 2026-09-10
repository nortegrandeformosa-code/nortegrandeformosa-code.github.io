(() => {
  const D = window.NEXAH;
  const E = window.NexahEngine;
  const logEl = document.getElementById("log");
  const onNow = E.currentShow();
  function log(line) {
    logEl.insertAdjacentHTML("afterbegin", "<div>[" + E.nowAR() + "] " + line + "</div>");
  }
  document.getElementById("agents").innerHTML = D.agents.map((a) => {
    const hot = a.name === "Mazclin" || a.name === "Diego";
    const on = a.name === onNow.host || hot;
    return '<div class="strip' + (hot ? " hot" : on ? " on" : "") + '">' +
      '<i class="led"></i><div><small class="mono">' + a.desk + "</small><h4>" + a.name +
      "</h4><p>" + a.job + "</p></div><div class=\"fader\"><i></i></div></div>";
  }).join("");
  const faders = document.getElementById("faders");
  faders.innerHTML = Array.from({ length: 18 }, (_, i) => {
    const h = 18 + ((i * 17) % 82);
    return '<div class="bar"><b style="height:' + h + '%"></b></div>';
  }).join("");
  const queue = [
    { who: "Vero", kind: "SERVICIO", title: "Clima Formosa" },
    { who: "Pablo", kind: "MÚSICA", title: D.tracks[0] },
    { who: "Sofi", kind: "SPOT", title: D.spots[0].title },
    { who: "Lina", kind: "VOZ", title: "Pisador ID" },
    { who: "Diego", kind: "QA", title: "Validación de corte" }
  ];
  document.getElementById("queue").innerHTML = queue.map((q) =>
    '<div class="q"><small class="mono">' + q.who + " · " + q.kind + "</small><div>" + q.title + "</div></div>"
  ).join("");
  document.getElementById("inv").innerHTML = D.spots.map((s) =>
    '<div class="q"><small class="mono">' + s.dur + "</small><div>" + s.title + "</div></div>"
  ).join("");
  async function weather() {
    try {
      const u = "https://api.open-meteo.com/v1/forecast?latitude=-26.1849&longitude=-58.1731&current=temperature_2m&timezone=America%2FArgentina%2FBuenos_Aires";
      const j = await (await fetch(u)).json();
      const t = Math.round(j.current.temperature_2m);
      E.setText("wxBox", "Clima " + t + "° Formosa");
      log("<b>VERO</b> clima " + t + "° a mesa.");
    } catch (e) { log("Clima no disponible."); }
  }
  weather();
  log("<b>MAZCLIN</b> supervisor en vidriera. Calidad armada.");
  log("<b>DIEGO</b> reglas cargadas. Sin pase, no hay aire.");
  log("<b>KIRO</b> rack 24/7 online.");
  document.getElementById("vol").addEventListener("input", (ev) => {
    document.getElementById("stream").volume = Number(ev.target.value);
  });
  const cams = [
    "https://assets.mixkit.co/videos/52189/52189-720.mp4",
    "https://assets.mixkit.co/videos/2952/2952-720.mp4",
    "https://assets.mixkit.co/videos/2948/2948-720.mp4",
    "https://assets.mixkit.co/videos/2960/2960-720.mp4"
  ];
  const cam = document.getElementById("studioCam");
  let i = 0;
  if (cam) {
    cam.play().catch(() => {});
    setInterval(() => {
      i = (i + 1) % cams.length;
      cam.src = cams[i];
      cam.play().catch(() => {});
    }, 18000);
  }
})();
