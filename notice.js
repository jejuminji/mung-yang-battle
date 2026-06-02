"use strict";
/* =========================================================================
 * notice.js — 상단 공지 배너 컨트롤러
 *   상황(카테고리)을 판정하고 notices.js 의 멘트 풀(LINES)에서 골라 표시.
 *   데이터(LINES, NOTICE_META)는 notices.js 에 분리되어 있음.
 * =======================================================================*/

// 총 멘트 수 → 배너에 표시
let NOTICE_TOTAL = 0; for (const k in LINES) NOTICE_TOTAL += LINES[k].length;

const noticeEl    = document.getElementById("notice");
const noticeIcon  = document.getElementById("notice-icon");
const noticeText  = document.getElementById("notice-text");
const noticeCount = document.getElementById("notice-count");
noticeCount.textContent = "멘트 " + NOTICE_TOTAL + "종";

const notice = { cat: null, text: "", timer: 0, lastIdx: {} };
const NOTICE_MIN = 1.7;

// 현재 상황을 우선순위대로 판정 → 카테고리 키
function pickSituation() {
  if (monster.dead) return "dead";
  if (monster.justResp > 0) return "respawn";
  if (monster.hurt > 0) return "gotHit";     // 방금 맞음
  if (monster.dealt > 0) return "dealt";     // 방금 때림(딜 성공)

  const hp01  = monster.hp / monster.maxHp;
  const php01 = player.hp / player.maxHp;
  const lull  = gameTime - lastCombatT;       // 마지막 교전 후 경과
  const nearWall = monster.x < ARENA.x + 36 || monster.x > ARENA.x + ARENA.w - 36 ||
                   monster.y < ARENA.y + 36 || monster.y > ARENA.y + ARENA.h - 36;

  if (hp01 < 0.18) return "critical";
  if (monsterDps > 14 && playerDps > 14) return "intense";

  // 한동안 교전이 없으면: 가까우면 대치, 멀면 한가
  if (monster.state !== "retreat" && lull > 3.5) {
    if (monster.dist < ENGAGE * 1.6) return "standoff";
    if (lull > 6) return "idle";
  }
  if (nearWall && monster.state === "retreat") return "wall";
  if (monster.state === "retreat") return php01 > 0.6 ? "losing" : "retreat";
  if (php01 < 0.25 && hp01 > 0.5) return "preyWeak";

  if (monster.state === "attack") {
    if (monster.atkCd > MON_CD * 0.45) return "recover";   // 막 휘둘러 쿨다운 중
    return "attack";
  }
  if (monster.state === "chase") {
    if (monster.dist > PERCEPTION * 0.6) return "farChase";
    if (hp01 > 0.6 && php01 < 0.5) return "winning";
    return "chase";
  }
  return "idle";
}

// 풀에서 직전과 다른 멘트 하나 선택
function pickLine(cat) {
  const arr = LINES[cat] || LINES.idle;
  let i = Math.floor(Math.random() * arr.length);
  if (arr.length > 1 && i === notice.lastIdx[cat]) i = (i + 1) % arr.length;
  notice.lastIdx[cat] = i;
  return arr[i];
}

function updateNotice(dt) {
  notice.timer -= dt;
  const cat = pickSituation();
  // 상황이 바뀌었거나 표시 시간이 지나면 새 멘트로 교체
  if (cat !== notice.cat || notice.timer <= 0) {
    notice.cat = cat;
    notice.text = pickLine(cat);
    notice.timer = NOTICE_MIN + Math.random() * 1.3;
    const meta = NOTICE_META[cat] || NOTICE_META.idle;
    noticeIcon.textContent = meta.i;
    noticeText.textContent = notice.text;
    noticeEl.style.borderColor = meta.c;
    noticeEl.classList.remove("pop"); void noticeEl.offsetWidth; noticeEl.classList.add("pop");
  }
}
