(() => {
  const D = window.NEXAH;
  const engine = { playing: false, ducked: false, ctx: null, srcNode: null, gain: null, analyser: null, timer: null, lastPisa: 0, peak: 0, peakAt: 0 };
  function $(id) { return document.getElementById(id); }
  function nowAR() {
    return new Date().toLocaleString("es-AR", { timeZone: D.tz, hour: "2-digit", minute: "2-digit", hour12: true }).replace(".", "").replace("  ", " ");
  }
  function hourAR() {
    return Number(new Date().toLocaleString("en-GB", { timeZone: D.tz, hour: "2-digit", hour12: false }));
  }
  function currentShow() {
    const h = hourAR();
    return D.dayparts.find((p) => h >= p.from && h < p.to) || D.dayparts[0];
  }
  function setText(id, text) { const el = $(id); if (el) el.textContent = text; }
  function bootAudio() {
    const audio = $("stream");
    if (!audio || engine.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    engine.ctx = new AC();
    engine.srcNode = engine.ctx.createMediaElementSource(audio);
    engine.gain = engine.ctx.createGain();
    engine.analyser = engine.ctx.createAnalyser();
    engine.analyser.fftSize = 256;
    engine.analyser.smoothingTimeConstant = 0.72;
    engine.srcNode.connect(engine.gain);
    engine.gain.connect(engine.analyser);
    engine.analyser.connect(engine.ctx.destination);
    engine.gain.gain.value = 1;
  }
  function duck(on) {
    if (!engine.gain) return;
    engine.ducked = on;
    engine.gain.gain.cancelScheduledValues(engine.ctx.currentTime);
    engine.gain.gain.linearRampToValueAtTime(on ? 0.18 : 1, engine.ctx.currentTime + 0.18);
  }
  function speak(text) {
    if (!window.speechSynthesis) return Promise.resolve();
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "es-AR"; u.rate = 1.02;
      const voices = speechSynthesis.getVoices();
      const es = voices.find((v) => /es-AR|es_AR|es-MX|es-ES|Spanish/i.test(v.lang + v.name));
      if (es) u.voice = es;
      u.onend = resolve; u.onerror = resolve;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    });
  }
  async function firePisador(custom) {
    if (!engine.playing) return;
    const line = custom || D.pisadores[Math.floor(Math.random() * D.pisadores.length)];
    engine.lastPisa = Date.now();
    document.body.classList.add("on-drop");
    setText("dropLine", line);
    duck(true); await speak(line); duck(false);
    document.body.classList.remove("on-drop");
    setText("dropLine", "");
  }
  function scheduleDrops() {
    clearInterval(engine.timer);
    engine.timer = setInterval(() => {
      if (!engine.playing) return;
      if (Date.now() - engine.lastPisa < 90000) return;
      const roll = Math.random();
      if (roll < 0.55) firePisador();
      else if (roll < 0.72) firePisador(D.spots[Math.floor(Math.random() * D.spots.length)].line);
    }, 28000);
  }
  async function play() {
    const audio = $("stream"); if (!audio) return;
    bootAudio();
    if (engine.ctx && engine.ctx.state === "suspended") await engine.ctx.resume();
    if (!audio.src) audio.src = D.stream;
    try {
      await audio.play();
      engine.playing = true;
      document.body.classList.add("is-live");
      document.querySelectorAll("[data-play-label]").forEach((b) => { b.textContent = "PAUSA"; });
      setText("airState", "EN AIRE");
      scheduleDrops();
      if (Date.now() - engine.lastPisa > 4000) setTimeout(() => firePisador(D.pisadores[0]), 1200);
    } catch (err) {
      audio.src = D.streamFallback;
      try {
        await audio.play();
        engine.playing = true;
        document.body.classList.add("is-live");
        setText("airState", "EN AIRE");
        scheduleDrops();
      } catch (e2) { setText("airState", "SEÑAL CAÍDA"); engine.playing = false; }
    }
  }
  function pause() {
    const audio = $("stream"); if (audio) audio.pause();
    engine.playing = false;
    document.body.classList.remove("is-live");
    document.querySelectorAll("[data-play-label]").forEach((b) => { b.textContent = "ESCUCHAR"; });
    setText("airState", "LISTA");
    speechSynthesis && speechSynthesis.cancel();
  }
  function toggle() { engine.playing ? pause() : play(); }
  function drawSpectrum(canvas, freq) {
    const ctx = canvas.getContext("2d"); const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const n = freq.length, bar = w / n;
    for (let i = 0; i < n; i += 1) {
      const v = freq[i] / 255;
      ctx.fillStyle = v > 0.82 ? "#ff2e91" : v > 0.5 ? "#62f6ff" : "#2ee6a6";
      ctx.fillRect(i * bar, h - v * h, Math.max(1, bar - 1), v * h);
    }
  }
  function drawScope(canvas, wave) {
    const ctx = canvas.getContext("2d"); const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#62f6ff"; ctx.lineWidth = 1.4; ctx.beginPath();
    for (let i = 0; i < wave.length; i += 1) {
      const x = (i / (wave.length - 1)) * w;
      const y = (1 - wave[i] / 255) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  function tickMeters() {
    if (!engine.analyser) return;
    const freq = new Uint8Array(engine.analyser.frequencyBinCount);
    const wave = new Uint8Array(engine.analyser.fftSize);
    engine.analyser.getByteFrequencyData(freq);
    engine.analyser.getByteTimeDomainData(wave);
    let sum = 0, peak = 0;
    for (let i = 0; i < wave.length; i += 1) {
      const v = (wave[i] - 128) / 128; sum += v * v; peak = Math.max(peak, Math.abs(v));
    }
    const rms = Math.sqrt(sum / wave.length);
    const db = rms > 0.0001 ? 20 * Math.log10(rms) : -60;
    if (peak >= engine.peak || Date.now() - engine.peakAt > 1400) { engine.peak = peak; engine.peakAt = Date.now(); }
    const peakDb = engine.peak > 0.0001 ? 20 * Math.log10(engine.peak) : -60;
    setText("lvlDb", (db > -60 ? db.toFixed(1) : "-∞") + " dB");
    setText("peakDb", (peakDb > -60 ? peakDb.toFixed(1) : "-∞") + " PK");
    const clip = document.getElementById("clipLed");
    if (clip) clip.classList.toggle("on", peak > 0.92);
    if ($("vu")) drawSpectrum($("vu"), freq);
    if ($("vuMaster")) drawSpectrum($("vuMaster"), freq);
    if ($("vuScope")) drawScope($("vuScope"), wave);
    document.querySelectorAll("#faders .bar b").forEach((el, i) => {
      const idx = Math.min(freq.length - 1, Math.floor(i * freq.length / 18));
      el.style.height = Math.round((freq[idx] / 255) * 100) + "%";
    });
  }
  function clockLoop() {
    setText("clock", nowAR());
    const show = currentShow();
    setText("showName", show.title); setText("showHost", show.host); setText("showRange", show.range);
    tickMeters(); requestAnimationFrame(clockLoop);
  }
  window.NexahEngine = { play, pause, toggle, firePisador, currentShow, nowAR, hourAR, setText, engine };
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-play]")) toggle();
    const drop = e.target.closest("[data-drop]");
    if (drop) firePisador(drop.getAttribute("data-drop"));
  });
  clockLoop();
})();
