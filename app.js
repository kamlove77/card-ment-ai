const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbwuL7frRVVvewOcSxdPejC5xG1fGFwueoqdr7_k6VdSKlkHwB3YZZCFBSlUwp2psd3-cg/exec";
let mentData = [];

async function init() {
    try {
        // 1. 가이드 데이터 로드 (로딩 중 상태 해제 로직 포함)
        const mentRes = await fetch(`${SHEET_API_URL}?mode=ment`);
        const result = await mentRes.json();
        
        // 에러 처리 및 데이터 저장
        if (result.error) {
            console.error("시트 에러:", result.error);
            return;
        }
        
        mentData = result;
        updateTypeDropdown(); // 드롭다운 채우기
        
        // 2. 실적 히스토리 로드
        await loadPerformance();
        
        console.log("데이터 연동 완료:", mentData.length, "건");
    } catch (e) {
        console.error("연결 오류:", e);
    }
}

// 유형 드롭다운 (A열 데이터)
function updateTypeDropdown() {
    const typeSelect = document.getElementById("type");
    if (!typeSelect) return;

    // A열 데이터 추출 및 중복 제거
    const types = [...new Set(mentData.map(item => String(item.type || "").trim()).filter(t => t !== ""))];
    
    typeSelect.innerHTML = "<option value=''>유형을 선택하세요</option>";
    types.forEach(type => {
        const opt = document.createElement("option");
        opt.value = type;
        opt.textContent = type;
        typeSelect.appendChild(opt);
    });
}

// [핵심] 가이드 상세 조회 (상세내용 미출력 해결)
document.getElementById("btn-search").onclick = () => {
    const input = document.getElementById("quick-search").value.trim().toLowerCase();
    if (!input) return alert("번호나 검색어를 입력하세요.");

    // 숫자와 문자를 모두 문자로 변환하여 비교
    const found = mentData.find(item => 
        String(item.screenNum || "").trim().toLowerCase() === input || 
        String(item.keywords || "").trim().toLowerCase().includes(input)
    );

    if (found) {
        // HTML의 ID가 view-screen, view-keywords, view-desc인지 다시 확인하세요.
        document.getElementById("view-screen").textContent = found.screenNum || "-";
        document.getElementById("view-keywords").textContent = found.keywords || "-";
        document.getElementById("view-desc").textContent = found.description || "상세 설명이 없습니다.";
    } else {
        alert("일치하는 가이드가 없습니다.");
    }
};

// 실적 로드 (C열: 완료콜수, D열: 달성률 반영)
async function loadPerformance() {
    const listBody = document.getElementById("perf-list");
    if (!listBody) return;

    try {
        const res = await fetch(`${SHEET_API_URL}?mode=perf`);
        const data = await res.json();
        listBody.innerHTML = ""; 

        data.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${row.date}</td>
                <td>${row.current}콜</td>
                <td style="font-weight:bold; color:#007bff;">${row.rate}</td>
                <td>${row.memo || "-"}</td>
            `;
            listBody.appendChild(tr);
        });
    } catch (e) {
        listBody.innerHTML = "<tr><td colspan='4'>실적 로드 실패</td></tr>";
    }
}

// 멘트 생성
document.getElementById("btn-generate").onclick = () => {
    const selectedType = document.getElementById("type").value;
    const found = mentData.find(item => String(item.type).trim() === selectedType);
    const outputField = document.getElementById("ment-output");

    if (found && found.text) {
        outputField.value = found.text;
    } else {
        alert("선택한 유형의 멘트가 시트에 없습니다.");
    }
};

window.onload = init;
