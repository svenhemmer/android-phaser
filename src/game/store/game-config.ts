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
    }
}

export const getConfig = () => {
    return { ...mainConfig };
}

export const updateControls = (controls: object) => {
    mainConfig.controls = { ...mainConfig.controls, ...controls}
}