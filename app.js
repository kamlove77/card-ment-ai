const API_URL = "https://script.google.com/macros/s/AKfycbzdqUoV2pjnG2aYWP4NASY-isAjbTDibX5GeMS5gmOfcp-06ua8Z1A2vkcAJVh8STpo6w/exec";

async function loadData() {
  const res = await fetch(API_URL);
  return await res.json(); // [[type, text], ...]
}

async function init() {
  const data = await loadData();
  const types = [...new Set(data.map(r => r[0]))];
  const sel = document.getElementById("type");
  sel.innerHTML = "";
  types.forEach(t => {
    const o = document.createElement("option");
    o.value = t;
    o.textContent = t;
    sel.appendChild(o);
  });
}

function makeMent(list) {
  const out = document.getElementById("out");
  out.innerHTML = "";
  list.slice(0,5).forEach(t=>{
    const d = document.createElement("div");
    d.className="card";
    d.textContent=t;
    out.appendChild(d);
  });
}

document.getElementById("gen").onclick = async ()=>{
  const data = await loadData();
  const type = document.getElementById("type").value;
  const list = data.filter(r=>r[0]===type).map(r=>r[1]);
  makeMent(list);
};

init();





