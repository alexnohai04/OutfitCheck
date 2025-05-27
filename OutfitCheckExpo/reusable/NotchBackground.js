import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get("window");
const height = 70;
const radius = 40;

const NotchBackground = () => {
    const notchWidth = 140;      // lățimea „găurii”
    const notchDepth = 30;       // adâncimea „găurii”
    // rotunjim la întreg ca să evităm fracțiunile de pixel
    const halfWidth   = Math.round(width  / 2);
    const notchStart  = Math.round((width - notchWidth) / 2);
    const notchEnd    = notchStart + notchWidth;
    const controlOff  = notchWidth * 0.25;

    return (
        <Svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            style={styles.svg}
        >
            <Path
                d={`
          M${radius},0
          H${notchStart}
          C${notchStart + controlOff},0 ${notchStart + controlOff},${notchDepth} ${halfWidth},${notchDepth}
          C${notchEnd   - controlOff},${notchDepth} ${notchEnd   - controlOff},0 ${notchEnd},0
          H${width - radius}
          A${radius},${radius} 0 0 1 ${width},${radius}
          V${height - radius}
          A${radius},${radius} 0 0 1 ${width - radius},${height}
          H${radius}
          A${radius},${radius} 0 0 1 0,${height - radius}
          V${radius}
          A${radius},${radius} 0 0 1 ${radius},0
          Z
        `}
                fill="rgba(30, 30, 30, 0.95)"

            />
        </Svg>
    );
};

const styles = StyleSheet.create({
    svg: {
        alignSelf: "stretch"
    }
});

export default NotchBackground;
