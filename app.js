const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbwuL7frRVVvewOcSxdPejC5xG1fGFwueoqdr7_k6VdSKlkHwB3YZZCFBSlUwp2psd3-cg/exec";
let mentData = [];

// 1. 페이지 로드 시 실행
async function init() {
    const typeSelect = document.getElementById("type");
    try {
        console.log("데이터 로드 시작...");
        const mentRes = await fetch(`${SHEET_API_URL}?mode=ment`);
        mentData = await mentRes.json();
        
        // 데이터가 성공적으로 오면 드롭다운 생성
        if (Array.isArray(mentData) && mentData.length > 0) {
            updateTypeDropdown();
            console.log("드롭다운 생성 완료");
        } else {
            if (typeSelect) typeSelect.innerHTML = "<option>데이터가 없습니다</option>";
        }

        // 실적 히스토리 로드
        await loadPerformance();
        
    } catch (e) {
        console.error("초기 로딩 에러:", e);
        if (typeSelect) typeSelect.innerHTML = "<option>로드 실패</option>";
    }
}

// 2. 상황 유형 드롭다운 생성 (중복 제거 및 빈칸 처리)
function updateTypeDropdown() {
    const typeSelect = document.getElementById("type");
    if (!typeSelect) return;

    // A열(type) 데이터가 있는 것만 골라내기
    const types = [...new Set(mentData.map(item => String(item.type || "").trim()).filter(t => t !== ""))];
    
    if (types.length > 0) {
        typeSelect.innerHTML = "<option value=''>유형을 선택하세요</option>";
        types.forEach(type => {
            const opt = document.createElement("option");
            opt.value = type;
            opt.textContent = type;
            typeSelect.appendChild(opt);
        });
    } else {
        typeSelect.innerHTML = "<option>등록된 유형 없음</option>";
    }
}

// 3. 가이드 정보 검색 (번호/문자 검색)
document.getElementById("btn-search").onclick = () => {
    const searchInput = document.getElementById("quick-search").value.trim().toLowerCase();
    if (!searchInput) return alert("검색어를 입력하세요.");

    const found = mentData.find(item => 
        String(item.screenNum || "").trim().toLowerCase() === searchInput || 
        String(item.keywords || "").trim().toLowerCase().includes(searchInput)
    );

    if (found) {
        document.getElementById("view-screen").textContent = found.screenNum || "-";
        document.getElementById("view-keywords").textContent = found.keywords || "-";
        document.getElementById("view-desc").textContent = found.description || "상세내용 없음";
    } else {
        alert("일치하는 가이드 정보가 없습니다.");
    }
};

// 4. 실적 히스토리 로딩
async function loadPerformance() {
    const listBody = document.getElementById("perf-list");
    if (!listBody) return;
    try {
        const res = await fetch(`${SHEET_API_URL}?mode=perf`);
        const data = await res.json();
        listBody.innerHTML = "";
        data.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${row.date}</td><td>${row.current}콜</td><td>${row.rate}</td><td>${row.memo || "-"}</td>`;
            listBody.appendChild(tr);
        });
    } catch (e) {
        listBody.innerHTML = "<tr><td colspan='4'>실적 로드 실패</td></tr>";
    }
}

// 5. 멘트 만들기 버튼 기능
document.getElementById("btn-generate").onclick = () => {
    const selectedType = document.getElementById("type").value;
    if (!selectedType) return alert("유형을 선택하세요.");

    const found = mentData.find(item => String(item.type || "").trim() === selectedType);
    const outputField = document.getElementById("ment-output");

    if (found && found.text) {
        outputField.value = found.text;
    } else {
        alert("해당 유형의 멘트가 없습니다.");
    }
};

window.onload = init;
