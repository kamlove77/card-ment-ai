// 기존 주소를 지우고 이 새로운 주소로 바꿔주세요.
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbxxIRvwQmIBbmccxMJCCx6lZXM3mq6EVqwKgzUuenSPkLNbbht_N0Ke5a1wBIeD9PPEjA/exec";

const $ = (id) => document.getElementById(id);

// 시트에서 데이터 로드
async function loadData() {
  try {
    const res = await fetch(SHEET_API_URL);
    return await res.json();
  } catch (e) {
    console.error("데이터 로드 실패:", e);
    return [];
  }
}

// 초기 로딩: 유형 선택 박스 채우기
window.onload = async () => {
  const data = await loadData();
  const typeSelect = $("type");
  typeSelect.innerHTML = ""; 

  const types = [...new Set(data.map(item => item.type))];
  types.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    typeSelect.appendChild(opt);
  });
};

function polishTone(text, tone) {
  if (tone === "short") return text.split(".")[0] + ".";
  if (tone === "soft") return "고객님, 이용에 불편을 드려 죄송합니다. " + text;
  return text;
}

$("gen").onclick = async () => {
  const data = await loadData();
  const type = $("type").value;
  const tone = $("tone").value;
  const detail = $("detail").value;

  const filtered = data.filter(item => item.type === type);
  const out = $("out");
  out.innerHTML = "";

  filtered.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "card";
    const ment = polishTone(item.text, tone) + (detail ? `\n\n(참고: ${detail})` : "");
    card.innerHTML = `
      <div class="pill">추천 ${idx + 1}</div>
      <div style="white-space:pre-wrap;">${ment}</div>
      <button style="margin-top:10px; background:#28a745;" onclick="navigator.clipboard.writeText(\`${ment}\`)">복사하기</button>
    `;
    out.appendChild(card);
  });
};

$("clear").onclick = () => {
  $("detail").value = "";
  $("out").innerHTML = "";
};

