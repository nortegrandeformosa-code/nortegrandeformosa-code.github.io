(() => {
  const D = window.NEXAH; const E = window.NexahEngine;
  const logEl = document.getElementById("log");
  const onNow = E.currentShow();
  function log(line) { logEl.insertAdjacentHTML("afterbegin", "<div>[" + E.nowAR() + "] " + line + "</div>"); }
  document.getElementById("agents").innerHTML = D.agents.map((a) => {
    const hot = a.name === "Mazclin" || a.name === "Diego";
    const on = a.name === onNow.host || hot;
    return '<div class="strip' + (hot ? " hot" : on ? " on" : "") + '"><i class="led"></i><div><small class="mono">' + a.desk + "</small><h4>" + a.name + "</h4><p>" + a.job + "</p></div><div class=\"fader\"><i></i></div></div>";
  }).join("");
  document.getElementById("faders").innerHTML = Array.from({length:18},(_,i)=>'<div class="bar"><b style="height:'+(18+(i*17)%82)+'%"></b></div>').join("");
  document.getElementById("queue").innerHTML = [
    {who:"Vero",kind:"SERVICIO",title:"Clima Formosa"},
    {who:"Pablo",kind:"MÚSICA",title:D.tracks[0]},
    {who:"Sofi",kind:"SPOT",title:D.spots[0].title},
    {who:"Diego",kind:"QA",title:"Validación de corte"}
  ].map(q=>'<div class="q"><small class="mono">'+q.who+' · '+q.kind+'</small><div>'+q.title+'</div></div>').join("");
  document.getElementById("inv").innerHTML = D.spots.map(s=>'<div class="q"><small class="mono">'+s.dur+'</small><div>'+s.title+'</div></div>').join("");
  log("<b>MAZCLIN</b> supervisor online.");
  log("<b>DIEGO</b> reglas cargadas.");
  document.getElementById("vol").addEventListener("input", (ev) => { document.getElementById("stream").volume = Number(ev.target.value); });
  const cam = document.getElementById("studioCam"); if (cam) cam.play().catch(()=>{});
})();
