import '../style.css'
import Phaser from 'phaser';
import { createMainScene } from './scenes/main-scene';

export class Game extends Phaser.Game {
  constructor() {
    super({
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'app',
      backgroundColor: '#000',
      physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [ createMainScene() ]
    });
  }
}

new Game();