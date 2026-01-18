const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbyoPZY9kc88IQE5We11u8ysQA4TBhfPgWcPrdY_r2KoIALOCfmrAHWTc-YGubq8oM_E/exec";
let mentData = [];

async function loadInitialData() {
    try {
        console.log("데이터 요청 시작...");
        const res = await fetch(`${SHEET_API_URL}?mode=ment`);
        const data = await res.json();
        
        if (data.error) {
            console.error("시트 에러 발생:", data.error);
            alert("시트 설정 오류: " + data.error);
            return;
        }

        mentData = data;
        console.log("데이터 로드 성공:", mentData.length, "건");
        
        // 유형 드롭다운 생성 (데이터가 있을 때만 실행)
        const typeSelect = document.getElementById("type");
        if (typeSelect && mentData.length > 0) {
            const types = [...new Set(mentData.map(item => item.type))];
            typeSelect.innerHTML = "<option value=''>유형을 선택하세요</option>";
            types.forEach(t => {
                const opt = document.createElement("option");
                opt.value = t; opt.textContent = t;
                typeSelect.appendChild(opt);
            });
        }
    } catch (e) {
        console.error("네트워크 또는 JSON 파싱 에러:", e);
        alert("데이터를 가져오지 못했습니다. URL 배포 상태를 확인하세요.");
    }
}

// 가이드 조회 로직 (상세설명 출력 보장)
document.getElementById("btn-search").onclick = () => {
    const searchInput = document.getElementById("quick-search").value.trim().toLowerCase();
    if (!searchInput) return;

    const found = mentData.find(item => 
        String(item.screenNum).trim() === searchInput || 
        String(item.keywords).trim().toLowerCase().includes(searchInput)
    );

    if (found) {
        document.getElementById("view-screen").textContent = found.screenNum || "-";
        document.getElementById("view-keywords").textContent = found.keywords || "-";
        document.getElementById("view-desc").textContent = found.description || "-";
    } else {
        alert("정보를 찾을 수 없습니다.");
    }
};

window.onload = loadInitialData;
