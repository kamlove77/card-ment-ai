const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbwuL7frRVVvewOcSxdPejC5xG1fGFwueoqdr7_k6VdSKlkHwB3YZZCFBSlUwp2psd3-cg/exec";
let mentData = [];

// 페이지 로드 시 실적과 가이드 데이터를 모두 가져옴
async function init() {
    try {
        // 1. 가이드 데이터 로드
        const mentRes = await fetch(`${SHEET_API_URL}?mode=ment`);
        mentData = await mentRes.json();
        updateTypeDropdown();

        // 2. 실적 데이터 로드
        await loadPerformance();
        
        console.log("전체 데이터 로드 성공");
    } catch (e) {
        console.error("데이터 로드 중 오류:", e);
    }
}

// 유형 드롭다운 메뉴 채우기
function updateTypeDropdown() {
    const typeSelect = document.getElementById("type");
    if (!typeSelect) return;

    const types = [...new Set(mentData.map(item => item.type).filter(t => t !== ""))];
    typeSelect.innerHTML = "<option value=''>유형을 선택하세요</option>";
    types.forEach(type => {
        const opt = document.createElement("option");
        opt.value = type;
        opt.textContent = type;
        typeSelect.appendChild(opt);
    });
}

// 업무 가이드 조회 (번호 또는 키워드 검색)
document.getElementById("btn-search").onclick = () => {
    const input = document.getElementById("quick-search").value.trim().toLowerCase();
    if (!input) return alert("검색어를 입력하세요.");

    const found = mentData.find(item => 
        String(item.screenNum).toLowerCase() === input || 
        String(item.keywords).toLowerCase().includes(input)
    );

    if (found) {
        document.getElementById("view-screen").textContent = found.screenNum || "-";
        document.getElementById("view-keywords").textContent = found.keywords || "-";
        document.getElementById("view-desc").textContent = found.description || "상세내용 없음";
    } else {
        alert("일치하는 정보를 찾을 수 없습니다.");
    }
};

// 실적 히스토리 로드
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
                <td style="font-weight:bold; color:#2c3e50;">${row.rate}</td>
                <td>${row.memo}</td>
            `;
            listBody.appendChild(tr);
        });
    } catch (e) {
        listBody.innerHTML = "<tr><td colspan='4'>실적 데이터를 불러올 수 없습니다.</td></tr>";
    }
}

// 멘트 생성 기능 (드롭다운 선택 시)
document.getElementById("btn-generate").onclick = () => {
    const selectedType = document.getElementById("type").value;
    const found = mentData.find(item => item.type === selectedType);

    if (found && found.text) {
        document.getElementById("ment-output").value = found.text;
    } else {
        alert("해당 유형의 멘트 데이터가 시트에 없습니다.");
    }
};

window.onload = init;
