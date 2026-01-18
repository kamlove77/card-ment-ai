const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzF6PiiQG6jmkT6JQDiMlTRMOjbwSLomnhZu8xHvBjYQTf31SPxaBLZLU6K1hqBIlTadQ/exec";
let mentData = [];

async function init() {
    try {
        const mentRes = await fetch(`${SHEET_API_URL}?mode=ment`);
        mentData = await mentRes.json();
        updateTypeDropdown();
        await loadPerformance();
    } catch (e) { console.error(e); }
}

function updateTypeDropdown() {
    const typeSelect = document.getElementById("type");
    const types = [...new Set(mentData.map(item => String(item.type || "").trim()).filter(t => t !== ""))];
    typeSelect.innerHTML = "<option value=''>유형을 선택하세요</option>";
    types.forEach(type => {
        const opt = document.createElement("option");
        opt.value = type; opt.textContent = type;
        typeSelect.appendChild(opt);
    });
}

// 멘트 생성 (중복 데이터 처리 핵심)
document.getElementById("btn-generate").onclick = () => {
    const selected = document.getElementById("type").value;
    const output = document.getElementById("ment-output");
    if (!selected) return alert("유형을 선택하세요.");

    // 같은 유형을 모두 찾아서 합칩니다.
    const results = mentData.filter(item => String(item.type || "").trim() === selected);
    if (results.length > 0) {
        output.value = results.map((item, i) => `[멘트 ${i+1}]\n${item.text || ""}`).join("\n\n------------------\n\n");
    } else {
        output.value = "데이터가 없습니다.";
    }
};

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
    } else { alert("검색 결과가 없습니다."); }
};

async function loadPerformance() {
    const listBody = document.getElementById("perf-list");
    const totalEl = document.getElementById("total-calls");
    const res = await fetch(`${SHEET_API_URL}?mode=perf`);
    const data = await res.json();
    listBody.innerHTML = "";

    const now = new Date();
    let monthTotal = 0;

    data.forEach(row => {
        const callNum = parseInt(String(row.current).replace(/[^0-9]/g, "")) || 0;
        const d = new Date(row.date);
        if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
            monthTotal += callNum;
        }
        const tr = document.createElement("tr");
        const dateStr = !isNaN(d.getTime()) ? `${d.getMonth()+1}/${d.getDate()}` : "-";
        tr.innerHTML = `<td>${dateStr}</td><td>${row.current}콜</td><td>${row.rate}</td>`;
        listBody.appendChild(tr);
    });
    if (totalEl) totalEl.textContent = monthTotal.toLocaleString();
}

window.onload = init;
