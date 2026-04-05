import nipplejs from 'nipplejs';

export const createJoystick = () => {

    const direction = { x: 0, y: 0 };

    const manager = nipplejs.create({
        zone: document.body,
        mode: 'static',
        position: { left: '80px', bottom: '80px' },
        color: 'white'
    });
    manager.on('end', () => {
        direction.x = 0;
        direction.y = 0;
    });
    manager.on('move', ({ data }) => {
        direction.x = data.vector.x;
        direction.y = data.vector.y;
    });

    return {
        getDirection: () => { return { ...direction } }
    }
}