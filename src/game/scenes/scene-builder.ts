import { createProgressBar } from "../utils.ts/progress-bar";
import type { ProgressBar } from "../../models/progress-bar";
import { getConfig } from "../store/game-config";
import { createJoystick } from "../controls/joystick";

type Helper = {
    create: () => void;
    loadAssetsAfterContentFile: () => void;
    playMusic: () => void;
    shutdown: () => void;
    switchScene: (name: string) => void;
}

export const buildScene = (key: string): Phaser.Types.Scenes.SceneType => {
    let entityMap = new Map();
    let helper: Helper;
    let joystick: { getDirection: () => { x: number; y: number}};
    let progressBar: ProgressBar | undefined;

    const loadedAnimations: string[] = [];
    const loadedTextures: string[] = [];
    const loadedTracks: string[] = [];

    const currentTrack: {
        track?: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
        key: string;
    } = {
        track: undefined,
        key: ''
    }

    let scenes = {
        next: '',
        end: ''
    };

    const initHelper = (scene: Phaser.Scene): Helper => {
        const addProgressBar = () => {
            scene.load.off('progress');
            scene.load.off('complete', helper.loadAssetsAfterContentFile, scene);
            progressBar = createProgressBar(scene);
        }

        const cleanupMusic = () => {
            currentTrack.track?.stop();
            currentTrack.track?.destroy();
            currentTrack.track = undefined;
            for (const asset of loadedTracks) {
                scene.sound.removeByKey(asset);
                scene.cache.audio.remove(asset);
            }
        }

        const cleanupAnimations = () => {
            for (let key of loadedAnimations) {
                scene.anims.remove(key);
            }
        }

        const createAnimations = () => {
            const contents = scene.cache.json.get('scene-contents');
            const animationKeys = Object.keys(contents.animations);
            for (let animationKey of animationKeys) {
                for (let animation of contents.animations[animationKey]) {
                    const key = animationKey + '-' + animation.key;
                    scene.anims.create({
                        key,
                        frames: scene.anims.generateFrameNumbers(animationKey, animation.frames),
                        frameRate: animation.frameRate,
                        repeat: animation.repeat
                    });
                    loadedAnimations.push(key);
                }
            }
        }

        const initControls = () => {
            if (getConfig().controls.touch.joystick) {
                joystick = createJoystick();
            }
        }

        const loadMusic = () => {
            const contents = scene.cache.json.get('scene-contents');
            for (let track of contents.assets?.music) {
                scene.load.audio(track.key, 'assets/' + track.path);
                if (track.start) {
                    currentTrack.key = track.key;
                }
                loadedTracks.push(track.key);
            }
        }

        const loadTextures = () => {
            const contents = scene.cache.json.get('scene-contents');
            for (let asset of contents.assets?.sprites) {
                scene.load.spritesheet(asset.key, 'assets/' + asset.path, asset.config);
                loadedTextures.push(asset.key);
            }
        }

        const loadEntities = () => {
            const contents = scene.cache.json.get('scene-contents');
            for ( let entity of contents.entities ) {
                entityMap.set(entity.name, entity);
            }
        }

        const spawnEntities = () => {
            const contents = scene.cache.json.get('scene-contents');
            for ( let spawn of contents.spawns) {
                const entity = entityMap.get(spawn.entity);
                const sprite = scene.add.sprite(spawn.position.x, spawn.position.y, entity.name);
                sprite.setScale(4)
                sprite.play(entity.name + '-' + spawn.start)
            }
        }

        const finishAfterLoading = () => {
            progressBar?.destroy();
            progressBar = undefined;
            createAnimations();
            loadEntities();
            spawnEntities();
            helper.playMusic();
        }

        return {
            create: () => {
                initControls();
            },
            shutdown: () => {
                scene.cache.json.remove('scene-contents');
                for (const asset of loadedTextures) {
                    scene.textures.remove(asset);
                }
                cleanupAnimations();
                cleanupMusic();
                scene.scene.remove(key);
            },
            loadAssetsAfterContentFile: () => {
                addProgressBar();
                loadTextures();
                loadMusic();
                scene.load.on('progress', (value: number) => { progressBar?.update(value) });
                scene.load.once('complete', finishAfterLoading);
                scene.load.start();
                scenes = { ...scene.cache.json.get('scene-contents').scenes };
            },
            playMusic: () => {
                if (!currentTrack.track) {
                    currentTrack.track = scene.sound.add(currentTrack.key, { loop: true, volume: getConfig().audio.music.volume });
                }
                currentTrack.track.play();
            },
            switchScene: (name: string) => {
                scene.cameras.main.fadeOut(500, 0, 0, 0);
                scene.cameras.main.once('camerafadeoutcomplete', () => {
                    scene.scene.add(name, buildScene(name));
                    scene.scene.start(name);
                });
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
            helper.create();
            setTimeout(() => {
                helper.switchScene(scenes.next);
            }, 10000);
        },

        update() {
            if (!!joystick) {
                const direction = joystick.getDirection();
                console.log(direction)
            }
        }
    }
}
