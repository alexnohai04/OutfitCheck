package org.example.outfitcheck.service;

import org.example.outfitcheck.dto.ColorInfo;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ColorMapperService {

    private static final Map<String, String> STANDARD_COLORS = Map.ofEntries(
            Map.entry("Black", "#000000"),
            Map.entry("White", "#FFFFFF"),
            Map.entry("Red", "#FF0000"),
            Map.entry("Yellow", "#FFFF00"),
            Map.entry("Blue", "#0000FF"),
            Map.entry("Green", "#008000"),
            Map.entry("Orange", "#FFA500"),
            Map.entry("Pink", "#FFC0CB"),
            Map.entry("Brown", "#A52A2A"),
            Map.entry("Gray", "#808080"),
            Map.entry("Purple", "#800080"),
            Map.entry("Beige", "#F5F5DC")
    );

    private static final Set<String> PRIORITY_COLORS = Set.of("Black", "White", "Red", "Yellow", "Blue");

    public String mapHexToNearestColorName(String hex) {
        int[] targetRGB = hexToRGB(hex);
        String nearestColor = hex;
        double minDistance = Double.MAX_VALUE;

        for (Map.Entry<String, String> entry : STANDARD_COLORS.entrySet()) {
            String colorName = entry.getKey();
            int[] rgb = hexToRGB(entry.getValue());
            double distance = colorDistance(targetRGB, rgb);

            // Bias pozitiv: favorizează culorile prioritare dacă sunt aproape
            if (PRIORITY_COLORS.contains(colorName) && distance < 80) {
                return colorName;
            }

            // Bias negativ: penalizează culorile neutre
            if (colorName.equals("Gray") || colorName.equals("Silver")) {
                distance *= 1.2; // penalizare 20%
            }

            if (distance < minDistance) {
                minDistance = distance;
                nearestColor = colorName;
            }
        }

        return nearestColor;
    }


    public String getStandardHex(String colorName) {
        return STANDARD_COLORS.getOrDefault(colorName, "#999999");
    }

    private int[] hexToRGB(String hex) {
        hex = hex.replace("#", "");
        return new int[]{
                Integer.parseInt(hex.substring(0, 2), 16),
                Integer.parseInt(hex.substring(2, 4), 16),
                Integer.parseInt(hex.substring(4, 6), 16)
        };
    }

    private double colorDistance(int[] rgb1, int[] rgb2) {
        return Math.sqrt(
                Math.pow(rgb1[0] - rgb2[0], 2) +
                        Math.pow(rgb1[1] - rgb2[1], 2) +
                        Math.pow(rgb1[2] - rgb2[2], 2)
        );
    }

    public List<ColorInfo> mapAndGroupColors(List<String> hexColors) {
        Map<String, ColorInfo> uniqueColorMap = new LinkedHashMap<>();

        for (String hex : hexColors) {
            String name = mapHexToNearestColorName(hex);
            if (!uniqueColorMap.containsKey(name)) {
                uniqueColorMap.put(name, new ColorInfo(getStandardHex(name), name));
            }
        }

        return uniqueColorMap.values().stream().limit(3).toList();
    }
}
