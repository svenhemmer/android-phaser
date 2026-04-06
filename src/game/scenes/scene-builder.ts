import { createProgressBar } from "../utils.ts/progress-bar";
import type { ProgressBar } from "../../models/progress-bar";

export const buildScene = (key: string): Phaser.Types.Scenes.SceneType => {
    let progressBar: ProgressBar | undefined;

    const shutdown = (scene: Phaser.Scene) => {
        scene.cache.json.remove('scene-contents');
    };

    return {
        key,

        preload() {
            this.load.json('scene-contents', 'assets/contents/scenes/' + key + '.json');
            progressBar = createProgressBar(this);
            this.load.on('progress', (value: number) => { progressBar?.update(value) });
            this.load.on('complete', () => { console.log( this.cache.json.get('scene-contents')) })
            this.events.on('shutdown', () => shutdown(this), this);
        },

        create() {
        }
    }
}