const STAGE_THEMES = {
  day: {
    sky: 0x72c7f2,
    ground: 0x55a630,
    road: 0x5b6472,
    accent: 0xffffff,
  },
  evening: {
    sky: 0xf08a5d,
    ground: 0x567d46,
    road: 0x55505f,
    accent: 0xffd166,
  },
  night: {
    sky: 0x172554,
    ground: 0x24452d,
    road: 0x343b4f,
    accent: 0xf8fafc,
  },
  space: {
    sky: 0x090b24,
    ground: 0x292748,
    road: 0x3a3859,
    accent: 0xc4b5fd,
  },
};

function getStageGrade(stageNumber) {
  if (stageNumber <= 5) {
    return stageNumber % 2 === 1 ? 1 : 2;
  }
  if (stageNumber <= 10) {
    return stageNumber % 2 === 0 ? 3 : 4;
  }
  if (stageNumber <= 15) {
    return stageNumber % 2 === 1 ? 5 : 6;
  }
  return Phaser.Math.Between(1, 6);
}

function getStageTheme(stageNumber) {
  if (stageNumber <= 5) return "day";
  if (stageNumber <= 10) return "evening";
  if (stageNumber <= 15) return "night";
  return "space";
}

function getStageConfig(stageNumber) {
  const stage = Math.max(1, Math.floor(Number(stageNumber) || 1));
  const endlessLevel = Math.max(0, stage - 15);

  return {
    stage,
    gradeLevel: getStageGrade(stage),
    scrollSpeed: Math.min(440, 190 + (stage - 1) * 12),
    obstacleInterval: Math.max(600, 1000 - (stage - 1) * 20),
    targetDistance: Math.min(4200, 1900 + (stage - 1) * 90 + endlessLevel * 25),
    bgTheme: getStageTheme(stage),
  };
}

window.STAGE_THEMES = STAGE_THEMES;
window.getStageConfig = getStageConfig;
