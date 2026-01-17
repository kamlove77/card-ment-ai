const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbx74RuBip87Eh_wLLfJBdaZaK_1pZUEN7W_AKqtYDMzN_cD6q0gb6mYKAErbZjpiGh99A/exec";


const $ = (id) => document.getElementById(id);



async function loadTemplatesFromSheet() {
  const res = await fetch(SHEET_API_URL);
  const data = await res.json();

  const map = {};
  data.forEach(r => {
    if (!map[r.type]) map[r.type] = [];
    map[r.type].push(r.text);
  });
  return map;
}

function polishTone(text, tone) {
  if (tone === "short") {
    // 첫 문장만 남기기(마침표 기준)
    const first = text.split("다.")[0];
    return first.endsWith("다") ? first + "." : first + "다.";
  }
  if (tone === "soft") {
    return "고객님 불편을 드려 죄송합니다. " + text;
  }
  return text;
}

function withDetail(text, detail) {
  const d = detail.trim();
  if (!d) return text;
  // 디테일을 자연스럽게 한 번 섞기
  return `${text}\n(참고: 고객님 말씀하신 상황: ${d})`;
}

async function makeMentions(type, tone, detail) {
  const templates = await loadTemplatesFromSheet();
  const base = templates[type] ?? [];
  const out = [];
  for (let i = 0; i < 5; i++) {
    const t = base[i % base.length] || "해당 유형에 등록된 멘트가 없습니다.";
    out.push(withDetail(polishTone(t, tone), detail));
  }
  return out;
}


function render(list) {
  const out = $("out");
  out.innerHTML = "";
  list.forEach((m, idx) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="pill">추천 ${idx + 1}</div>
      <div class="ment" id="m-${idx}" style="margin-top:10px"></div>
      <div class="ment-actions">
        <button class="btn-primary" data-copy="${idx}">복사</button>
        <button class="btn-ghost" data-edit="${idx}">수정</button>
      </div>
    `;
    out.appendChild(card);
    card.querySelector(`#m-${idx}`).textContent = m;

    card.querySelector(`[data-copy="${idx}"]`).onclick = async () => {
      try {
        await navigator.clipboard.writeText(m);
        alert("복사 완료");
      } catch {
        // clipboard 권한 실패 시 fallback
        const ta = document.createElement("textarea");
        ta.value = m;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        alert("복사 완료");
      }
    };

    card.querySelector(`[data-edit="${idx}"]`).onclick = () => {
      const next = prompt("멘트 수정", m);
      if (typeof next === "string") {
        list[idx] = next;
        render(list);
      }
    };
  });
}

$("gen").onclick = async () => {
  const type = $("type").value;
  const tone = $("tone").value;
  const detail = $("detail").value;
  const list = await makeMentions(type, tone, detail);
  render(list);
};

$("clear").onclick = () => {
  $("detail").value = "";
  $("out").innerHTML = "";
};



