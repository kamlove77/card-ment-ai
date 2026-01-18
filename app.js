const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbyNfRKQLL2yMiiXT8aP2e03QfeVfOKFt4QsLw0467NxMnrqegKbufooiowT0W0aIjCgKA/exec";
let mentData = []; 

// 1. 초기 데이터 로드
async function loadInitialData() {
    try {
        const response = await fetch(`${SHEET_API_URL}?mode=ment`);
        mentData = await response.json();
        console.log("전체 데이터 로드 성공:", mentData); 
    } catch (error) {
        console.error("데이터 로드 중 오류 발생:", error);
    }
}

// 2. 검색 버튼 클릭 시 실행
document.getElementById("btn-search").onclick = () => {
    const inputField = document.getElementById("quick-search");
    const searchInput = inputField.value.trim().toLowerCase();
    
    if (!searchInput) {
        alert("번호(8974) 또는 검색어(문자)를 입력하세요.");
        return;
    }

    // [강화된 검색 로직] 번호(B열) 또는 검색어(C열) 어디에든 포함되면 찾음
    const found = mentData.find(item => {
        const screenNum = String(item.screenNum || "").trim().toLowerCase();
        const keywords = String(item.keywords || "").trim().toLowerCase();
        return screenNum === searchInput || keywords.includes(searchInput);
    });

    if (found) {
        // HTML 요소가 존재하는지 확인 후 데이터 입력
        const setContent = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value || "-";
        };

        // 시트의 열 이름(screenNum, keywords, description)과 정확히 매칭
        setContent("view-screen", found.screenNum);
        setContent("view-keywords", found.keywords);
        setContent("view-desc", found.description);
        
        console.log("검색 결과 표시 완료:", found);
    } else {
        alert(`'${searchInput}'에 일치하는 정보가 시트에 없습니다.`);
    }
};

window.onload = loadInitialData;
