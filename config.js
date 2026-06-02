"use strict";
/* =========================================================================
 * config.js — 캔버스 참조 / 상수(튜닝값) / 색 / 스프라이트 매핑
 *   가장 먼저 로드된다. 다른 파일들은 여기 선언된 전역을 그대로 사용.
 * =======================================================================*/

// ===== 캔버스 참조 ===== (스크립트가 body 끝에서 로드되므로 DOM 존재 보장)
const cv    = document.getElementById("game");
const ctx   = cv.getContext("2d");
const graph = document.getElementById("graph");
const gctx  = graph.getContext("2d");
const W = cv.width, H = cv.height;

// ===== 아레나 =====
const PAD = 16;
const ARENA = { x: PAD, y: PAD, w: W - PAD * 2, h: H - PAD * 2 };

// ===== Utility AI 튜닝 =====
const PERCEPTION = 820;   // 거리 정규화 기준(≈아레나 대각선)
const ENGAGE     = 150;   // 이 거리 안이면 attack 점수 급상승
const LOW_HP     = 0.40;  // 이 비율 미만이면 retreat 욕구 발생
const BIAS       = 0.06;  // 현재 상태 유지 보너스(히스테리시스)

// ===== 이동 속도(px/s) =====
const PLAYER_SPEED = 225, CHASE_SPEED = 165, APPROACH_SPEED = 140, RETREAT_SPEED = 195;

// ===== 전투 =====
const PLAYER_RANGE = 72, PLAYER_DMG = 14, PLAYER_CD = 0.42;
const MON_RANGE    = 58, MON_DMG    = 9,  MON_CD     = 0.85;
const SWING_TIME   = 0.18, KNOCKBACK = 26, RESPAWN_TIME = 1.4;

// ===== 캐릭터 그리기 크기(px) =====
const PLAYER_H = 74, MON_H = 84;

// ===== 색 =====
const STATE_COLOR   = { chase: "#ff9a3d", attack: "#ff3d6e", retreat: "#4d9bff" };
const STATE_RGBA    = { chase: "255,154,61", attack: "255,61,110", retreat: "77,155,255" };
const MONSTER_COLOR = "#d24b6a";   // 스프라이트 로딩 전 폴백 색

// ===== 그래프(수평 막대 차트) =====
const DIST_MAX   = Math.hypot(ARENA.w, ARENA.h); // 거리 정규화 기준
const DPS_MAX    = 35;     // 초당 피해 정규화 기준
const DPS_WINDOW = 1.0;    // 최근 1초 합으로 DPS 계산
const HISTORY    = 300;    // 시계열 표본 보관 개수(≈5초)

// ===== 스프라이트 파일 (assets 폴더 감정 태그 → 게임 상태 매핑) =====
const SPRITE_FILES = {
  // 플레이어 = 강아지(puppy)
  pup_happy:  "assets/puppy_happy.png",       // 이동/평상시
  pup_attack: "assets/puppy_stretching.png",  // 공격(돌진)
  pup_hurt:   "assets/puppy_surprise.png",    // 피격(깜짝)
  pup_lose:   "assets/puppy_lose.png",        // 패배
  // 몬스터 = 고양이(cat)
  cat_chase:   "assets/cat_surprise.png",     // 추격(타깃 포착)
  cat_attack:  "assets/cat_stratch.png",      // 공격(할퀴기)
  cat_retreat: "assets/cat-hurt.png",         // 후퇴(겁먹음)
  cat_hurt:    "assets/cat-hurt.png",         // 피격
  cat_lose:    "assets/cat_lose.png",         // 처치됨
};
