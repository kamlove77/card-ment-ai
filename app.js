const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbyNfRKQLL2yMiiXT8aP2e03QfeVfOKFt4QsLw0467NxMnrqegKbufooiowT0W0aIjCgKA/exec";
let mentData = []; 

async function loadInitialData() {
    try {
        const response = await fetch(`${SHEET_API_URL}?mode=ment`);
        mentData = await response.json();
    } catch (e) { console.error("데이터 로딩 실패"); }
}

// 업무 가이드 조회 버튼 로직
document.getElementById("btn-search").onclick = () => {
    const searchInput = document.getElementById("quick-search").value.trim();
    
    if (!searchInput) {
        alert("번호를 입력해주세요.");
        return;
    }

    // 시트 데이터와 입력값을 비교 (8974)
    const found = mentData.find(item => String(item.screenNum).trim() === String(searchInput));

    if (found) {
        // [수정 포인트] 화면의 각 항목 ID에 데이터를 넣어줍니다.
        // 아래 ID들이 index.html의 각 칸 ID와 일치해야 합니다.
        document.getElementById("view-screen").textContent = found.screenNum || "-";
        
        // 검색어(C열) -> view-keywords 칸에 표시
        document.getElementById("view-keywords").textContent = found.keywords || "내용 없음";
        
        // 상세설명(D열) -> view-desc 칸에 표시
        document.getElementById("view-desc").textContent = found.description || "상세 설명이 없습니다.";
        
        // 필요하다면 멘트(E열)도 별도 칸에 표시 가능
    } else {
        alert(`'${searchInput}' 번호에 대한 정보를 찾을 수 없습니다.`);
    }
};

window.onload = loadInitialData;
