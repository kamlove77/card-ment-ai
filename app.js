const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbyNfRKQLL2yMiiXT8aP2e03QfeVfOKFt4QsLw0467NxMnrqegKbufooiowT0W0aIjCgKA/exec";
let mentData = []; 

async function loadInitialData() {
    try {
        const response = await fetch(`${SHEET_API_URL}?mode=ment`);
        mentData = await response.json();
    } catch (e) { console.error("데이터 로드 실패"); }
}

// 업무 가이드 조회 버튼 로직 (번호 또는 검색어 모두 대응)
document.getElementById("btn-search").onclick = () => {
    const searchInput = document.getElementById("quick-search").value.trim().toLowerCase();
    
    if (!searchInput) {
        alert("화면번호나 검색어(예: 문자)를 입력해주세요.");
        return;
    }

    // [핵심] 번호(screenNum) 또는 검색어(keywords) 중 하나라도 일치하는 데이터를 찾습니다.
    const found = mentData.find(item => {
        const screenMatch = String(item.screenNum).trim() === searchInput;
        const keywordMatch = String(item.keywords).trim().toLowerCase().includes(searchInput);
        return screenMatch || keywordMatch;
    });

    if (found) {
        // 결과 표시
        document.getElementById("view-screen").textContent = found.screenNum || "-";
        document.getElementById("view-keywords").textContent = found.keywords || "내용 없음";
        document.getElementById("view-desc").textContent = found.description || "상세내용 없음";
        
        // 멘트(E열)도 보여주고 싶다면 추가 (HTML에 id="view-text"가 있는 경우)
        const textElement = document.getElementById("view-text");
        if (textElement) textElement.textContent = found.text || "";
    } else {
        alert(`'${searchInput}'에 대한 정보를 찾을 수 없습니다.`);
    }
};

window.onload = loadInitialData;
