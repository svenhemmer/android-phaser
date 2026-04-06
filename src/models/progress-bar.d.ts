export type ProgressBar = {
    update: (value: number) => void;
    destroy: () => void;
}