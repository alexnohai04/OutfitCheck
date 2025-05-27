// components/CustomTabBackground.js
import React from "react";
import Svg, { Path } from "react-native-svg";
import { View } from "react-native";

const CustomTabBackground = ({ color = "#2C2C2E" }) => {
    return (
        <View style={{ position: "absolute", bottom: 0 }}>
            <Svg
                width={400}
                height={90}
                viewBox="0 0 400 90"
                style={{ alignSelf: "center" }}
            >
                <Path
                    d="
            M0,0
            H150
            C170,0 180,40 200,40
            C220,40 230,0 250,0
            H400
            V90
            H0
            Z"
                    fill={color}
                />
            </Svg>
        </View>
    );
};

export default CustomTabBackground;
