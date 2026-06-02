"use strict";
/* =========================================================================
 * update.js — 매 프레임 갱신: 플레이어 이동/공격, 몬스터 ACT, 전투, 사망
 * =======================================================================*/

/* ---------- 플레이어 ---------- */
function updatePlayer(dt) {
  player.atkCd = Math.max(0, player.atkCd - dt);
  player.swing = Math.max(0, player.swing - dt);
  player.hurt  = Math.max(0, player.hurt - dt);

  let vx = 0, vy = 0;
  if (keys["w"]) vy -= 1;
  if (keys["s"]) vy += 1;
  if (keys["a"]) vx -= 1;
  if (keys["d"]) vx += 1;
  if (vx || vy) {
    const len = Math.hypot(vx, vy); vx /= len; vy /= len;
    if (vx !== 0) player.faceX = vx > 0 ? 1 : -1;
    player.x += vx * PLAYER_SPEED * dt;
    player.y += vy * PLAYER_SPEED * dt;
    clampArena(player);
  }
  if (keys[" "] && player.atkCd <= 0) playerAttack();
}

function playerAttack() {
  player.atkCd = PLAYER_CD; player.swing = SWING_TIME;
  const d = Math.hypot(monster.x - player.x, monster.y - player.y);
  if (!monster.dead && d <= PLAYER_RANGE + monster.r) {
    monster.hp -= PLAYER_DMG; knock(monster, player, KNOCKBACK);
    pushDmg(dealtEvents, PLAYER_DMG);
    monster.hurt = 0.5;        // 피격 연출 + 공지 트리거
    lastCombatT = gameTime;
  }
}

/* ---------- 몬스터 (THINK + ACT) ---------- */
function updateMonster(dt) {
  monster.atkCd    = Math.max(0, monster.atkCd - dt);
  monster.swing    = Math.max(0, monster.swing - dt);
  monster.hurt     = Math.max(0, monster.hurt - dt);
  monster.dealt    = Math.max(0, monster.dealt - dt);
  monster.justResp = Math.max(0, monster.justResp - dt);

  // 사망 → 부활 카운트다운
  if (!monster.dead && monster.hp <= 0) {
    monster.dead = true; monster.respawn = RESPAWN_TIME;
    monster.scores = { chase: 0, attack: 0, retreat: 0 }; kills++;
  }
  if (monster.dead) {
    monster.respawn -= dt;
    if (monster.respawn <= 0) resetMonster();
    return;
  }

  think();   // ai.js: 점수 계산 + 상태 결정

  // ACT: 결정된 상태대로 이동/공격
  const dx = player.x - monster.x, dy = player.y - monster.y;
  const dist = Math.hypot(dx, dy);
  const ux = dx / (dist || 1), uy = dy / (dist || 1);
  if (monster.state === "chase") {
    monster.x += ux * CHASE_SPEED * dt; monster.y += uy * CHASE_SPEED * dt;
  } else if (monster.state === "retreat") {
    monster.x -= ux * RETREAT_SPEED * dt; monster.y -= uy * RETREAT_SPEED * dt;
  } else { // attack
    if (dist > MON_RANGE * 0.85) { monster.x += ux * APPROACH_SPEED * dt; monster.y += uy * APPROACH_SPEED * dt; }
    if (dist <= MON_RANGE + player.r && monster.atkCd <= 0) monsterAttack();
  }
  clampArena(monster);
}

function monsterAttack() {
  monster.atkCd = MON_CD; monster.swing = SWING_TIME;
  player.hp -= MON_DMG; knock(player, monster, KNOCKBACK);
  pushDmg(takenEvents, MON_DMG);
  monster.dealt = 0.6; player.hurt = 0.45;   // 딜 성공 / 플레이어 피격 연출
  lastCombatT = gameTime;
}

function checkPlayerDeath() { if (player.hp <= 0) { deaths++; resetPlayer(); } }
