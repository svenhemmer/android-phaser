const mainConfig = {
    controls: {
        keyboard: false,
        mouse: {
            move: false,
            drag: false,
            zoom: false
        },
        touch: {
            joystick: false
        }
    },
    audio: {
        music: {
            volume: 0
        },
        sfx: {
            volume: 0
        }
    }
}

export const getConfig = () => {
    return { ...mainConfig };
}

export const updateControls = (controls: object) => {
    mainConfig.controls = { ...mainConfig.controls, ...controls}
}

export const updateAudio = (audio: object) => {
    mainConfig.audio = { ...mainConfig.audio, ...audio}
}