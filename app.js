const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbyoPZY9kc88IQE5We11u8ysQA4TBhfPgWcPrdY_r2KoIALOCfmrAHWTc-YGubq8oM_E/exec";
let mentData = [];

async function loadInitialData() {
    // 유형 드롭다운에 임시 메시지 표시
    const typeSelect = document.getElementById("type");
    if (typeSelect) typeSelect.innerHTML = "<option>로딩 중...</option>";

    try {
        console.log("시트 데이터 연결 시도...");
        const res = await fetch(`${SHEET_API_URL}?mode=ment`);
        const data = await res.json();
        
        mentData = data;
        console.log("로드된 데이터:", mentData);

        // 드롭다운 업데이트
        if (typeSelect && mentData.length > 0) {
            const types = [...new Set(mentData.map(item => item.type).filter(t => t))];
            typeSelect.innerHTML = "<option value=''>유형을 선택하세요</option>";
            types.forEach(t => {
                const opt = document.createElement("option");
                opt.value = t; opt.textContent = t;
                typeSelect.appendChild(opt);
            });
        } else if (typeSelect) {
            typeSelect.innerHTML = "<option>데이터 없음</option>";
        }
    } catch (e) {
        console.error("데이터 로드 에러:", e);
        if (typeSelect) typeSelect.innerHTML = "<option>로드 실패</option>";
    }
}

// 가이드 조회 버튼 로직 (중요: id 명칭 재확인)
document.getElementById("btn-search").onclick = () => {
    const searchInput = document.getElementById("quick-search").value.trim().toLowerCase();
    
    if (!searchInput) {
        alert("화면번호나 검색어를 입력하세요.");
        return;
    }

    const found = mentData.find(item => 
        String(item.screenNum || "").trim() === searchInput || 
        String(item.keywords || "").trim().toLowerCase().includes(searchInput)
    );

    if (found) {
        document.getElementById("view-screen").textContent = found.screenNum || "-";
        document.getElementById("view-keywords").textContent = found.keywords || "-";
        document.getElementById("view-desc").textContent = found.description || "-";
    } else {
        alert(`'${searchInput}' 정보를 찾을 수 없습니다.`);
    }
};

window.onload = loadInitialData;
