// 1. 구글 시트 API URL (사용자님 최신 버전)
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzF6PiiQG6jmkT6JQDiMlTRMOjbwSLomnhZu8xHvBjYQTf31SPxaBLZLU6K1hqBIlTadQ/exec";
let mentData = [];

// 2. 초기화 함수
async function init() {
    try {
        console.log("데이터 로딩 시작...");
        // 가이드/멘트 데이터 로드
        const mentRes = await fetch(`${SHEET_API_URL}?mode=ment`);
        mentData = await mentRes.json();
        
        updateTypeDropdown(); // 드롭다운 채우기
        await loadPerformance(); // 실적 로드 및 합계 계산
        console.log("데이터 로딩 완료");
    } catch (e) {
        console.error("데이터 로드 중 오류 발생:", e);
    }
}

// 3. 실적 로드 및 이달의 누적 합계 계산
async function loadPerformance() {
    const listBody = document.getElementById("perf-list");
    const totalEl = document.getElementById("total-calls");
    if (!listBody) return;

    try {
        const res = await fetch(`${SHEET_API_URL}?mode=perf`);
        const data = await res.json();
        listBody.innerHTML = ""; 

        const now = new Date();
        const currentMonth = now.getMonth(); // 0(1월) ~ 11(12월)
        const currentYear = now.getFullYear();
        let monthTotal = 0; 

        data.forEach(row => {
            const tr = document.createElement("tr");
            
            // 숫자 추출 (예: "120콜" -> 120)
            let rowCall = parseInt(String(row.current).replace(/[^0-9]/g, "")) || 0;
            
            // 날짜 처리 및 이번 달 합산 확인
            let displayDate = "-";
            if (row.date) {
                const dateObj = new Date(row.date);
                if (!isNaN(dateObj.getTime())) {
                    // 이번 달 데이터인 경우에만 누적 합산
                    if (dateObj.getFullYear() === currentYear && dateObj.getMonth() === currentMonth) {
                        monthTotal += rowCall;
                    }
                    // 날짜 형식 변환 (MM/DD)
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    displayDate = `${month}/${day}`;
                }
            }

            tr.innerHTML = `
                <td>${displayDate}</td>
                <td>${row.current}콜</td>
                <td style="font-weight:bold; color:#007bff;">${row.rate}</td>
            `;
            listBody.appendChild(tr);
        });

        // 상단 합계 칸에 결과 넣기
        if (totalEl) {
            totalEl.textContent = monthTotal.toLocaleString();
        }

    } catch (e) {
        listBody.innerHTML = "<tr><td colspan='3'>실적 로드 실패</td></tr>";
    }
}

// 4. 드롭다운 업데이트
function updateTypeDropdown() {
    const typeSelect = document.getElementById("type");
    if (!typeSelect) return;

    const types = [...new Set(mentData.map(item => String(item.type || "").trim()).filter(t => t !== ""))];
    typeSelect.innerHTML = "<option value=''>유형을 선택하세요</option>";
    types.forEach(type => {
        const opt = document.createElement("option");
        opt.value = type;
        opt.textContent = type;
        typeSelect.appendChild(opt);
    });
}

// 5. 가이드 검색 (번호/키워드)
document.getElementById("btn-search").onclick = () => {
    const input = document.getElementById("quick-search").value.trim().toLowerCase();
    if (!input) return alert("검색어를 입력하세요.");

    const found = mentData.find(item => 
        String(item.screenNum || "").toLowerCase() === input || 
        String(item.keywords || "").toLowerCase().includes(input)
    );

    if (found) {
        document.getElementById("view-screen").textContent = found.screenNum || "-";
        document.getElementById("view-keywords").textContent = found.keywords || "-";
        document.getElementById("view-desc").textContent = found.description || "내용 없음";
    } else {
        alert("일치하는 정보를 찾을 수 없습니다.");
    }
};

// 6. 멘트 만들기 버튼
// ... (상단 초기화 로직은 동일)

// 6. 멘트 만들기 버튼 (중복 멘트 모두 표시 버전)
document.getElementById("btn-generate").onclick = () => {
    const selectedType = document.getElementById("type").value;
    const output = document.getElementById("ment-output");
    if (!selectedType) return alert("유형을 선택하세요.");

    // find 대신 filter를 사용하여 해당 유형의 모든 데이터를 가져옵니다.
    const results = mentData.filter(item => String(item.type || "").trim() === selectedType);
    
    if (results.length > 0) {
        // 모든 멘트를 구분선(-----------)으로 나누어 하나의 박스에 표시
        output.value = results.map((item, index) => `[멘트 ${index + 1}]\n${item.text || ""}`).join("\n\n----------------------\n\n");
    } else {
        output.value = "등록된 멘트가 없습니다.";
    }
};

window.onload = init;

