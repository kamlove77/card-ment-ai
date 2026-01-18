const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbyNfRKQLL2yMiiXT8aP2e03QfeVfOKFt4QsLw0467NxMnrqegKbufooiowT0W0aIjCgKA/exec";
let mentData = []; 

// 1. 초기 데이터 로드 (실적과 동일한 URL 사용)
async function loadInitialData() {
    try {
        const response = await fetch(`${SHEET_API_URL}?mode=ment`);
        mentData = await response.json();
        console.log("데이터 로드 성공:", mentData); // 데이터가 잘 오는지 개발자 도구(F12)에서 확인 가능
        
        // 드롭다운 설정
        const typeSelect = document.getElementById("type");
        const types = [...new Set(mentData.map(item => item.type))];
        typeSelect.innerHTML = "<option value=''>유형을 선택하세요</option>";
        types.forEach(type => {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });
    } catch (error) {
        console.error("데이터 로드 에러:", error);
    }
}

// 2. 업무 가이드 조회 기능 (오류 수정 포인트)
document.getElementById("btn-search").onclick = () => {
    // 입력창의 ID가 'quick-search'인지 확인하세요
    const searchInput = document.getElementById("quick-search").value.trim(); 
    
    if (!searchInput) {
        alert("화면번호를 입력해주세요.");
        return;
    }

    // [핵심] 숫자/문자 차이와 앞뒤 공백을 완전히 무시하고 검색합니다.
    const found = mentData.find(item => {
        const sheetValue = String(item.screenNum).trim();
        return sheetValue === String(searchInput);
    });

    if (found) {
        // 결과창 ID들이 index.html과 일치하는지 확인
        document.getElementById("view-screen").textContent = found.screenNum || "-";
        document.getElementById("view-keywords").textContent = found.keywords || "-";
        document.getElementById("view-desc").textContent = found.description || "-";
    } else {
        alert(`'${searchInput}' 번호는 가이드 목록에 없습니다.`);
    }
};

// 실적 로드 함수 (이미 잘 된다고 하신 기능)
async function loadPerformance() {
    const listBody = document.getElementById("perf-list");
    listBody.innerHTML = "<tr><td colspan='4'>로딩 중...</td></tr>";
    try {
        const response = await fetch(`${SHEET_API_URL}?mode=perf`);
        const data = await response.json();
        listBody.innerHTML = "";
        data.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${row.date}</td>
                <td>${row.current}콜</td>
                <td style="font-weight:bold;">${row.rate}</td>
                <td>${row.memo || "-"}</td>
            `;
            listBody.appendChild(tr);
        });
    } catch (e) {
        listBody.innerHTML = "<tr><td colspan='4'>데이터 로드 실패</td></tr>";
    }
}

window.onload = loadInitialData;
