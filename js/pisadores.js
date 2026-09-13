(() => {
  /* Capa VOZ: un pinchador a la vez. El siguiente espera 5–9 min.
     Se superpone a PGM (la cama no se corta). Exclusive via engine.busy. */
  const D = window.NEXAH || {};
  D.pinchMinMs = D.pinchMinMs || 5 * 60 * 1000;
  D.pinchMaxMs = D.pinchMaxMs || 9 * 60 * 1000;
  window.NEXAH = D;
})();
