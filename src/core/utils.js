"use strict";
/* =========================================================================
 * utils.js — 공용 수학/물리 헬퍼
 * =======================================================================*/

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp  = (a, b, t) => a + (b - a) * t;

// 객체를 아레나 경계 안으로 가두기 (반지름 r 고려)
function clampArena(o) {
  o.x = clamp(o.x, ARENA.x + o.r, ARENA.x + ARENA.w - o.r);
  o.y = clamp(o.y, ARENA.y + o.r, ARENA.y + ARENA.h - o.r);
}

// from 의 반대 방향으로 target 을 amt 만큼 밀어내기(넉백)
function knock(target, from, amt) {
  const dx = target.x - from.x, dy = target.y - from.y, d = Math.hypot(dx, dy) || 1;
  target.x += (dx / d) * amt;
  target.y += (dy / d) * amt;
  clampArena(target);
}
