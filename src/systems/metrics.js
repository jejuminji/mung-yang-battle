"use strict";
/* =========================================================================
 * metrics.js — 실시간 측정값 (DPS) + 수평 막대 차트용 시계열 시리즈
 * =======================================================================*/

let playerDps = 0, monsterDps = 0;   // 현재 초당 피해(롤링)
const dealtEvents = [];              // 플레이어가 "가한" 피해 이벤트 {t, amt}
const takenEvents = [];              // 플레이어가 "받은" 피해 이벤트 {t, amt}

// 막대 차트 5개 시리즈: 각자 자기 max로 0~1 정규화, hist에 시계열 보관
const SERIES = [
  { label: "거리",       color: "#7c4dff", max: DIST_MAX, val: () => monster.dist, fmt: (v) => Math.round(v),               hist: [] },
  { label: "딜량/s",     color: "#08a86b", max: DPS_MAX,  val: () => playerDps,    fmt: (v) => v.toFixed(1),                hist: [] },
  { label: "피해량/s",   color: "#ff2d6f", max: DPS_MAX,  val: () => monsterDps,   fmt: (v) => v.toFixed(1),                hist: [] },
  { label: "몬스터HP",   color: "#ff7a1a", max: 100,      val: () => monster.hp,   fmt: (v) => Math.max(0, Math.round(v)),  hist: [] },
  { label: "플레이어HP", color: "#1e7bff", max: 100,      val: () => player.hp,    fmt: (v) => Math.max(0, Math.round(v)),  hist: [] },
];

// 피해 이벤트 기록
function pushDmg(arr, amt) { arr.push({ t: gameTime, amt }); }

// 최근 DPS_WINDOW초 동안의 피해 합 → 초당 피해
function rollDps(arr) {
  while (arr.length && gameTime - arr[0].t > DPS_WINDOW) arr.shift();
  let s = 0; for (const e of arr) s += e.amt;
  return s / DPS_WINDOW;
}

// 매 프레임 각 시리즈 현재값을 0~1로 정규화해 hist에 저장(시계열)
function sampleMetrics() {
  for (const s of SERIES) {
    s.hist.push(clamp(s.val() / s.max, 0, 1));
    if (s.hist.length > HISTORY) s.hist.shift();
  }
}
