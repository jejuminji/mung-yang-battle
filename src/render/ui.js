"use strict";
/* =========================================================================
 * ui.js — 우측 AI 디버그 패널 DOM 동기화
 * =======================================================================*/

function setBar(k, v) {
  document.getElementById("bar-" + k).style.width = (clamp(v, 0, 1) * 100) + "%";
  document.getElementById("val-" + k).textContent = v.toFixed(2);
}

function syncPanel() {
  const s = monster.scores;
  setBar("chase", s.chase); setBar("attack", s.attack); setBar("retreat", s.retreat);

  ["chase", "attack", "retreat"].forEach((k) =>
    document.getElementById("row-" + k).classList.toggle("on", !monster.dead && monster.state === k));

  const badge = document.getElementById("state");
  if (monster.dead) { badge.textContent = "RESPAWNING"; badge.style.background = "#b58aa3"; }
  else { badge.textContent = monster.state.toUpperCase(); badge.style.background = STATE_COLOR[monster.state]; }

  document.getElementById("reason").textContent = monster.dead ? "몬스터 처치됨 — 잠시 후 부활합니다" : monster.reason;
  document.getElementById("php").textContent  = Math.max(0, Math.round(player.hp));
  document.getElementById("mhp").textContent  = Math.max(0, Math.round(monster.hp));
  document.getElementById("dist").textContent = Math.round(monster.dist);
  document.getElementById("kd").textContent   = kills + " / " + deaths;
}
