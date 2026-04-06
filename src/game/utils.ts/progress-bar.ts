import type { ProgressBar } from "../../models/progress-bar";

export const createProgressBar = (scene: Phaser.Scene, style?: { boxColor: number, barColor: number, boxAlpha: number }): ProgressBar => {
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.width;

    const boxColor = style?.boxColor || 0xaaaaaa;
    const boxAlpha = style?.boxAlpha || 0.8;
    const barColor = style?.barColor || 0xffffff;

    const progressBox = scene.add.graphics();
    const progressBar = scene.add.graphics();

    progressBox.fillStyle(boxColor, boxAlpha)
    progressBox.fillRect(width / 4 - 5, height / 2 - 25 - 5, width / 2 + 10, 60);

    return {
        update: (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(barColor, 1);
            progressBar.fillRect(width / 4, height / 2 - 25, (width / 2) * value, 50);
        },

        destroy: () => {
            progressBar.destroy();
            progressBox.destroy();
        }

    }
}