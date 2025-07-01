import nearestColor from 'nearest-color';
import baseColors from './colorMap';

const getNearestBasicColorName = (hex) => {
    if (!hex) return 'Unknown';

    try {
        const nearest = nearestColor.from(baseColors);
        return nearest(hex).name;
    } catch (e) {
        console.warn(`❌ Failed to map color: ${hex}`);
        return 'Unknown';
    }
};

export default getNearestBasicColorName;
