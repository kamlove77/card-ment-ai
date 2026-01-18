// [최신 주소 반영] 알려주신 최신 URL입니다.
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycby1jVagwV4x0YS12-Qd29udMREg7gTZ6xbQduykULuSklaGyKzIXjlX7jhwnP43Y5COCw/exec";

const $ = (id) => document.getElementById(id);

async function loadData() {
  try {
    const res = await fetch(SHEET_API_URL);
    return await res.json();
  } catch (e) {
    console.error("데이터 로드 실패:", e);
    return [];
  }
}

// 페이지 로드 시 유형 선택박스 초기화
window.onload = async () => {
  const data = await loadData();
  const typeSelect = $("type");
  typeSelect.innerHTML = "<option value=''>상황을 선택하세요</option>";
  
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
  const type = $("type").value;
  const tone = $("tone").value;
  const detail = $("detail").value;

  if (!type) return alert("상황 유형을 먼저 선택해주세요.");

  const data = await loadData();
  const filtered = data.filter(item => item.type === type);
  
  if (filtered.length > 0) {
    // [오른쪽 패널] 시트의 B, C, D열 정보를 표시
    const info = filtered[0];
    $("view-screen").textContent = info.screenNum || "-";
    $("view-keywords").textContent = info.keywords || "-";
    $("view-desc").textContent = info.description || "-";

    // [왼쪽 패널] 시트의 E열 멘트를 리스트로 생성
    const out = $("out");
    out.innerHTML = "";
    filtered.forEach((item, idx) => {
      const card = document.createElement("div");
      card.className = "card";
      const ment = polishTone(item.text, tone) + (detail ? `\n\n(참고: ${detail})` : "");
      card.innerHTML = `
        <div class="pill">추천 ${idx + 1}</div>
        <div style="white-space:pre-wrap; margin-bottom:10px; font-size:15px; line-height:1.6;">${ment}</div>
        <button class="copy-btn" onclick="navigator.clipboard.writeText(\`${ment}\`)">멘트 복사하기</button>
      `;
      out.appendChild(card);
    });
  }
};

$("clear").onclick = () => {
  $("detail").value = "";
  $("out").innerHTML = "";
  $("view-screen").textContent = "-";
  $("view-keywords").textContent = "-";
  $("view-desc").textContent = "-";
};
