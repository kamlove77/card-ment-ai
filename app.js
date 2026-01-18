// 최신 배포 URL 적용
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbwt6m_Cpo9II5FBjTS57UXKqIBvuQdhN1jx9a9gRvCt9nA0wkYUxbK9W8LbIYETmifr8w/exec";

const $ = (id) => document.getElementById(id);

async function loadData() {
    try {
        const res = await fetch(SHEET_API_URL);
        return await res.json();
    } catch (e) {
        console.error("데이터 로드 실패:", e);
        return [];
    }
}

window.onload = async () => {
    const data = await loadData();
    const typeSelect = $("type");
    
    if (data.length > 0) {
        typeSelect.innerHTML = "<option value=''>유형을 선택하세요</option>";
        const types = [...new Set(data.map(item => item.type))];
        types.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t; opt.textContent = t;
            typeSelect.appendChild(opt);
        });
    }

    // [왼쪽] 멘트 만들기 버튼
    $("gen").onclick = async () => {
        const type = $("type").value;
        if (!type) return alert("유형을 먼저 선택하세요.");
        const allData = await loadData();
        const filtered = allData.filter(item => item.type === type);
        const out = $("out");
        out.innerHTML = "";
        filtered.forEach((item, idx) => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <div style="font-weight:bold; color:#007bff; font-size:12px;">추천 ${idx+1}</div>
                <div style="white-space:pre-wrap; margin:10px 0;">${item.text}</div>
                <button class="copy-btn" onclick="navigator.clipboard.writeText(\`${item.text}\`)">복사</button>
            `;
            out.appendChild(card);
        });
    };

    // [오른쪽] 8974 등 화면번호 개별 조회 버튼 (핵심 수정 부분)
    $("btn-search").onclick = async () => {
        const keyword = $("quick-search").value.trim();
        if (!keyword) return alert("조회할 화면번호를 입력하세요.");

        const allData = await loadData();
        // 시트의 B열(screenNum) 또는 C열(keywords)에서 입력값이 포함된 행 찾기
        const found = allData.find(item => 
            (item.screenNum && String(item.screenNum).includes(keyword)) ||
            (item.keywords && String(item.keywords).includes(keyword))
        );

        if (found) {
            $("view-screen").textContent = found.screenNum || "-";
            $("view-keywords").textContent = found.keywords || "-";
            $("view-desc").textContent = found.description || "-";
        } else {
            alert("일치하는 정보를 찾을 수 없습니다.");
            $("view-screen").textContent = "-";
            $("view-keywords").textContent = "-";
            $("view-desc").textContent = "-";
        }
    };
};
