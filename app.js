// 1. 최신 배포 URL 적용
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzF6PiiQG6jmkT6JQDiMlTRMOjbwSLomnhZu8xHvBjYQTf31SPxaBLZLU6K1hqBIlTadQ/exec";
let mentData = [];

// 2. 초기 로드
async function init() {
    try {
        console.log("데이터 동기화 중...");
        const mentRes = await fetch(`${SHEET_API_URL}?mode=ment`);
        mentData = await mentRes.json();
        
        updateTypeDropdown(); // 상황 유형 목록 업데이트
        await loadPerformance(); // 실적 히스토리 로드
        console.log("모든 데이터 로드 완료");
    } catch (e) {
        console.error("데이터 로드 실패:", e);
    }
}

// 3. 실적 로드 (날짜를 MM/DD로 변환)
async function loadPerformance() {
    const listBody = document.getElementById("perf-list");
    const totalEl = document.getElementById("total-calls"); // 합계 박스 ID
    if (!listBody) return;

    try {
        const res = await fetch(`${SHEET_API_URL}?mode=perf`);
        const data = await res.json();
        listBody.innerHTML = ""; 

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        let monthTotal = 0; 

        data.forEach(row => {
            const tr = document.createElement("tr");
            let rowCall = parseInt(String(row.current).replace(/[^0-9]/g, "")) || 0;
            
            // 날짜 확인 및 이번 달 합산
            let displayDate = "-";
            if (row.date) {
                const dateObj = new Date(row.date);
                if (!isNaN(dateObj.getTime())) {
                    // 이번 달 데이터라면 합계에 추가
                    if (dateObj.getFullYear() === currentYear && dateObj.getMonth() === currentMonth) {
                        monthTotal += rowCall;
                    }
                    displayDate = `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`;
                }
            }

            tr.innerHTML = `<td>${displayDate}</td><td>${row.current}콜</td><td>${row.rate}</td><td>${row.memo || "-"}</td>`;
            listBody.appendChild(tr);
        });

        // 화면 상단 박스에 합계 출력 (이 부분이 핵심!)
        if (totalEl) {
            totalEl.textContent = monthTotal.toLocaleString(); 
        }

    } catch (e) {
        console.error("합계 계산 중 오류:", e);
    }
}

// 4. 상황 유형 드롭다운 업데이트
function updateTypeDropdown() {
    // HTML에 있는 실제 ID가 "type"인지 확인이 필요합니다.
    const typeSelect = document.getElementById("type") || document.querySelector("select");
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

// 5. 가이드 정보 검색 (조회 버튼 클릭 시)
// HTML의 버튼 ID가 "btn-search" 혹은 클래스가 있는지 확인하여 연결
document.addEventListener('click', function(e) {
    if (e.target && (e.target.id === 'btn-search' || e.target.textContent.includes('정보 확인하기'))) {
        const inputEl = document.getElementById("quick-search") || document.querySelector("input[placeholder*='화면번호']");
        if (!inputEl) return;
        
        const input = inputEl.value.trim().toLowerCase();
        if (!input) { alert("번호나 검색어를 입력하세요."); return; }

        const found = mentData.find(item => 
            String(item.screenNum || "").toLowerCase() === input || 
            String(item.keywords || "").toLowerCase().includes(input)
        );

        if (found) {
            // 화면의 "-" 표시 부분들을 찾아 데이터 삽입
            const views = document.querySelectorAll(".page-home div div p, #view-screen, #view-keywords, #view-desc");
            if (views.length >= 3) {
                // 구조에 따라 순서대로 매칭 (번호, 키워드, 상세내용)
                // 만약 ID가 지정되어 있다면 더 정확합니다.
                const screenView = document.getElementById("view-screen") || views[0];
                const keywordView = document.getElementById("view-keywords") || views[1];
                const descView = document.getElementById("view-desc") || views[2];
                
                if(screenView) screenView.textContent = found.screenNum || "-";
                if(keywordView) keywordView.textContent = found.keywords || "-";
                if(descView) descView.textContent = found.description || "-";
            }
        } else {
            alert("일치하는 가이드 정보가 없습니다.");
        }
    }
    
    // 6. 멘트 만들기 버튼 클릭 시
    if (e.target && (e.target.id === 'btn-generate' || e.target.textContent.includes('멘트 만들기'))) {
        const typeSelect = document.getElementById("type") || document.querySelector("select");
        const output = document.getElementById("ment-output") || document.querySelector("textarea");
        
        if (!typeSelect || !output) return;
        const selectedType = typeSelect.value;
        const found = mentData.find(item => String(item.type || "").trim() === selectedType);
        
        if (found) {
            output.value = found.text || "내용이 없습니다.";
        }
    }
});

window.onload = init;


