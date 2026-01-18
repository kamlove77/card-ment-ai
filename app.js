/**
 * 최신 Apps Script URL 반영 및 조회 기능 강화 버전
 */
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbyNfRKQLL2yMiiXT8aP2e03QfeVfOKFt4QsLw0467NxMnrqegKbufooiowT0W0aIjCgKA/exec";
let mentData = []; // 상담 멘트 및 가이드 데이터를 저장할 변수

// 1. 초기 데이터 로드 (페이지 접속 시 실행)
async function loadInitialData() {
    try {
        const response = await fetch(`${SHEET_API_URL}?mode=ment`);
        mentData = await response.json();
        
        // 유형 선택 드롭다운 메뉴 채우기
        const typeSelect = document.getElementById("type");
        const types = [...new Set(mentData.map(item => item.type))];
        
        typeSelect.innerHTML = "<option value=''>유형을 선택하세요</option>";
        types.forEach(type => {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });
        console.log("상담 가이드 데이터 로드 완료");
    } catch (error) {
        console.error("데이터를 불러오는데 실패했습니다:", error);
    }
}

// 2. 업무 가이드 조회 기능 (화면번호 검색)
document.getElementById("btn-search").onclick = () => {
    const searchInput = document.getElementById("quick-search").value.trim();
    if (!searchInput) {
        alert("조회할 화면번호를 입력해주세요.");
        return;
    }

    // 시트의 데이터와 입력값을 모두 문자로 변환하여 공백 없이 비교 (8974 등 숫자 인식 해결)
    const found = mentData.find(item => String(item.screenNum).trim() === String(searchInput));

    if (found) {
        document.getElementById("view-screen").textContent = found.screenNum;
        document.getElementById("view-keywords").textContent = found.keywords;
        document.getElementById("view-desc").textContent = found.description;
    } else {
        alert(`'${searchInput}' 번호에 대한 정보를 찾을 수 없습니다.\n시트의 'card-ment-db' 탭에 해당 번호가 있는지 확인해주세요.`);
    }
};

// 3. 실적 히스토리 로드 기능 (엑셀 연동)
async function loadPerformance() {
    const listBody = document.getElementById("perf-list");
    listBody.innerHTML = "<tr><td colspan='4'>시트에서 실적 데이터를 가져오는 중...</td></tr>";

    try {
        const response = await fetch(`${SHEET_API_URL}?mode=perf`);
        const data = await response.json();

        listBody.innerHTML = ""; // 로딩 문구 제거

        if (data.length === 0) {
            listBody.innerHTML = "<tr><td colspan='4'>기록된 실적 데이터가 없습니다.</td></tr>";
            return;
        }

        data.forEach(row => {
            const tr = document.createElement("tr");
            
            // 달성률에 따른 색상 구분 (100% 이상 녹색, 미만 빨간색)
            const rateValue = parseFloat(row.rate);
            const rateColor = rateValue >= 100 ? "#28a745" : "#d9534f";

            tr.innerHTML = `
                <td>${row.date}</td>
                <td>${row.current}콜</td>
                <td style="font-weight:bold; color:${rateColor}">${row.rate}</td>
                <td>${row.memo || "-"}</td>
            `;
            listBody.appendChild(tr);
        });
    } catch (error) {
        listBody.innerHTML = "<tr><td colspan='4'>데이터 로드 실패. Apps Script의 배포 설정을 확인하세요.</td></tr>";
    }
}

// 페이지 로드 시 실행
window.onload = loadInitialData;
