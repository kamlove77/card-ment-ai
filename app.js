const SHEET_API_URL =
  "https://script.google.com/macros/s/AKfycbz0jAAwOj2VB2Kq_WxRAZvqdKmm65BRrsFu6M6NUF4GhRjsmFxrM_q3YIkKqs4uXs-m/exec";

const $ = (id) => document.getElementById(id);

async function loadTemplatesFromSheet() {
  const res = await fetch(SHEET_API_URL);
  const data = await res.json();

  const map = {};
  data.forEach((r) => {
    if (!map[r.type]) map[r.type] = [];
    map[r.type].push(r.text);
  });
  return map;
}

function polishTone(text, tone) {
  if (tone === "short") {
    const first = text.split("다.")[0];
    return first.endsWith("다") ? first + "." : first + "다.";
  }
  if (tone === "soft") {
    return "고객님 불편을 드려 죄송합니다. " + text;
  }
  return text;
}

function withDetail(text, detail) {
  if (!detail.trim()) return text;
  return `${text}\n(참고: 고객님 말씀하신 상황: ${detail})`;
}

async function makeMentions(type, tone, detail) {
  const templates = await loadTemplatesFromSheet();
  const base = templates[type] ?? [];
  const out = [];
  for (let i = 0; i < 5; i++) {
    const t = base[i % base.length] || "등록된 멘트가 없습니다.";
    out.push(withDetail(polishTone(t, tone), detail));
  }
  return out;
}

function render(list) {
  const out = $("out");
  out.innerHTML = "";
  list.forEach((m, idx) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="pill">추천 ${idx + 1}</div>
      <div class="ment" id="m-${idx}"></div>
      <div class="ment-actions">
        <button data-copy="${idx}">복사</button>
      </div>
    `;
    out.appendChild(card);
    card.querySelector(`#m-${idx}`).textContent = m;

    card.querySelector(`[data-copy="${idx}"]`).onclick = () =>
      navigator.clipboard.writeText(m);
  });
}

$("gen").onclick = async () => {
  const type = $("type").value;
  const tone = $("tone").value;
  const detail = $("detail").value;
  const list = await makeMentions(type, tone, detail);
  render(list);
};

$("clear").onclick = () => {
  $("detail").value = "";
  $("out").innerHTML = "";
};

