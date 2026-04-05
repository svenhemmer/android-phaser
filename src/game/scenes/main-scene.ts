import Phaser from 'phaser';
import { createJoystick } from '../controls/joystick';

export const createMainScene = (): Phaser.Types.Scenes.SceneType => {
  let joystick: { getDirection: () => { x: number; y: number}};
  let player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;


  return {
    key: 'MainScene',

    create() {
        player = this.physics.add.sprite(400, 300, '');
        joystick = createJoystick();
    },

    update() {
        const speed = 200;

        const direction = joystick.getDirection();
        player.setVelocity(
            direction.x * speed,
            direction.y * speed
        );
        console.log(direction)
    }
  }
}