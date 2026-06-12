const gameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 800,
  height: 400,
  backgroundColor: "#172554",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 400,
  },
  render: {
    antialias: true,
    pixelArt: false,
  },
  scene: [
    window.BootScene,
    window.MenuScene,
    window.GameScene,
    window.ScoreScene,
  ],
};

window.wordCarGame = new Phaser.Game(gameConfig);
