// 제공해주신 배포 URL을 적용했습니다.
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzAYeP4vweeivikwidpfViXiw0H8L-VS0gEr1sb1be75nI4yrjFMNnwncfJ7dnWC0qFoA/exec"; 
let mentData = [];

async function init() {
    setTodayDate();
    try {
        // 1. 공지사항 로드
        await loadNotice();
        
        // 2. 멘트 데이터 로드
        const mentRes = await fetch(`${SHEET_API_URL}?mode=ment`);
        mentData = await mentRes.json();
        updateTypeDropdown();
        
        // 3. 실적 데이터 로드
        await loadPerformance();
    } catch (e) { 
        console.error("데이터 로드 중 오류 발생:", e); 
    }
}

// 오늘 날짜 표시 함수
function setTodayDate() {
    const now = new Date();
    const week = ['일', '월', '화', '수', '목', '금', '토'];
    const dateStr = `${now.getFullYear()}.${(now.getMonth()+1).toString().padStart(2,'0')}.${now.getDate().toString().padStart(2,'0')} (${week[now.getDay()]})`;
    document.getElementById('today-date').innerText = dateStr;
}

// 공지사항 로드 함수 (흐르지 않고 그대로 출력)
async function loadNotice() {
    try {
        const res = await fetch(`${SHEET_API_URL}?mode=notice`);
        const data = await res.json();
        const container = document.getElementById("notice-container");
        
        if (data && data.length > 0) {
            container.innerHTML = ""; // 기존 내용 비우기
            data.forEach(item => {
                const div = document.createElement("div");
                div.style.marginBottom = "5px";
                div.style.fontWeight = "500";
                // 시트의 'content' 내용을 그대로 출력
                div.innerText = `• ${item.content}`; 
                container.appendChild(div);
            });
        } else {
            container.innerText = "현재 등록된 공지사항이 없습니다.";
        }
    } catch (e) {
        console.error("공지사항 로드 실패");
        document.getElementById("notice-container").innerText = "공지사항을 불러올 수 없습니다.";
    }
}

// 멘트 유형 드롭다운 업데이트
function updateTypeDropdown() {
    const typeSelect = document.getElementById("type");
    const types = [...new Set(mentData.map(item => String(item.type || "").trim()).filter(t => t !== ""))];
    typeSelect.innerHTML = "<option value=''>상황 유형을 선택하세요</option>";
    types.forEach(type => {
        const opt = document.createElement("option");
        opt.value = type; opt.textContent = type;
        typeSelect.appendChild(opt);
    });
}

// 멘트 생성 버튼 클릭 이벤트
document.getElementById("btn-generate").onclick = () => {
    const selected = document.getElementById("type").value;
    const output = document.getElementById("ment-output");
    if (!selected) return alert("유형을 선택해주세요.");

    const results = mentData.filter(item => String(item.type || "").trim() === selected);
    if (results.length > 0) {
        output.value = results.map((item, i) => `[멘트 ${i+1}]\n${item.text}`).join("\n\n------------------\n\n");
    } else {
        output.value = "해당 유형의 멘트가 없습니다.";
    }
};

// 가이드 검색 버튼 클릭 이벤트
document.getElementById("btn-search").onclick = () => {
    const input = document.getElementById("quick-search").value.trim().toLowerCase();
    if (!input) return alert("검색어를 입력하세요.");

    const found = mentData.find(item => 
        String(item.screenNum).toLowerCase() === input || 
        String(item.keywords).toLowerCase().includes(input)
    );
    
    if (found) {
        document.getElementById("view-screen").textContent = found.screenNum || "-";
        document.getElementById("view-desc").textContent = found.description || "-";
    } else {
        alert("일치하는 가이드 정보가 없습니다.");
    }
};

// 실적 데이터 로드 함수
async function loadPerformance() {
    const listBody = document.getElementById("perf-list");
    const totalEl = document.getElementById("total-calls");
    const res = await fetch(`${SHEET_API_URL}?mode=perf`);
    const data = await res.json();
    const now = new Date();
    let monthTotal = 0;
    
    listBody.innerHTML = "";
    data.forEach(row => {
        const d = new Date(row.date);
        // 이번 달 합계 계산
        if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
            monthTotal += parseInt(String(row.current).replace(/[^0-9]/g, "")) || 0;
        }
        const tr = document.createElement("tr");
        const dateStr = !isNaN(d.getTime()) ? `${d.getMonth()+1}/${d.getDate()}` : "-";
        tr.innerHTML = `<td>${dateStr}</td><td>${row.current}콜</td><td>${row.rate}</td>`;
        listBody.appendChild(tr);
    });
    totalEl.textContent = monthTotal.toLocaleString();
}

window.onload = init;
