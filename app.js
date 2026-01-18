const SHEET_API_URL =
  "https://script.google.com/macros/s/AKfycbzdqUoV2pjnG2aYWP4NASY-isAjbTDibX5GeMS5gmOfcp-06ua8Z1A2vkcAJVh8STpo6w/exec";

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

// 1. 페이지 로드 시 시트에서 유형(Type)을 가져와 Select 박스 채우기
window.onload = async () => {
  const templates = await loadTemplatesFromSheet();
  const typeSelect = $("type");
  
  // 시트에서 가져온 유니크한 'type' 키값들로 옵션 생성
  Object.keys(templates).forEach(typeName => {
    const opt = document.createElement("option");
    opt.value = typeName;
    opt.textContent = typeName;
    typeSelect.appendChild(opt);
  });
};

// 2. 누락된 'tone' 요소 에러 방지 (HTML에 tone이 없을 경우 대비)
$("gen").onclick = async () => {
  const type = $("type").value;
  // HTML에 id="tone" 인 select 박스가 없다면 기본값 "default" 사용
  const tone = $("tone") ? $("tone").value : "default"; 
  const detail = $("detail").value;
  
  if(!type) {
    alert("상황 유형을 선택해주세요.");
    return;
  }
  
  const list = await makeMentions(type, tone, detail);
  render(list);
};
