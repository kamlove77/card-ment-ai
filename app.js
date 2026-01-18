
// 제공해주신 배포 URL을 적용했습니다.
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbxn9dNC9NvG-cwkwxOBfEVAM8vYKYUrqLX-MvF9OqIr7AHGZEDBml5mqjPftgVFFYK29w/exec";
let mentData = [];

async function init() {
    setTodayDate();
    loadNotice(); // 공지사항 로드
    loadPerformance();
    loadMents();
}

// [핵심] 공지사항 로드 함수: A열(date)과 B열(content)을 나누어 출력
async function loadNotice() {
    try {
        const res = await fetch(`${SHEET_API_URL}?mode=notice`);
        const data = await res.json();
        const container = document.getElementById("notice-container");
        
        if (data && data.length > 0) {
            container.innerHTML = ""; // 기존 문구 삭제
            data.forEach(item => {
                const row = document.createElement("div");
                row.className = "notice-row";

                // 1. A열 날짜 칸 (col-date)
                const dateCol = document.createElement("div");
                dateCol.className = "col-date";
                dateCol.innerText = item.date || ""; 

                // 2. B열 내용 칸 (col-content)
                const contentCol = document.createElement("div");
                contentCol.className = "col-content";
                contentCol.innerText = `• ${item.content || ""}`;

                // 행에 날짜와 내용을 순서대로 추가
                row.appendChild(dateCol);
                row.appendChild(contentCol);
                container.appendChild(row);
            });
        }
    } catch (e) {
        console.error("공지 로드 실패", e);
        document.getElementById("notice-container").innerText = "공지사항을 불러올 수 없습니다.";
    }
}

// 오늘 날짜 표시
function setTodayDate() {
    const now = new Date();
    const week = ['일', '월', '화', '수', '목', '금', '토'];
    const dateStr = `${now.getFullYear()}.${(now.getMonth()+1).toString().padStart(2,'0')}.${now.getDate().toString().padStart(2,'0')} (${week[now.getDay()]})`;
    document.getElementById('today-date').innerText = dateStr;
}

// 나머지 함수들 (로드 멘트, 실적 등은 기존과 동일)
async function loadMents() {
    try {
        const res = await fetch(`${SHEET_API_URL}?mode=ment`);
        mentData = await res.json();
        updateTypeDropdown();
    } catch (e) { console.error(e); }
}

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

// 가이드 검색
document.getElementById("btn-search").onclick = () => {
    const input = document.getElementById("quick-search").value.trim().toLowerCase();
    const found = mentData.find(item => 
        String(item.screenNum).toLowerCase() === input || 
        String(item.keywords).toLowerCase().includes(input)
    );
    if (found) {
        document.getElementById("view-screen").textContent = found.screenNum;
        document.getElementById("view-desc").textContent = found.description;
    } else { alert("검색 결과가 없습니다."); }
};

// 멘트 생성
document.getElementById("btn-generate").onclick = () => {
    const selected = document.getElementById("type").value;
    const output = document.getElementById("ment-output");
    const results = mentData.filter(item => String(item.type).trim() === selected);
    if (results.length > 0) {
        output.value = results.map((item, i) => `[멘트 ${i+1}]\n${item.text}`).join("\n\n------------------\n\n");
    }
};

async function loadPerformance() {
    try {
        const res = await fetch(`${SHEET_API_URL}?mode=perf`);
        const data = await res.json();
        const listBody = document.getElementById("perf-list");
        let monthTotal = 0;
        listBody.innerHTML = "";
        data.forEach(row => {
            monthTotal += parseInt(String(row.current).replace(/[^0-9]/g, "")) || 0;
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${row.date.split('T')[0]}</td><td>${row.current}콜</td><td>${row.rate}</td>`;
            listBody.appendChild(tr);
        });
        document.getElementById("total-calls").textContent = monthTotal.toLocaleString();
    } catch (e) { console.error(e); }
}

window.onload = init;
