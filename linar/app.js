const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const IRRAD = [195, 171, 164, 132, 108, 90, 104, 137, 161, 181, 193, 201];
const KITS = [
  { id: "k33", name: "Kit Casa 3.3", panels: 6, w: 550, area: 14, capex: 4200000, inv: "Growatt 3k", note: "Vivienda chica / PH" },
  { id: "k66", name: "Kit Comercio 6.6", panels: 12, w: 550, area: 27, capex: 7800000, inv: "Huawei 6k", note: "Local o taller chico" },
  { id: "k99", name: "Kit Taller 9.9", panels: 18, w: 550, area: 40, capex: 11200000, inv: "Growatt 10k", note: "Taller / galpón" },
  { id: "k132", name: "Kit Galpón 13.2", panels: 24, w: 550, area: 54, capex: 14800000, inv: "Huawei 12k", note: "Nave o techo largo" }
];
const state = JSON.parse(localStorage.getItem("linarLab") || "null") || {
  client: "Taller Por Winter", type: "Comercio", kwh: 900, tariff: 140, exportT: 45, roof: 48, loss: 14, kit: "k66"
};
function money(v) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(v || 0);
}
function kit() { return KITS.find((k) => k.id === state.kit) || KITS[1]; }
function calc() {
  const k = kit();
  const kwp = (k.panels * k.w) / 1000;
  const loss = 1 - (Number(state.loss) || 14) / 100;
  const monthly = IRRAD.map((h) => h * kwp * loss * 0.86);
  const annual = monthly.reduce((a, b) => a + b, 0);
  const cons = (Number(state.kwh) || 0) * 12;
  const selfUse = Math.min(annual, cons, annual * 0.72);
  const exp = Math.max(0, annual - selfUse);
  const grid = Math.max(0, cons - selfUse);
  const save = selfUse * (Number(state.tariff) || 0) + exp * (Number(state.exportT) || 0);
  const pay = save > 0 ? k.capex / save : 0;
  const roofOk = Number(state.roof) >= k.area;
  return { k, kwp, monthly, annual, cons, selfUse, exp, grid, save, pay, roofOk, spec: kwp ? annual / kwp : 0, cov: cons ? (selfUse / cons) * 100 : 0, selfPct: annual ? (selfUse / annual) * 100 : 0 };
}
function persist() { localStorage.setItem("linarLab", JSON.stringify(state)); }
function bom(c) {
  const k = c.k;
  return [
    [`${k.panels} módulos ${k.w} W`, Math.round(k.capex * 0.48)],
    [`Inversor ${k.inv}`, Math.round(k.capex * 0.15)],
    ["Estructura y anclaje", Math.round(k.capex * 0.12)],
    ["Cableado y conectores", Math.round(k.capex * 0.06)],
    ["Tablero y protecciones", Math.round(k.capex * 0.05)],
    ["Instalación estimada", Math.round(k.capex * 0.14)]
  ];
}
function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
function renderBoard(c) {
  setText("kitName", c.k.name);
  setText("kitLine", `${state.client} · ${state.type} · ${c.k.panels} módulos · ${c.k.inv}`);
  setText("kpiKwp", `${c.kwp.toFixed(2)} kWp`);
  setText("kpiKwh", `${Math.round(c.annual).toLocaleString("es-AR")} kWh`);
  setText("kpiPay", `${c.pay.toFixed(1)} años`);
  setText("mSelf", `${c.selfPct.toFixed(0)}%`);
  setText("mCov", `cubre ${c.cov.toFixed(0)}% del consumo`);
  setText("mSave", money(c.save));
  setText("mCapex", money(c.k.capex));
  setText("mPwp", `${money(c.k.capex / c.kwp)} / kWp`);
  setText("mExp", `${Math.round(c.exp).toLocaleString("es-AR")} kWh`);
  const max = Math.max(...c.monthly, 1);
  document.getElementById("bars").innerHTML = c.monthly.map((v, i) => `<div class="barrow"><span>${MONTHS[i]}</span><div class="bar"><i style="width:${(v / max) * 100}%"></i></div><b>${Math.round(v)}</b></div>`).join("");
  setText("bCons", `${Math.round(c.cons)} kWh`);
  setText("bGen", `${Math.round(c.annual)} kWh`);
  setText("bSelf", `${Math.round(c.selfUse)} kWh`);
  setText("bGrid", `${Math.round(c.grid)} kWh`);
  setText("bSpec", `${Math.round(c.spec)} kWh/kWp`);
}
function renderCalc(c) {
  const sel = document.querySelector("select[name=kit]");
  if (sel && !sel.dataset.ready) {
    sel.innerHTML = KITS.map((k) => `<option value="${k.id}">${k.name} · ${((k.panels * k.w) / 1000).toFixed(1)} kWp</option>`).join("");
    sel.dataset.ready = "1"; sel.value = state.kit;
  }
  document.getElementById("liveStack").innerHTML = [
    ["Potencia", `${c.kwp.toFixed(2)} kWp`],
    ["Techo necesario", `${c.k.area} m² ${c.roofOk ? "· entra" : "· corto"}`],
    ["Producción", `${Math.round(c.annual)} kWh/año`],
    ["Ahorro año 1", money(c.save)],
    ["Payback", `${c.pay.toFixed(1)} años`],
    ["Estado techo", c.roofOk ? "OK" : "Falta superficie"]
  ].map(([a, b]) => `<li><span>${a}</span><b>${b}</b></li>`).join("");
}
function renderKits() {
  document.getElementById("kitGrid").innerHTML = KITS.map((k) => {
    const kwp = (k.panels * k.w) / 1000;
    return `<button class="kit ${k.id === state.kit ? "on" : ""}" data-kit="${k.id}" type="button"><h3>${k.name}</h3><p class="muted">${k.note} · ${k.panels} × ${k.w} W · ${k.inv}</p><div class="price">${money(k.capex)}</div><p class="muted">${kwp.toFixed(1)} kWp · ${k.area} m² de techo</p></button>`;
  }).join("");
}
function renderQuote(c) {
  const rows = bom(c);
  setText("qHead", `${state.client} · ${c.k.name} · ${c.kwp.toFixed(2)} kWp`);
  document.getElementById("bom").innerHTML = "<tr><th>Ítem</th><th>ARS</th></tr>" + rows.map(([n, v]) => `<tr><td>${n}</td><td>${money(v)}</td></tr>`).join("") + `<tr><td>Total kit</td><td>${money(c.k.capex)}</td></tr>`;
  setText("qTotal", money(c.k.capex));
}
function render() {
  const c = calc();
  renderBoard(c); renderCalc(c); renderKits(); renderQuote(c);
}
function show(view) {
  document.querySelectorAll(".view").forEach((el) => el.classList.toggle("on", el.id === "view-" + view));
  document.querySelectorAll(".nav").forEach((el) => el.classList.toggle("on", el.dataset.view === view));
  const titles = {
    board: ["Tablero de obra", "Números en vivo según consumo, tarifa y kit."],
    calc: ["Calculadora", "Cambiá los datos. El tablero se actualiza solo."],
    kits: ["Kits Linar Lab", "Elegí un paquete de mostrador."],
    quote: ["Presupuesto", "Desglose para imprimir o mandar al cliente."]
  };
  setText("title", titles[view][0]); setText("sub", titles[view][1]);
}
document.querySelectorAll(".nav").forEach((btn) => btn.addEventListener("click", () => show(btn.dataset.view)));
document.getElementById("printBtn").addEventListener("click", () => window.print());
document.getElementById("saveBtn").addEventListener("click", () => { persist(); alert("Guardado en este navegador."); });
document.getElementById("kitGrid").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-kit]"); if (!btn) return;
  state.kit = btn.dataset.kit;
  const sel = document.querySelector("select[name=kit]"); if (sel) sel.value = state.kit;
  persist(); render();
});
document.getElementById("form").addEventListener("input", (e) => {
  const t = e.target; if (!t.name) return;
  state[t.name] = t.type === "number" ? Number(t.value) : t.value;
  persist(); render();
});
render();
