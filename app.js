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
            
            // 날짜 가공 로직: "2026-01-18..." 또는 "Sun Jan 18..." 형태를 "01/18"로 변경
            let rawDate = row.date;
            let displayDate = "";

            if (rawDate.includes("T")) { // ISO 형식 (2026-01-18T...)
                const parts = rawDate.split("T")[0].split("-");
                displayDate = `${parts[1]}/${parts[2]}`;
            } else if (rawDate.includes(" ")) { // 문자열 형식 (Sun Jan 18...)
                const monthMap = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
                const parts = rawDate.split(" ");
                const month = monthMap[parts[1]] || "01";
                const day = parts[2].padStart(2, '0');
                displayDate = `${month}/${day}`;
            } else {
                displayDate = rawDate;
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
