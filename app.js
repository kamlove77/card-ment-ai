const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbyoPZY9kc88IQE5We11u8ysQA4TBhfPgWcPrdY_r2KoIALOCfmrAHWTc-YGubq8oM_E/exec";

async function loadInitialData() {
    try {
        console.log("데이터 호출 시도 중...");
        const res = await fetch(`${SHEET_API_URL}?mode=ment`);
        const data = await res.json();
        
        if (data.error) {
            alert("시트 에러 발생: " + data.error);
            return;
        }

        window.mentData = data; // 전역 변수 저장
        updateDropdown(data);
        console.log("가이드 데이터 로드 완료");
    } catch (e) {
        console.error("가이드 로드 실패:", e);
        alert("가이드 데이터를 가져오지 못했습니다. 시트 탭 이름(card-ment-db)을 확인하세요.");
    }
}

async function loadPerformance() {
    const listBody = document.getElementById("perf-list");
    listBody.innerHTML = "<tr><td colspan='4'>데이터 로딩 중...</td></tr>";

    try {
        const res = await fetch(`${SHEET_API_URL}?mode=perf`);
        const data = await res.json();
        
        listBody.innerHTML = "";
        data.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${row.date}</td><td>${row.current}콜</td><td>${row.rate}</td><td>${row.memo}</td>`;
            listBody.appendChild(tr);
        });
    } catch (e) {
        listBody.innerHTML = "<tr><td colspan='4'>실적 로드 실패 (탭 이름 performance-db 확인)</td></tr>";
    }
}

function updateDropdown(data) {
    const typeSelect = document.getElementById("type");
    if (!typeSelect) return;
    const types = [...new Set(data.map(item => item.type).filter(t => t))];
    typeSelect.innerHTML = "<option value=''>유형을 선택하세요</option>";
    types.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t; opt.textContent = t;
        typeSelect.appendChild(opt);
    });
}

window.onload = () => {
    loadInitialData();
    // 실적 버튼 클릭 시 로드되도록 설정되어 있다면 해당 이벤트 확인
};
