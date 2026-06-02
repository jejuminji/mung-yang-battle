"use strict";
/* =========================================================================
 * render.js — 캔버스 렌더링 (게임 화면 + 왼쪽 아래 수평 막대 차트)
 * =======================================================================*/

function drawGrid() {
  ctx.strokeStyle = "rgba(199,77,140,0.12)"; ctx.lineWidth = 1;
  for (let x = ARENA.x; x <= ARENA.x + ARENA.w; x += 40) { ctx.beginPath(); ctx.moveTo(x, ARENA.y); ctx.lineTo(x, ARENA.y + ARENA.h); ctx.stroke(); }
  for (let y = ARENA.y; y <= ARENA.y + ARENA.h; y += 40) { ctx.beginPath(); ctx.moveTo(ARENA.x, y); ctx.lineTo(ARENA.x + ARENA.w, y); ctx.stroke(); }
}

function drawShadow(x, y, rx) {
  ctx.save(); ctx.fillStyle = "rgba(150,40,90,0.16)";
  ctx.beginPath(); ctx.ellipse(x, y, rx, rx * 0.38, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

// 캐릭터 = 그림자 + (공격링) + 스프라이트(없으면 폴백 원) + HP바
function drawCharacter(ent, img, targetH, faceX, fallback) {
  drawShadow(ent.x, ent.y + targetH * 0.40, ent.r * 1.5);

  if (ent.swing > 0) {
    const t = ent.swing / SWING_TIME;
    ctx.beginPath(); ctx.arc(ent.x, ent.y, ent.range * (1 - 0.25 * t), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${0.7 * t})`; ctx.lineWidth = 4; ctx.stroke();
    ctx.beginPath(); ctx.arc(ent.x, ent.y, ent.range * (1 - 0.25 * t), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,90,150,${0.5 * t})`; ctx.lineWidth = 2; ctx.stroke();
  }

  if (!drawSprite(img, ent.x, ent.y, targetH, faceX < 0)) {
    ctx.beginPath(); ctx.arc(ent.x, ent.y, ent.r, 0, Math.PI * 2);
    ctx.fillStyle = fallback; ctx.fill();
  }

  // HP 바 (픽셀풍: 어두운 테두리 + 밝은 채움)
  const bw = Math.max(ent.r * 2.6, 46), bh = 7, bx = ent.x - bw / 2, by = ent.y - targetH * 0.5 - 12;
  ctx.fillStyle = "#5a2a40"; ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
  ctx.fillStyle = "#ffd9ec"; ctx.fillRect(bx, by, bw, bh);
  const p = clamp(ent.hp / ent.maxHp, 0, 1);
  ctx.fillStyle = p > 0.5 ? "#36d39a" : p > 0.25 ? "#ffb02e" : "#ff4d8d";
  ctx.fillRect(bx, by, bw * p, bh);
}

// 상태/상황 → 스프라이트 선택
function playerSprite() {
  if (player.hp <= 0)   return SPR.pup_lose;
  if (player.hurt > 0)  return SPR.pup_hurt;
  if (player.swing > 0) return SPR.pup_attack;
  return SPR.pup_happy;
}
function monsterSprite() {
  if (monster.dead)     return SPR.cat_lose;
  if (monster.hurt > 0) return SPR.cat_hurt;
  if (monster.state === "attack")  return SPR.cat_attack;
  if (monster.state === "retreat") return SPR.cat_retreat;
  return SPR.cat_chase;
}

function draw() {
  ctx.fillStyle = "#ffd9ec"; ctx.fillRect(0, 0, W, H);
  drawGrid();
  ctx.strokeStyle = "#ff7ab8"; ctx.lineWidth = 4; ctx.strokeRect(2, 2, W - 4, H - 4);

  if (!monster.dead) {
    // 타깃 라인(상태 색)
    ctx.beginPath(); ctx.moveTo(monster.x, monster.y); ctx.lineTo(player.x, player.y);
    ctx.strokeStyle = `rgba(${STATE_RGBA[monster.state]},0.30)`; ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]); ctx.stroke(); ctx.setLineDash([]);
    // 몬스터 사거리
    ctx.beginPath(); ctx.arc(monster.x, monster.y, MON_RANGE, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,61,110,0.16)"; ctx.lineWidth = 1; ctx.stroke();
  }
  // 플레이어 사거리
  ctx.beginPath(); ctx.arc(player.x, player.y, PLAYER_RANGE, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(8,168,107,0.16)"; ctx.lineWidth = 1; ctx.stroke();

  // 플레이어(강아지)
  drawCharacter(player, playerSprite(), PLAYER_H, player.faceX, "#39d98a");
  // 몬스터(고양이) — 플레이어를 바라보도록 좌우 반전
  const mFace = player.x < monster.x ? -1 : 1;
  if (monster.dead) ctx.globalAlpha = 0.85;
  drawCharacter(monster, monsterSprite(), MON_H, mFace, MONSTER_COLOR);
  ctx.globalAlpha = 1;
}

/* ---------- 왼쪽 아래: 수평 막대 차트 (시계열 바인딩) ----------
 * 각 시리즈를 가로 막대 1개로 표시.
 *  - 진한 막대 = 현재값
 *  - 옅은 띠   = 최근 구간(hist)의 min~max (시계열 변동폭)
 *  - 세로 눈금 = 최근 최댓값 위치
 */
function drawGraph() {
  const g = gctx, gw = graph.width, gh = graph.height;
  g.fillStyle = "#fff0f7"; g.fillRect(0, 0, gw, gh);

  g.font = "11px ui-monospace, monospace"; g.fillStyle = "#cf5b95";
  g.textAlign = "left"; g.textBaseline = "alphabetic";
  g.fillText("실시간 측정 · 수평 막대(barchart) · 옅은 띠 = 최근 min~max (시계열)", 12, 15);

  const top = 26, bottom = 10;
  const rowH = (gh - top - bottom) / SERIES.length;
  const labelW = 92, valW = 64;
  const barX = 12 + labelW, barW = gw - barX - valW - 12;
  const barH = Math.min(16, rowH * 0.52);

  g.textBaseline = "middle";
  for (let i = 0; i < SERIES.length; i++) {
    const s = SERIES[i];
    const cy = top + i * rowH + rowH / 2;
    const barY = cy - barH / 2;

    // 라벨
    g.font = "12px ui-monospace, monospace"; g.textAlign = "left"; g.fillStyle = "#9c2f63";
    g.fillText(s.label, 12, cy);

    // 트랙
    g.fillStyle = "#ffe0ef"; g.fillRect(barX, barY, barW, barH);

    // 시계열 min~max 밴드 + 최댓값 눈금
    const h = s.hist; let cur = 0;
    if (h.length) {
      let mn = 1, mx = 0;
      for (const v of h) { if (v < mn) mn = v; if (v > mx) mx = v; }
      cur = h[h.length - 1];
      g.fillStyle = s.color + "33";
      g.fillRect(barX + barW * mn, barY, barW * (mx - mn), barH);
      const mxX = barX + barW * mx;
      g.strokeStyle = s.color + "99"; g.lineWidth = 1;
      g.beginPath(); g.moveTo(mxX, barY - 2); g.lineTo(mxX, barY + barH + 2); g.stroke();
    }

    // 현재값 막대 + 테두리
    g.fillStyle = s.color; g.fillRect(barX, barY, barW * cur, barH);
    g.strokeStyle = "#d98ab5"; g.lineWidth = 1; g.strokeRect(barX + 0.5, barY + 0.5, barW - 1, barH - 1);

    // 현재값 텍스트
    g.textAlign = "right"; g.fillStyle = s.color;
    g.fillText(String(s.fmt(s.val())), gw - 12, cy);
  }
  g.textAlign = "left"; g.textBaseline = "alphabetic"; // 상태 복원
}
