// 알려주신 최신 배포 URL입니다.
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

// 페이지 로드 시 드롭다운 메뉴 설정
window.onload = async () => {
    const data = await loadData();
    const typeSelect = $("type");
    typeSelect.innerHTML = "<option value=''>상황을 선택하세요</option>";

    const types = [...new Set(data.map(item => item.type))];
    types.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        typeSelect.appendChild(opt);
    });
};

// 말투 변환 로직
function polishTone(text, tone) {
    if (tone === "short") return text.split(".")[0] + ".";
    if (tone === "soft") return "고객님, 이용에 불편을 드려 죄송합니다. " + text;
    return text;
}

// 멘트 만들기 버튼 클릭 시 실행
$("gen").onclick = async () => {
    const type = $("type").value;
    const tone = $("tone").value;
    const detail = $("detail").value;

    if (!type) return alert("상황 유형을 먼저 선택해주세요.");

    const data = await loadData();
    // 선택한 유형과 일치하는 데이터들만 가져옴
    const filtered = data.filter(item => item.type === type);

    if (filtered.length > 0) {
        // [1] 오른쪽 가이드 패널 업데이트 (첫 번째 행 데이터 기준)
        const info = filtered[0];
        $("view-screen").textContent = info.screenNum || "등록된 번호 없음";
        $("view-keywords").textContent = info.keywords || "-";
        $("view-desc").textContent = info.description || "상세 설명이 없습니다.";

        // [2] 왼쪽 멘트 리스트 생성
        const out = $("out");
        out.innerHTML = ""; // 이전 결과 지우기
        
        filtered.forEach((item, idx) => {
            const card = document.createElement("div");
            card.className = "card";
            // 말투 적용 및 고객 상황 추가
            const ment = polishTone(item.text, tone) + (detail ? `\n\n(참고: ${detail})` : "");
            
            card.innerHTML = `
                <div class="pill">추천 ${idx + 1}</div>
                <div style="white-space:pre-wrap; margin-bottom:10px; font-size:15px; line-height:1.6;">${ment}</div>
                <button class="copy-btn" onclick="navigator.clipboard.writeText(\`${ment}\`)">복사하기</button>
            `;
            out.appendChild(card);
        });
    }
};

// 초기화 버튼
$("clear").onclick = () => {
    $("detail").value = "";
    $("out").innerHTML = "";
    $("view-screen").textContent = "-";
    $("view-keywords").textContent = "-";
    $("view-desc").textContent = "-";
};

// [추가 기능] 오른쪽 독립 조회 버튼 로직
$("btn-search").onclick = async () => {
    // 1. 입력창에서 검색어 가져오기
    const keyword = $("quick-search").value.trim();
    if (!keyword) return alert("조회할 화면번호나 검색어를 입력하세요.");

    // 2. 시트 데이터 로드
    const data = await loadData();
    
    // 3. 시트 전체에서 화면번호(B열) 또는 검색어(C열)가 일치하는 첫 번째 행 찾기
    const found = data.find(item => 
        item.screenNum.includes(keyword) || 
        item.keywords.includes(keyword)
    );

    // 4. 결과가 있으면 오른쪽 가이드 영역만 업데이트
    if (found) {
        $("view-screen").textContent = found.screenNum;
        $("view-keywords").textContent = found.keywords;
        $("view-desc").textContent = found.description;
    } else {
        alert("일치하는 화면 정보가 없습니다. 다시 확인해 주세요.");
    }
};

