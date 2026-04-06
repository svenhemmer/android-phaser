import Phaser from 'phaser';
import { createProgressBar } from '../utils.ts/progress-bar';
import type { ProgressBar } from '../../models/progress-bar';
import { buildScene } from './scene-builder';
import { updateAudio, updateControls } from '../store/game-config';

export const createBootScene = (): Phaser.Types.Scenes.SceneType => {
  let player: Phaser.GameObjects.Sprite | undefined;
  let progressBar: ProgressBar | undefined;

  const shutdown = (scene: Phaser.Scene) => {
    scene.textures.remove('dwarf');
    scene.cache.json.remove('contents');
    progressBar?.destroy();
  };

  const switchScene = (scene: Phaser.Scene, start: string) => {
    scene.cameras.main.fadeOut(500, 0, 0, 0);
    scene.cameras.main.once('camerafadeoutcomplete', () => {
        scene.scene.add(start, buildScene(start));
        scene.scene.start(start);
    });
  }

  return {
    key: 'boot-screen',

    preload() {
        this.load.json('contents', 'assets/contents/init.json');
        this.load.spritesheet('dwarf', 'assets/graphics/sprites/dwarf_sprite.png', {
            frameWidth: 32, frameHeight: 32
        });
        this.load.on('complete', () => { 
            const contents = this.cache.json.get('contents');
            updateControls(contents.controls);
            updateAudio(contents.audio);
            switchScene(this, contents.start);
         });

        progressBar = createProgressBar(this);
        this.load.on('progress', (value: number) => { progressBar?.update(value) });
        this.events.on('shutdown', () => shutdown(this), this);
    },

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.anims.create({
            key: 'waiting',
            frames: this.anims.generateFrameNumbers('dwarf', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
        });
        player = this.add.sprite(width/2 - 16, height/2 - 16 - 120, 'dwarf');
        player.setScale(4)
        player.play('waiting')
    },
  }
}