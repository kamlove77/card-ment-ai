const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzum84HO-733vm3uN-RNU8Kn9buRLx_Eg4N_SZgoFyBD6SXH4imoeqSLjYBscCTIbb63Q/exec";
const $ = (id) => document.getElementById(id);

// 1. 데이터 로드 공통 함수
async function fetchData(mode = "ment") {
    try {
        const response = await fetch(`${SHEET_API_URL}?mode=${mode}`);
        return await response.json();
    } catch (e) {
        console.error("데이터 로드 에러:", e);
        return [];
    }
}

// 2. 실적 관리 화면 (표) 업데이트 함수
async function loadPerformance() {
    const listBody = $("perf-list");
    listBody.innerHTML = "<tr><td colspan='4'>엑셀 자료를 가져오는 중...</td></tr>";

    const data = await fetchData("perf"); // mode=perf로 호출

    listBody.innerHTML = "";
    if (data.length === 0) {
        listBody.innerHTML = "<tr><td colspan='4'>기록된 실적 데이터가 없습니다.</td></tr>";
        return;
    }

    data.forEach(row => {
        const tr = document.createElement("tr");
        // 목표 135 대비 달성률 계산
        const rateNum = ((row.current / 135) * 100).toFixed(1);
        const color = rateNum >= 100 ? "#28a745" : "#d9534f";

        tr.innerHTML = `
            <td>${row.date}</td>
            <td>${row.current}콜</td>
            <td style="font-weight:bold; color:${color}">${rateNum}%</td>
            <td>${row.memo || "-"}</td>
        `;
        listBody.appendChild(tr);
    });
}

// 3. 페이지 로드 시 초기 세팅
window.onload = async () => {
    // 멘트 유형 드롭다운 초기화
    const mentData = await fetchData("ment");
    const typeSelect = $("type");
    
    if (mentData.length > 0) {
        typeSelect.innerHTML = "<option value=''>유형을 선택하세요</option>";
        const types = [...new Set(mentData.map(item => item.type))];
        types.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t; opt.textContent = t;
            typeSelect.appendChild(opt);
        });
    }

    // [멘트 만들기] 버튼 이벤트
    $("gen").onclick = async () => {
        const type = $("type").value;
        if (!type) return alert("유형을 선택해주세요.");
        
        const filtered = mentData.filter(item => item.type === type);
        const out = $("out");
        out.innerHTML = "";
        filtered.forEach((item, idx) => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <div style="font-weight:bold; color:#007bff;">추천 ${idx + 1}</div>
                <div style="white-space:pre-wrap; margin:10px 0;">${item.text}</div>
                <button class="copy-btn" onclick="navigator.clipboard.writeText(\`${item.text}\`).then(()=>alert('복사되었습니다!'))">복사</button>
            `;
            out.appendChild(card);
        });
    };

    // [화면번호 조회] 버튼 이벤트
    $("btn-search").onclick = () => {
        const keyword = $("quick-search").value.trim();
        if (!keyword) return alert("번호를 입력하세요.");
        
        const found = mentData.find(item => String(item.screenNum).includes(keyword));
        if (found) {
            $("view-screen").textContent = found.screenNum;
            $("view-keywords").textContent = found.keywords;
            $("view-desc").textContent = found.description;
        } else {
            alert("조회된 정보가 없습니다.");
        }
    };
};
