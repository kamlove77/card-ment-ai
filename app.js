const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbwwi8eF2YF3QqEbetByYS-eH545vS7PEiiEG27c_KNzG6QGyrEDTz56RBfsGnV0z3Uv7A/exec";
let mentData = [];

// 가이드 및 실적 데이터 통합 로드
async function loadAllData() {
    try {
        // 1. 가이드 데이터 로드
        const mentRes = await fetch(`${SHEET_API_URL}?mode=ment`);
        mentData = await mentRes.json();
        
        // 2. 실적 데이터 로드 및 화면 갱신
        await loadPerformance();
        
        console.log("모든 데이터 로드 완료");
    } catch (e) {
        console.error("데이터 로드 실패:", e);
    }
}

// 실적 데이터 화면에 그리기
async function loadPerformance() {
    const listBody = document.getElementById("perf-list");
    if (!listBody) return;

    try {
        const res = await fetch(`${SHEET_API_URL}?mode=perf`);
        const data = await res.json();
        
        listBody.innerHTML = ""; // "로딩 중" 글자 지우기

        data.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${row.date}</td>
                <td>${row.current}콜</td>
                <td style="font-weight:bold;">${row.rate}</td>
                <td>${row.memo}</td>
            `;
            listBody.appendChild(tr);
        });
    } catch (e) {
        listBody.innerHTML = "<tr><td colspan='4'>데이터 로드 실패</td></tr>";
    }
}

// 가이드 조회 버튼 (번호/문자 모두 가능)
document.getElementById("btn-search").onclick = () => {
    const searchInput = document.getElementById("quick-search").value.trim().toLowerCase();
    const found = mentData.find(item => 
        String(item.screenNum) === searchInput || 
        String(item.keywords).toLowerCase().includes(searchInput)
    );

    if (found) {
        document.getElementById("view-screen").textContent = found.screenNum;
        document.getElementById("view-keywords").textContent = found.keywords;
        document.getElementById("view-desc").textContent = found.description;
    } else {
        alert("정보를 찾을 수 없습니다.");
    }
};

window.onload = loadAllData;
