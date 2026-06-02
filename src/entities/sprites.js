"use strict";
/* =========================================================================
 * sprites.js — 스프라이트(감정 이미지) 로딩 & 그리기
 * =======================================================================*/

// config.js 의 SPRITE_FILES 를 기반으로 Image 객체 미리 로드
const SPR = {};
for (const k in SPRITE_FILES) { const im = new Image(); im.src = SPRITE_FILES[k]; SPR[k] = im; }

// 이미지를 (cx,cy) 중심에 targetH 높이로(비율 유지) 그린다. flip=true 면 좌우 반전.
// 아직 로딩 전이면 false 반환 → 호출부에서 폴백 처리.
function drawSprite(img, cx, cy, targetH, flip) {
  if (!img || !img.complete || !img.naturalWidth) return false;
  const scale = targetH / img.naturalHeight, w = img.naturalWidth * scale;
  ctx.save();
  ctx.imageSmoothingEnabled = false;   // 도트 느낌 유지(보간 끔)
  ctx.translate(cx, cy);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, -w / 2, -targetH / 2, w, targetH);
  ctx.restore();
  return true;
}
