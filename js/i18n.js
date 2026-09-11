(() => {
  const I18N = {
    es: {
      "nav.listen": "Escuchar", "nav.serie": "Serie", "nav.pass": "Credencial", "nav.partners": "Partners", "nav.booth": "Cabina",
      "meta.cam": "CAM 02 · Detrás del locutor · Estudio A",
      "hero.lead": "Cama continua: alternativa, rock y house. Los pinches entran encima, uno por ciclo de 5 a 9 minutos. La música no se corta.",
      "hero.play": "ESCUCHAR AHORA", "hero.note": "El audio comienza cuando das play",
      "yt.kicker": "Canal YouTube NEXAH", "news.kicker": "Noticias",
      "s1.k": "La señal", "s1.h": "Una radio para escuchar. Y también <em>para mirar.</em>",
      "s1.a": "Cama alt / rock / house.", "s1.ap": "Broadcast gratuito. El piso no se apaga.",
      "s1.b": "Pisadores sobre la música.", "s1.bp": "Un pinchador. El siguiente espera 5 a 9 minutos.",
      "s1.c": "Serie P01–P08.", "s1.cp": "Cortes reales. No se pisan entre sí.",
      "cur.k": "Curaduría NEXAH", "cur.h": "No es una playlist.<br><em>Es un recorrido.</em>",
      "s2.h": "Música. Cultura. <em>Tecnología.</em>"
    },
    en: {
      "nav.listen": "Listen", "nav.serie": "Series", "nav.pass": "Pass", "nav.partners": "Partners", "nav.booth": "Booth",
      "meta.cam": "CAM 02 · Behind the host · Studio A",
      "hero.lead": "Continuous bed: alternative, rock and house. Drops sit on top, one every 5 to 9 minutes. The music never cuts.",
      "hero.play": "LISTEN NOW", "hero.note": "Audio starts when you hit play",
      "yt.kicker": "NEXAH YouTube channel", "news.kicker": "News",
      "s1.k": "The signal", "s1.h": "A radio to hear. And also <em>to watch.</em>",
      "s1.a": "Alt / rock / house bed.", "s1.ap": "Free broadcast. The floor never goes dark.",
      "s1.b": "IDs over the music.", "s1.bp": "One drop. The next waits 5 to 9 minutes.",
      "s1.c": "Series P01–P08.", "s1.cp": "Real cuts. They never overlap.",
      "cur.k": "NEXAH programming", "cur.h": "Not a playlist.<br><em>A route.</em>",
      "s2.h": "Music. Culture. <em>Technology.</em>"
    }
  };
  function apply(lang) {
    const pack = I18N[lang] || I18N.es;
    document.documentElement.lang = lang === "en" ? "en" : "es-AR";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (pack[key]) el.textContent = pack[key];
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (pack[key]) el.innerHTML = pack[key];
    });
    document.querySelectorAll("[data-lang]").forEach((b) => {
      b.classList.toggle("on", b.getAttribute("data-lang") === lang);
    });
    document.body.setAttribute("data-lang", lang);
    try { localStorage.setItem("nexah-lang", lang); } catch (e) {}
    window.dispatchEvent(new CustomEvent("nexah-lang", { detail: lang }));
  }
  const start = (() => { try { return localStorage.getItem("nexah-lang") || "es"; } catch (e) { return "es"; } })();
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-lang]");
    if (btn) apply(btn.getAttribute("data-lang"));
  });
  window.NexahI18n = { apply, I18N };
  apply(start);
})();
