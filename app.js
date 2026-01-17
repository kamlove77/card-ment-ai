const $ = (id) => document.getElementById(id);

const templates = {
  decline: [
    "고객님, 해당 거래는 카드 승인 단계에서 거절되어 결제가 완료되지 않은 것으로 확인됩니다.",
    "고객님, 해당 건은 승인 거절로 확인되어 실제 결제는 이루어지지 않았습니다.",
    "고객님, 승인 단계에서 거절된 건으로 확인되며 청구로 이어지지 않은 것으로 보입니다."
  ],
  cancel: [
    "고객님, 가맹점 취소 후 환불 반영까지는 영업일 기준으로 일정 기간 소요될 수 있습니다.",
    "고객님, 취소 처리 후 환불은 가맹점/결제망 사정에 따라 반영까지 시간이 걸릴 수 있습니다.",
    "고객님, 취소는 확인되며 환불 반영은 영업일 기준 순차 처리될 수 있습니다."
  ],
  duplicate: [
    "고객님, 동일 거래로 보이는 결제 내역이 중복으로 확인되어 확인 후 안내드리겠습니다.",
    "고객님, 중복 결제 가능성이 있어 거래 내역 확인 후 처리 방법을 안내드리겠습니다.",
    "고객님, 같은 가맹점/금액으로 중복 승인된 내역이 확인되어 추가 확인이 필요합니다."
  ],
  overseas: [
    "고객님, 해외 결제는 보안 설정/한도/가맹점 인증 방식에 따라 승인 실패가 발생할 수 있습니다.",
    "고객님, 해외 온라인 결제는 인증 여부 및 차단 설정에 따라 승인 거절될 수 있습니다.",
    "고객님, 해외 결제 차단 또는 인증 문제로 승인 실패가 발생했을 가능성이 있습니다."
  ],
  dispute: [
    "고객님, 본인 미사용 또는 서비스 미이행 등 분쟁 사유에 따라 이의신청 접수 가능 여부를 확인해드리겠습니다.",
    "고객님, 거래 관련 분쟁 건은 증빙 확인 후 이의신청 절차로 안내드릴 수 있습니다.",
    "고객님, 해당 거래는 분쟁 접수 대상인지 확인 후 필요한 절차를 안내드리겠습니다."
  ],
  limit: [
    "고객님, 이용한도 또는 비밀번호 입력 오류 등으로 승인 거절될 수 있어 설정 확인이 필요합니다.",
    "고객님, 한도/비밀번호/보안 설정으로 인해 승인 실패가 발생했을 가능성이 있습니다.",
    "고객님, 한도 초과 또는 인증 오류로 승인 거절될 수 있어 확인 후 안내드리겠습니다."
  ],
};

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

function makeMentions(type, tone, detail) {
  const base = templates[type] ?? [];
  // 5개 출력(부족하면 반복)
  const out = [];
  for (let i = 0; i < 5; i++) {
    const t = base[i % base.length];
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

$("gen").onclick = () => {
  const type = $("type").value;
  const tone = $("tone").value;
  const detail = $("detail").value;
  const list = makeMentions(type, tone, detail);
  render(list);
};

$("clear").onclick = () => {
  $("detail").value = "";
  $("out").innerHTML = "";
};
