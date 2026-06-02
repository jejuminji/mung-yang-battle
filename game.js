"use strict";
/* =========================================================================
 * game.js — 게임 루프 (가장 마지막에 로드, 모든 시스템을 묶음)
 *   delta time 기반으로 매 프레임:
 *   입력/AI 갱신 → 측정/공지 갱신 → 렌더 → 패널 동기화
 * =======================================================================*/

let last = 0;
function loop(ts) {
  const dt = Math.min(0.05, (ts - last) / 1000) || 0;  // 탭 비활성 시 dt 폭주 방지
  last = ts;
  gameTime += dt;

  // --- 갱신 ---
  updatePlayer(dt);      // 플레이어 이동/공격
  updateMonster(dt);     // 몬스터 THINK + ACT
  checkPlayerDeath();    // 플레이어 사망 처리

  // --- 측정/공지 ---
  playerDps  = rollDps(dealtEvents);
  monsterDps = rollDps(takenEvents);
  sampleMetrics();
  updateNotice(dt);

  // --- 렌더 ---
  draw();        // 게임 화면
  drawGraph();   // 왼쪽 아래 막대 차트
  syncPanel();   // 우측 패널

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
