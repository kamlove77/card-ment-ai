const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbxOwMvXHz_yn8NE02pwDO66Xlo9aLFcgvAb7iQu_zwnq802FPAQfHnRgNMBPBosPQNcyA/exec";
let mentData = [];

// 1. 초기 로드 (실적과 가이드를 각각 독립적으로 실행)
async function init() {
    console.log("데이터 로드 시작...");
    
    // 가이드 데이터 로드 시도
    try {
        const mentRes = await fetch(`${SHEET_API_URL}?mode=ment`);
        mentData = await mentRes.json();
        updateTypeDropdown();
        console.log("가이드 로드 성공");
    } catch (e) {
        console.error("가이드 로드 실패:", e);
    }

    // 실적 히스토리 로드 시도 (별도로 실행하여 하나가 안돼도 나머지는 되게 함)
    loadPerformance();
}

// 2. 실적 히스토리 로드 (HTML ID: perf-list)
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
        console.error("실적 로드 실패:", e);
        listBody.innerHTML = "<tr><td colspan='4'>실적 데이터를 가져올 수 없습니다.</td></tr>";
    }
}

// 3. 상황 유형 드롭다운 (HTML ID: type)
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

// 4. 가이드 상세 조회 (HTML ID들: quick-search, btn-search, view-screen, view-keywords, view-desc)
const btnSearch = document.getElementById("btn-search");
if (btnSearch) {
    btnSearch.onclick = () => {
        const input = document.getElementById("quick-search").value.trim().toLowerCase();
        if (!input) return alert("검색어를 입력하세요.");

        const found = mentData.find(item => 
            String(item.screenNum || "").toLowerCase() === input || 
            String(item.keywords || "").toLowerCase().includes(input)
        );

        if (found) {
            // 상세내용이 안나오던 문제 해결: ID가 존재하는지 체크 후 입력
            const setVal = (id, val) => { if(document.getElementById(id)) document.getElementById(id).textContent = val || "-"; };
            setVal("view-screen", found.screenNum);
            setVal("view-keywords", found.keywords);
            setVal("view-desc", found.description);
        } else {
            alert("일치하는 가이드 정보를 찾을 수 없습니다.");
        }
    };
}

// 5. 멘트 생성 (HTML ID: btn-generate, ment-output)
const btnGen = document.getElementById("btn-generate");
if (btnGen) {
    btnGen.onclick = () => {
        const selectedType = document.getElementById("type").value;
        const found = mentData.find(item => String(item.type || "").trim() === selectedType);
        const output = document.getElementById("ment-output");
        if (found && output) {
            output.value = found.text || "멘트 내용이 없습니다.";
        }
    };
}

window.onload = init;

