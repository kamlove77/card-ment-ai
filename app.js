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
            
            // [날짜 처리 로직 강화]
            let rawDate = String(row.date);
            let displayDate = rawDate;

            if (rawDate.includes("Jan")) displayDate = "01/" + rawDate.split(" ")[2];
            else if (rawDate.includes("Feb")) displayDate = "02/" + rawDate.split(" ")[2];
            else if (rawDate.includes("Mar")) displayDate = "03/" + rawDate.split(" ")[2];
            else if (rawDate.includes("Apr")) displayDate = "04/" + rawDate.split(" ")[2];
            else if (rawDate.includes("May")) displayDate = "05/" + rawDate.split(" ")[2];
            else if (rawDate.includes("Jun")) displayDate = "06/" + rawDate.split(" ")[2];
            else if (rawDate.includes("Jul")) displayDate = "07/" + rawDate.split(" ")[2];
            else if (rawDate.includes("Aug")) displayDate = "08/" + rawDate.split(" ")[2];
            else if (rawDate.includes("Sep")) displayDate = "09/" + rawDate.split(" ")[2];
            else if (rawDate.includes("Oct")) displayDate = "10/" + rawDate.split(" ")[2];
            else if (rawDate.includes("Nov")) displayDate = "11/" + rawDate.split(" ")[2];
            else if (rawDate.includes("Dec")) displayDate = "12/" + rawDate.split(" ")[2];
            // 만약 시트 날짜가 "2026-01-18" 형식이면 "01/18"로 변경
            else if (rawDate.includes("-")) {
                const parts = rawDate.split("-");
                displayDate = parts[1] + "/" + parts[2].substring(0,2);
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

