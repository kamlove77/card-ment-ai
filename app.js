const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbyWdSeyTjHZeDXjSvk0YheBzsCEZ2vrJHCFj24aYilF-6yZV0E0zwOP3zWc9vgtYQAfqQ/exec";
let mentData = []; 

// 초기 데이터(상담 멘트 및 가이드) 로드
async function loadInitialData() {
    try {
        const res = await fetch(`${SHEET_API_URL}?mode=ment`);
        const data = await res.json();
        mentData = data;
        
        // 드롭다운 메뉴 채우기
        const typeSelect = document.getElementById("type");
        const types = [...new Set(data.map(item => item.type))];
        typeSelect.innerHTML = "<option value=''>유형을 선택하세요</option>";
        types.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t; opt.textContent = t;
            typeSelect.appendChild(opt);
        });
        console.log("상담 데이터 로드 완료");
    } catch (e) {
        console.error("상담 데이터 로드 실패:", e);
    }
}

// 실적 히스토리 로드 (엑셀 연동)
async function loadPerformance() {
    const listBody = document.getElementById("perf-list");
    listBody.innerHTML = "<tr><td colspan='4'>엑셀 자료를 가져오는 중...</td></tr>";

    try {
        const res = await fetch(`${SHEET_API_URL}?mode=perf`);
        const data = await res.json();

        listBody.innerHTML = "";
        if (!data || data.length === 0) {
            listBody.innerHTML = "<tr><td colspan='4'>기록된 실적 데이터가 없습니다.</td></tr>";
            return;
        }

        data.forEach(row => {
            const tr = document.createElement("tr");
            // 달성률 숫자에 따라 색상 변경 (100% 이상 녹색, 미만 빨간색)
            const rateValue = parseFloat(row.rate);
            const color = rateValue >= 100 ? "#28a745" : "#d9534f";

            tr.innerHTML = `
                <td>${row.date}</td>
                <td>${row.current}콜</td>
                <td style="font-weight:bold; color:${color}">${row.rate}</td>
                <td>${row.memo || "-"}</td>
            `;
            listBody.appendChild(tr);
        });
    } catch (e) {
        listBody.innerHTML = "<tr><td colspan='4'>데이터 로드 실패. 시트와 배포 설정을 확인하세요.</td></tr>";
    }
}

// 업무 가이드 조회 (검색) 버튼
document.getElementById("btn-search").onclick = () => {
    const keyword = document.getElementById("quick-search").value.trim();
    if (!keyword) return alert("조회할 화면번호를 입력하세요.");

    // 숫자와 문자 구분 없이 비교
    const found = mentData.find(item => String(item.screenNum).trim() === keyword);

    if (found) {
        document.getElementById("view-screen").textContent = found.screenNum;
        document.getElementById("view-keywords").textContent = found.keywords;
        document.getElementById("view-desc").textContent = found.description;
    } else {
        alert("해당 번호의 정보를 찾을 수 없습니다.");
    }
};

window.onload = loadInitialData;
