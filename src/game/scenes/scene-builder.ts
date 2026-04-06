import { createProgressBar } from "../utils.ts/progress-bar";
import type { ProgressBar } from "../../models/progress-bar";
import { getConfig } from "../store/game-config";
import { createJoystick } from "../controls/joystick";

type Helper = {
    shutdown: () => void;
    initControls: () => void;
    createAnimations: () => void;
    loadAssetsAfterContentFile: () => void;
    loadEntities: () => void;
    spawnEntities: () => void;
}

export const buildScene = (key: string): Phaser.Types.Scenes.SceneType => {
    let progressBar: ProgressBar | undefined;
    let helper: Helper;
    let entityMap = new Map();
    const loadedAssets: string[] = [];
    let joystick: { getDirection: () => { x: number; y: number}};

    const initHelper = (scene: Phaser.Scene): Helper => {
        return {
            shutdown: () => {
                scene.cache.json.remove('scene-contents');
                for (let asset in loadedAssets) {
                    scene.textures.remove(asset);
                }
            },
            createAnimations: () => {
                const contents = scene.cache.json.get('scene-contents');
                const animationKeys = Object.keys(contents.animations);
                for (let animationKey of animationKeys) {
                    for (let animation of contents.animations[animationKey]) {
                        scene.anims.create({
                            key: animationKey + '-' + animation.key,
                            frames: scene.anims.generateFrameNumbers(animationKey, animation.frames),
                            frameRate: animation.frameRate,
                            repeat: animation.repeat
                        });
                    }
                }
            },
            loadAssetsAfterContentFile: () => {
                scene.load.off('progress');
                scene.load.off('complete', helper.loadAssetsAfterContentFile, scene);
                progressBar = createProgressBar(scene);
                const contents = scene.cache.json.get('scene-contents');
                for (let asset of contents.assets?.sprites) {
                    scene.load.spritesheet(asset.key, 'assets/' + asset.path, asset.config);
                    loadedAssets.push(asset.key);
                }
                scene.load.on('progress', (value: number) => { progressBar?.update(value) });
                scene.load.once('complete', () => { 
                    progressBar?.destroy();
                    progressBar = undefined;
                    helper.createAnimations();
                    helper.loadEntities();
                    helper.spawnEntities();
                });
                scene.load.start();
            },
            loadEntities: () => {
                const contents = scene.cache.json.get('scene-contents');
                for ( let entity of contents.entities ) {
                    entityMap.set(entity.name, entity);
                }
            }, 
            spawnEntities: () => {
                const contents = scene.cache.json.get('scene-contents');
                for ( let spawn of contents.spawns) {
                    const entity = entityMap.get(spawn.entity);
                    const sprite = scene.add.sprite(spawn.position.x, spawn.position.y, entity.name);
                    sprite.setScale(4)
                    sprite.play(entity.name + '-' + spawn.start)
                }
            },
            initControls: () => {
                if (getConfig().controls.touch.joystick) {
                    joystick = createJoystick();
                }
            }
        }
    }

    return {
        key,

        preload() {
            helper = initHelper(this);
            this.load.json('scene-contents', 'assets/contents/scenes/' + key + '.json');
            this.load.once('complete', helper.loadAssetsAfterContentFile);
            this.events.on('shutdown', helper.shutdown, this);
        },

        create() {
            this.cameras.main.fadeIn(500, 0, 0, 0);
            helper.initControls();
        },

        update() {
            if (!!joystick) {
                const direction = joystick.getDirection();
            }
        }
    }
}
