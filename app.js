const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzF6PiiQG6jmkT6JQDiMlTRMOjbwSLomnhZu8xHvBjYQTf31SPxaBLZLU6K1hqBIlTadQ/exec";
let mentData = [];

async function init() {
    try {
        const mentRes = await fetch(`${SHEET_API_URL}?mode=ment`);
        mentData = await mentRes.json();
        updateTypeDropdown();
        await loadPerformance();
    } catch (e) {
        console.error("데이터 로드 실패:", e);
    }
}

// 실적 데이터 로드 및 날짜 형식 가공 (MM/DD)
async function loadPerformance() {
    const listBody = document.getElementById("perf-list");
    if (!listBody) return;

    try {
        const res = await fetch(`${SHEET_API_URL}?mode=perf`);
        const data = await res.json();
        listBody.innerHTML = ""; 

        data.forEach(row => {
            const tr = document.createElement("tr");
            
            // [날짜 처리 로직 최종 강화]
            let displayDate = "-";
            if (row.date) {
                try {
                    const dateObj = new Date(row.date);
                    // 날짜가 유효한지 확인 후 월/일 추출
                    if (!isNaN(dateObj.getTime())) {
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        displayDate = `${month}/${day}`;
                    } else {
                        // 날짜 객체 생성 실패 시 문자열에서 직접 추출 (Sun Jan 18... 대응)
                        const parts = String(row.date).split(" ");
                        if (parts.length >= 3) {
                            const monthMap = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
                            displayDate = `${monthMap[parts[1]] || "01"}/${parts[2].padStart(2, '0')}`;
                        }
                    }
                } catch (e) {
                    displayDate = String(row.date).substring(5, 10); // 최후의 수단
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
        console.error("실적 로드 실패:", e);
        listBody.innerHTML = "<tr><td colspan='4'>데이터 로드 실패</td></tr>";
    }
}

function updateTypeDropdown() {
    const typeSelect = document.getElementById("type");
    if (!typeSelect) return;
    const types = [...new Set(mentData.map(item => String(item.type || "").trim()).filter(t => t !== ""))];
    typeSelect.innerHTML = "<option value=''>유형을 선택하세요</option>";
    types.forEach(type => {
        const opt = document.createElement("option");
        opt.value = type; opt.textContent = type;
        typeSelect.appendChild(opt);
    });
}

document.getElementById("btn-search").onclick = () => {
    const input = document.getElementById("quick-search").value.trim().toLowerCase();
    const found = mentData.find(item => 
        String(item.screenNum || "").toLowerCase() === input || 
        String(item.keywords || "").toLowerCase().includes(input)
    );
    if (found) {
        document.getElementById("view-screen").textContent = found.screenNum || "-";
        document.getElementById("view-keywords").textContent = found.keywords || "-";
        document.getElementById("view-desc").textContent = found.description || "-";
    } else {
        alert("정보를 찾을 수 없습니다.");
    }
};

document.getElementById("btn-generate").onclick = () => {
    const selectedType = document.getElementById("type").value;
    const found = mentData.find(item => String(item.type).trim() === selectedType);
    if (found) document.getElementById("ment-output").value = found.text || "";
};

window.onload = init;


