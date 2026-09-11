(() => {
  const D = window.NEXAH;
  const engine = {
    playing: false, ducked: false, busy: false,
    ctx: null, srcNode: null, gain: null, analyser: null,
    timer: null, lastPisa: 0, dropN: 0, voice: null
  };
  const FILES = {
    "PIS_OFF_001.mp3": "media/pis/PIS_OFF_001.mp3",
    "PIS_OFF_002.mp3": "media/pis/PIS_OFF_002.mp3",
    "PIS_OFF_003.mp3": "media/pis/PIS_OFF_003.mp3",
    "PIS_OFF_004.mp3": "media/pis/PIS_OFF_004.mp3",
    "PIS_OFF_005.mp3": "media/pis/PIS_OFF_005.mp3",
    "MUSICA_NEXA.mp3": "media/pis/MUSICA_NEXA.mp3",
    "NEXA_RADIO.mp3": "media/pis/NEXA_RADIO.mp3",
    "FULL_CORTO.mp3": "media/pis/FULL_CORTO.mp3"
  };
  const LABELS = {
    "PIS_OFF_001.mp3": "La radio está siempre en movimiento.",
    "PIS_OFF_002.mp3": "Estás escuchando Nexa Radio.",
    "PIS_OFF_003.mp3": "Una señal diferente. Una nueva forma de hacer radio.",
    "PIS_OFF_004.mp3": "Desde Formosa para cualquier lugar donde estés.",
    "PIS_OFF_005.mp3": "Staff de agentes inteligentes.",
    "MUSICA_NEXA.mp3": "Nexa Radio. Música para oídos inteligentes.",
    "NEXA_RADIO.mp3": "Nexa Radio.",
    "FULL_CORTO.mp3": "NEXAH. Señal completa."
  };
  const MAP = {
    id: "PIS_OFF_002.mp3", slogan: "PIS_OFF_001.mp3", formosa: "PIS_OFF_004.mp3",
    staff: "PIS_OFF_005.mp3", escena: "PIS_OFF_003.mp3", musica: "MUSICA_NEXA.mp3",
    nexa: "NEXA_RADIO.mp3", full: "FULL_CORTO.mp3"
  };
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
  function setLayer(name, on) {
    document.body.classList.toggle("layer-" + name, !!on);
    const led = document.querySelector("[data-layer='" + name + "']");
    if (led) led.classList.toggle("on", !!on);
  }
  function gapMs() {
    const min = D.pinchMinMs || 5 * 60 * 1000;
    const max = D.pinchMaxMs || 9 * 60 * 1000;
    return min + Math.floor(Math.random() * (max - min + 1));
  }
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
    engine.ducked = on;
    setLayer("voz", on);
    const audio = $("stream");
    const knob = $("vol");
    const vol = knob ? Number(knob.value) : 0.9;
    if (engine.gain && engine.ctx) {
      engine.gain.gain.cancelScheduledValues(engine.ctx.currentTime);
      engine.gain.gain.linearRampToValueAtTime(on ? 0.1 : 1, engine.ctx.currentTime + 0.12);
    } else if (audio) {
      audio.volume = on ? Math.max(0.06, vol * 0.1) : vol;
    }
  }
  function clipSrc(key) {
    const pack = window.NEXAH_PIS || {};
    if (key && pack[key]) return pack[key];
    if (key && FILES[key]) return FILES[key];
    const keys = Object.keys(pack).filter((k) => k.indexOf("PIS_OFF") === 0);
    if (keys.length) return pack[keys[Math.floor(Math.random() * keys.length)]];
    return FILES["PIS_OFF_001.mp3"];
  }
  function playClip(src) {
    return new Promise((resolve) => {
      if (!src) return resolve();
      if (engine.voice) { try { engine.voice.pause(); } catch (e) {} }
      const a = new Audio();
      a.preload = "auto";
      a.src = src;
      engine.voice = a;
      let done = false;
      const finish = () => { if (done) return; done = true; resolve(); };
      a.onended = finish;
      a.onerror = () => setTimeout(finish, 400);
      const safety = setTimeout(finish, 14000);
      a.play().then(() => {
        if (a.duration && isFinite(a.duration)) {
          clearTimeout(safety);
          setTimeout(finish, (a.duration * 1000) + 80);
        }
      }).catch(() => { clearTimeout(safety); finish(); });
    });
  }
  function scheduleDrops(wait) {
    clearTimeout(engine.timer);
    engine.timer = setTimeout(() => {
      if (!engine.playing) return;
      if (engine.busy) { scheduleDrops(20000); return; }
      firePisador(nextDropKind());
    }, wait == null ? gapMs() : wait);
  }
  async function firePisador(custom) {
    if (!engine.playing || engine.busy) return;
    const key = MAP[custom] || custom || "PIS_OFF_001.mp3";
    const src = clipSrc(key);
    engine.busy = true;
    engine.lastPisa = Date.now();
    engine.dropN += 1;
    document.body.classList.add("on-drop");
    setText("dropLine", LABELS[key] || "NEXAH");
    setLayer("id", true);
    duck(true);
    await playClip(src);
    duck(false);
    setLayer("id", false);
    document.body.classList.remove("on-drop");
    setText("dropLine", "");
    engine.busy = false;
    if (engine.playing) scheduleDrops();
  }
  function nextDropKind() {
    const wheel = ["id", "slogan", "formosa", "escena", "staff", "nexa", "musica"];
    return wheel[engine.dropN % wheel.length];
  }
  async function connectBed() {
    const audio = $("stream");
    const sources = [].concat(D.streams || [D.stream, D.streamFallback]).filter(Boolean);
    audio.loop = false;
    audio.onended = null;
    audio.crossOrigin = "anonymous";
    for (let i = 0; i < sources.length; i += 1) {
      audio.src = sources[i];
      try { await audio.play(); return true; } catch (err) {}
    }
    return false;
  }
  async function play() {
    const audio = $("stream");
    if (!audio) return;
    try { bootAudio(); } catch (e) { engine.ctx = null; }
    if (engine.ctx && engine.ctx.state === "suspended") await engine.ctx.resume();
    const ok = await connectBed();
    if (!ok) { setText("airState", "SEÑAL CAÍDA"); engine.playing = false; return; }
    engine.playing = true;
    engine.dropN = 0;
    document.body.classList.add("is-live");
    setLayer("pgm", true);
    document.querySelectorAll("[data-play-label]").forEach((b) => { b.textContent = "PAUSA"; });
    setText("airState", "EN AIRE");
    setText("pTitle", D.streamName || "NEXAH 01");
    setTimeout(() => firePisador("id"), 1600);
  }
  function pause() {
    const audio = $("stream");
    if (audio) audio.pause();
    if (engine.voice) try { engine.voice.pause(); } catch (e) {}
    engine.playing = false;
    engine.busy = false;
    clearTimeout(engine.timer);
    duck(false);
    document.body.classList.remove("is-live", "on-drop");
    setLayer("pgm", false); setLayer("voz", false); setLayer("id", false);
    document.querySelectorAll("[data-play-label]").forEach((b) => { b.textContent = "ESCUCHAR"; });
    setText("airState", "LISTA");
    setText("dropLine", "");
  }
  function toggle() { if (engine.playing) pause(); else play(); }
  engine.peak = 0; engine.peakAt = 0;
  function drawSpectrum(canvas, freq) {
    const ctx = canvas.getContext("2d"); const w = canvas.width; const h = canvas.height;
    ctx.clearRect(0, 0, w, h); const n = freq.length; const bar = w / n;
    for (let i = 0; i < n; i += 1) {
      const v = freq[i] / 255;
      ctx.fillStyle = v > 0.82 ? "#ff2e91" : v > 0.5 ? "#62f6ff" : "#2ee6a6";
      ctx.fillRect(i * bar, h - v * h, Math.max(1, bar - 1), v * h);
    }
  }
  function drawScope(canvas, wave) {
    const ctx = canvas.getContext("2d"); const w = canvas.width; const h = canvas.height;
    ctx.clearRect(0, 0, w, h); ctx.strokeStyle = "#62f6ff"; ctx.lineWidth = 1.4; ctx.beginPath();
    for (let i = 0; i < wave.length; i += 1) {
      const x = (i / (wave.length - 1)) * w; const y = (1 - wave[i] / 255) * h;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  function tickMeters() {
    if (!engine.analyser) return;
    const freq = new Uint8Array(engine.analyser.frequencyBinCount);
    const wave = new Uint8Array(engine.analyser.fftSize);
    engine.analyser.getByteFrequencyData(freq);
    engine.analyser.getByteTimeDomainData(wave);
    let sum = 0; let peak = 0;
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
    const vu = $("vu"); if (vu) drawSpectrum(vu, freq);
    const master = $("vuMaster"); if (master) drawSpectrum(master, freq);
    const scope = $("vuScope"); if (scope) drawScope(scope, wave);
    document.querySelectorAll("#faders .bar b").forEach((el, i) => {
      const idx = Math.min(freq.length - 1, Math.floor(i * freq.length / 18));
      el.style.height = Math.round((freq[idx] / 255) * 100) + "%";
    });
  }
  function clockLoop() {
    setText("clock", nowAR());
    const show = currentShow();
    setText("showName", show.title);
    setText("showHost", show.host);
    setText("showRange", show.range);
    tickMeters();
    requestAnimationFrame(clockLoop);
  }
  window.NexahEngine = { play, pause, toggle, firePisador, currentShow, nowAR, hourAR, setText, engine };
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-play]"); if (btn) toggle();
    const drop = e.target.closest("[data-drop]"); if (drop) firePisador(drop.getAttribute("data-drop"));
  });
  clockLoop();
})();
