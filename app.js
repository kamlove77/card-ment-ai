const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzdqUoV2pjnG2aYWP4NASY-isAjbTDibX5GeMS5gmOfcp-06ua8Z1A2vkcAJVh8STpo6w/exec";

const $ = (id) => document.getElementById(id);

// 전역 변수로 템플릿 저장
let cachedTemplates = null;

async function loadTemplatesFromSheet() {
  if (cachedTemplates) return cachedTemplates; // 캐시가 있으면 재사용
  
  try {
    const res = await fetch(SHEET_API_URL);
    const data = await res.json();

    const map = {};
    data.forEach((r) => {
      if (!map[r.type]) map[r.type] = [];
      map[r.type].push(r.text);
    });
    cachedTemplates = map;
    return map;
  } catch (e) {
    console.error("데이터 로딩 실패:", e);
    alert("시트 데이터를 가져오지 못했습니다.");
    return {};
  }
}

// 페이지 로드 시 실행: Select 박스에 유형 채우기
window.onload = async () => {
  const templates = await loadTemplatesFromSheet();
  const typeSelect = $("type");
  typeSelect.innerHTML = ""; // 로딩 메시지 제거

  Object.keys(templates).forEach(typeName => {
    const opt = document.createElement("option");
    opt.value = typeName;
    opt.textContent = typeName;
    typeSelect.appendChild(opt);
  });
};

// ... (기본 제공해주신 polishTone, withDetail, render 함수는 그대로 유지) ...

$("gen").onclick = async () => {
  const type = $("type").value;
  const tone = $("tone").value;
  const detail = $("detail").value;
  
  if (!type) return alert("유형을 선택해주세요.");
  
  const list = await makeMentions(type, tone, detail);
  render(list);
};

$("clear").onclick = () => {
  $("detail").value = "";
  $("out").innerHTML = "";
};
