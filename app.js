const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbwuL7frRVVvewOcSxdPejC5xG1fGFwueoqdr7_k6VdSKlkHwB3YZZCFBSlUwp2psd3-cg/exec";
let mentData = [];

async function init() {
    try {
        console.log("데이터 로드 시도...");
        // 가이드 데이터 로드
        const mentRes = await fetch(`${SHEET_API_URL}?mode=ment`);
        mentData = await mentRes.json();
        
        // 실적 데이터 로드
        await loadPerformance();
        
        // 드롭다운 업데이트
        updateTypeDropdown();
        console.log("초기 로드 완료");
    } catch (e) {
        console.error("초기화 중 오류:", e);
    }
}

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

// 가이드 검색 기능
document.getElementById("btn-search").onclick = () => {
    const input = document.getElementById("quick-search").value.trim().toLowerCase();
    if (!input) return alert("검색어를 입력하세요.");

    const found = mentData.find(item => 
        String(item.screenNum || "").toLowerCase() === input || 
        String(item.keywords || "").toLowerCase().includes(input)
    );

    if (found) {
        // ID 이름이 HTML과 일치해야 데이터가 보입니다.
        if(document.getElementById("view-screen")) document.getElementById("view-screen").textContent = found.screenNum || "-";
        if(document.getElementById("view-keywords")) document.getElementById("view-keywords").textContent = found.keywords || "-";
        if(document.getElementById("view-desc")) document.getElementById("view-desc").textContent = found.description || "내용 없음";
    } else {
        alert("일치하는 정보를 찾을 수 없습니다.");
    }
};

async function loadPerformance() {
    const listBody = document.getElementById("perf-list");
    if (!listBody) return;

    try {
        const res = await fetch(`${SHEET_API_URL}?mode=perf`);
        const data = await res.json();
        listBody.innerHTML = ""; // 로딩 문구 제거

        data.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${row.date}</td><td>${row.current}콜</td><td>${row.rate}</td><td>${row.memo || "-"}</td>`;
            listBody.appendChild(tr);
        });
    } catch (e) {
        listBody.innerHTML = "<tr><td colspan='4'>실적 로드 실패</td></tr>";
    }
}

window.onload = init;
