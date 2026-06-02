"use strict";
/* =========================================================================
 * ai.js — Utility AI (THINK)
 *   몬스터가 "거리"와 "자기 HP"만 보고 chase/attack/retreat 점수를 계산하고
 *   가장 높은 행동을 monster.state 로 결정한다. (실제 이동은 update.js)
 * =======================================================================*/

function think() {
  const dx = player.x - monster.x, dy = player.y - monster.y;
  const dist = Math.hypot(dx, dy);
  const hp01 = clamp(monster.hp / monster.maxHp, 0, 1);

  // --- 고려요소(consideration)들을 0~1로 정규화 ---
  const far01      = clamp(dist / PERCEPTION, 0, 1); // 멀수록 1
  const near01     = 1 - far01;                       // 가까울수록 1
  const nearEngage = clamp(1 - dist / ENGAGE, 0, 1);  // 교전거리 안일수록 1
  const confidence = lerp(0.4, 1, hp01);              // HP 높을수록 공격적
  const hurt       = clamp((LOW_HP - hp01) / LOW_HP, 0, 1); // HP 임계치 밑일 때만 >0

  // --- 세 행동 점수 ---
  const chase   = far01 * confidence;            // 멀고 + 건강 → 추격
  const attack  = nearEngage * confidence;       // 가깝고 + 건강 → 공격
  const retreat = hurt * lerp(0.6, 1.0, near01);  // HP 낮음(+적이 가까울수록 위급) → 후퇴

  monster.scores = { chase, attack, retreat };
  monster.dist = dist;
  monster.hp01 = hp01;

  // --- 히스테리시스 + argmax 로 상태 선택 ---
  const biased = {
    chase:   chase   + (monster.state === "chase"   ? BIAS : 0),
    attack:  attack  + (monster.state === "attack"  ? BIAS : 0),
    retreat: retreat + (monster.state === "retreat" ? BIAS : 0),
  };
  monster.state = Object.keys(biased).reduce((a, b) => (biased[b] > biased[a] ? b : a));

  // --- 선택 이유(reason) ---
  const hpPct = Math.round(hp01 * 100), dpx = Math.round(dist);
  monster.reason =
      monster.state === "retreat" ? `HP ${hpPct}% (임계치 ${LOW_HP * 100 | 0}% 미만) → 후퇴 · 적 거리 ${dpx}`
    : monster.state === "attack"  ? `거리 ${dpx} (교전거리 ${ENGAGE} 이내) → 공격`
    :                               `거리 ${dpx} (교전거리 밖) → 추격으로 접근`;
}
