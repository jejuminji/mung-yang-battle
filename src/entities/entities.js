"use strict";
/* =========================================================================
 * entities.js — 플레이어 / 몬스터 상태 + 전역 게임 상태 + 리셋
 * =======================================================================*/

const player = {
  x: W * 0.30, y: H * 0.5, r: 18, hp: 100, maxHp: 100,
  atkCd: 0, swing: 0, range: PLAYER_RANGE,
  faceX: 1,   // 바라보는 방향(+오른쪽/-왼쪽)
  hurt: 0,    // 피격 연출 타이머
};

const monster = {
  x: W * 0.70, y: H * 0.5, r: 20, hp: 100, maxHp: 100,
  atkCd: 0, swing: 0, range: MON_RANGE,
  // AI 상태(패널/공지에 사용)
  state: "chase", reason: "", dist: 0, hp01: 1,
  scores: { chase: 0, attack: 0, retreat: 0 },
  // 사망/부활
  dead: false, respawn: 0,
  // 공지용 타이머
  hurt: 0, dealt: 0, justResp: 0,
};

// 전역 게임 상태 (다른 파일에서 읽고/갱신)
let kills = 0, deaths = 0;
let gameTime = 0;       // 경과 시간(초)
let lastCombatT = 0;    // 마지막으로 피해가 오간 시각

// 플레이어 반대쪽 모서리에서 풀피 부활
function resetMonster() {
  monster.dead = false; monster.hp = monster.maxHp;
  monster.atkCd = 0; monster.swing = 0; monster.hurt = 0; monster.dealt = 0;
  monster.justResp = 1.3; monster.state = "chase";
  monster.x = player.x < W / 2 ? ARENA.x + ARENA.w - 40 : ARENA.x + 40;
  monster.y = player.y < H / 2 ? ARENA.y + ARENA.h - 40 : ARENA.y + 40;
}

function resetPlayer() {
  player.hp = player.maxHp; player.atkCd = 0; player.swing = 0; player.hurt = 0;
  player.x = W * 0.30; player.y = H * 0.5;
}
