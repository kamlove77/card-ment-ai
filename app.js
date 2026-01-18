const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzF6PiiQG6jmkT6JQDiMlTRMOjbwSLomnhZu8xHvBjYQTf31SPxaBLZLU6K1hqBIlTadQ/exec";
let mentData = [];

// 1. 초기 로드: 데이터 가져오기 및 화면 업데이트
async function init() {
    try {
        console.log("데이터 로드 시작...");
        const mentRes = await fetch(`${SHEET_API_URL}?mode=ment`);
        mentData = await mentRes.json();
        
        updateTypeDropdown(); // 드롭다운 채우기
        await loadPerformance(); // 실적 로드
        console.log("전체 로드 완료");
    } catch (e) {
        console.error("초기화 오류:", e);
    }
}

// 2. 실적 히스토리 로드 (날짜 버그 수정본)
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
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    displayDate = `${month}/${day}`;
                } else {
                    // Sun Jan 18... 형태 대응
                    const parts = String(row.date).split(" ");
                    const monthMap = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
                    if (parts.length >= 3) displayDate = `${monthMap[parts[1]] || "01"}/${parts[2].padStart(2, '0')}`;
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

// 3. 상황 유형 드롭다운 생성
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

// 4. 가이드 정보 검색 (번호/키워드)
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
        alert("일치하는 가이드 정보를 찾을 수 없습니다.");
    }
};

// 5. 멘트 만들기 버튼
document.getElementById("btn-generate").onclick = () => {
    const selectedType = document.getElementById("type").value;
    if (!selectedType) return alert("유형을 선택하세요.");

    const found = mentData.find(item => String(item.type || "").trim() === selectedType);
    if (found) {
        document.getElementById("ment-output").value = found.text || "멘트가 없습니다.";
    }
};

window.onload = init;
