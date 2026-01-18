// 1. 사용자님의 최신 URL 적용
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzF6PiiQG6jmkT6JQDiMlTRMOjbwSLomnhZu8xHvBjYQTf31SPxaBLZLU6K1hqBIlTadQ/exec";
let mentData = [];

// 2. 초기 로딩: 가이드와 실적을 모두 가져옵니다.
async function init() {
    try {
        console.log("데이터 로딩 중...");
        const mentRes = await fetch(`${SHEET_API_URL}?mode=ment`);
        mentData = await mentRes.json();
        
        updateTypeDropdown(); // 드롭다운 업데이트
        await loadPerformance(); // 실적 로드
        console.log("로딩 완료!");
    } catch (e) {
        console.error("데이터를 불러오지 못했습니다:", e);
    }
}

// 3. 실적 로드 (날짜를 MM/DD 형식으로 강제 변환)
async function loadPerformance() {
    const listBody = document.getElementById("perf-list");
    if (!listBody) return;

    try {
        const res = await fetch(`${SHEET_API_URL}?mode=perf`);
        const data = await res.json();
        listBody.innerHTML = ""; 

        data.forEach(row => {
            const tr = document.createElement("tr");
            let displayDate = "-";
            
            if (row.date) {
                const dateObj = new Date(row.date);
                if (!isNaN(dateObj.getTime())) {
                    // 표준 날짜 객체에서 월/일 추출
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    displayDate = `${month}/${day}`;
                } else {
                    // 문자열(Sun Jan 18...)에서 직접 추출
                    const parts = String(row.date).split(" ");
                    const monthMap = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
                    if (parts.length >= 3) {
                        displayDate = `${monthMap[parts[1]] || "01"}/${parts[2].padStart(2, '0')}`;
                    }
                }
            }

            tr.innerHTML = `
                <td>${displayDate}</td>
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

// 5. 가이드 검색 기능 (번호/키워드)
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
        alert("일치하는 가이드 정보가 없습니다.");
    }
};

// 6. 멘트 생성 버튼
document.getElementById("btn-generate").onclick = () => {
    const selectedType = document.getElementById("type").value;
    if (!selectedType) return alert("유형을 선택하세요.");

    const found = mentData.find(item => String(item.type || "").trim() === selectedType);
    if (found) {
        document.getElementById("ment-output").value = found.text || "";
    }
};

window.onload = init;
