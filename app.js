const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbyNfRKQLL2yMiiXT8aP2e03QfeVfOKFt4QsLw0467NxMnrqegKbufooiowT0W0aIjCgKA/exec";
let mentData = []; 

// 1. 초기 데이터 로드 (페이지 접속 시 멘트/가이드 데이터 미리 가져오기)
async function loadInitialData() {
    try {
        const response = await fetch(`${SHEET_API_URL}?mode=ment`);
        mentData = await response.json();
        console.log("가이드 데이터 로드 완료");

        // 드롭다운 메뉴 채우기
        const typeSelect = document.getElementById("type");
        const types = [...new Set(mentData.map(item => item.type))];
        typeSelect.innerHTML = "<option value=''>유형을 선택하세요</option>";
        types.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t; opt.textContent = t;
            typeSelect.appendChild(opt);
        });
    } catch (e) {
        console.error("데이터 로드 실패:", e);
    }
}

// 2. 업무 가이드 조회 (강력한 검색 로직)
document.getElementById("btn-search").onclick = () => {
    // 입력창(quick-search)에서 값을 가져옵니다.
    const searchInput = document.getElementById("quick-search").value.trim();
    
    // 만약 입력값이 없거나 '문자' 같은 기본값이면 경고
    if (!searchInput || searchInput === "문자") {
        alert("화면번호(예: 8974)를 정확히 입력해주세요.");
        return;
    }

    // 시트의 데이터(screenNum)와 입력값을 모두 문자로 바꿔서 공백 없이 비교
    const found = mentData.find(item => String(item.screenNum).trim() === String(searchInput));

    if (found) {
        document.getElementById("view-screen").textContent = found.screenNum;
        document.getElementById("view-keywords").textContent = found.keywords;
        document.getElementById("view-desc").textContent = found.description;
    } else {
        alert(`'${searchInput}' 번호에 대한 가이드를 찾을 수 없습니다.\n시트의 'card-ment-db' 탭 B열을 확인해주세요.`);
    }
};

// 3. 실적 로드 함수 (이미 잘 작동하는 기능)
async function loadPerformance() {
    const listBody = document.getElementById("perf-list");
    listBody.innerHTML = "<tr><td colspan='4'>로딩 중...</td></tr>";
    try {
        const response = await fetch(`${SHEET_API_URL}?mode=perf`);
        const data = await response.json();
        listBody.innerHTML = "";
        data.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${row.date}</td><td>${row.current}콜</td><td>${row.rate}</td><td>${row.memo || "-"}</td>`;
            listBody.appendChild(tr);
        });
    } catch (e) {
        listBody.innerHTML = "<tr><td colspan='4'>데이터 로드 실패</td></tr>";
    }
}

window.onload = loadInitialData;
