"use strict";
/* =========================================================================
 * input.js — 키보드 입력 상태 (WASD 이동 / Space 공격)
 * =======================================================================*/

const keys = {};
addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === " ") e.preventDefault();   // Space 스크롤 방지
});
addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; });
