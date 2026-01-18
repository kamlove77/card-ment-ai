// 1. 최신 배포 URL (TadQ 버전)
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzF6PiiQG6jmkT6JQDiMlTRMOjbwSLomnhZu8xHvBjYQTf31SPxaBLZLU6K1hqBIlTadQ/exec";
let mentData = [];

// 2. 초기 로딩: 가이드와 실적 데이터를 병렬로 로드
async function init() {
    try {
        console.log("데이터 동기화 중...");
        const mentRes = await fetch(`${SHEET_API_URL}?mode=ment`);
        mentData = await mentRes.json();
        
        updateTypeDropdown(); // 드롭다운 업데이트
        await loadPerformance(); // 실적 로드
    } catch (e) {
        console.error("데이터 통신 오류:", e);
    }
}

// 3. 실적 로드 (성공하셨던 날짜 가공 로직 포함)
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
        listBody.innerHTML = "<tr><td colspan='4'>데이터 로드 중 에러가 발생했습니다.</td></tr>";
    }
}

// 4. 상황 유형 드롭다운 (A열: 유형 기반)
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

// 5. 가이드 정보 검색 (B열: 화면번호 또는 C열: 키워드)
const btnSearch = document.getElementById("btn-search");
if (btnSearch) {
    btnSearch.onclick = () => {
        const inputEl = document.getElementById("quick-search");
        if (!inputEl) return;
        
        const input = inputEl.value.trim().toLowerCase();
        if (!input) return alert("번호나 검색어를 입력하세요.");

        const found = mentData.find(item => 
            String(item.screenNum || "").toLowerCase() === input || 
            String(item.keywords || "").toLowerCase().includes(input)
        );

        if (found) {
            const setVal = (id, val) => { if(document.getElementById(id)) document.getElementById(id).textContent = val || "-"; };
            setVal("view-screen", found.screenNum);
            setVal("view-keywords", found.keywords);
            setVal("view-desc", found.description);
        } else {
            alert(`'${input}' 정보를 찾을 수 없습니다. 시트의 내용을 확인해 보세요.`);
        }
    };
}

// 6. 멘트 만들기 버튼 (E열: 멘트 기반)
const btnGen = document.getElementById("btn-generate");
if (btnGen) {
    btnGen.onclick = () => {
        const typeEl = document.getElementById("type");
        const outputEl = document.getElementById("ment-output");
        if (!typeEl || !outputEl) return;

        const selectedType = typeEl.value;
        const found = mentData.find(item => String(item.type || "").trim() === selectedType);
        
        if (found) {
            outputEl.value = found.text || "멘트 내용이 비어있습니다.";
        } else {
            alert("유형을 먼저 선택해 주세요.");
        }
    };
}

// 전체 로딩 완료 후 실행
window.onload = init;
