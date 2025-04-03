package org.example.outfitcheck.service;

import org.example.outfitcheck.dto.ColorInfo;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ColorMapperService {

    private static final Map<String, String> standardColors = new HashMap<>();

    static {
        standardColors.put("Black", "#000000");
        standardColors.put("White", "#FFFFFF");
        standardColors.put("Red", "#FF0000");
        standardColors.put("Lime", "#00FF00");
        standardColors.put("Blue", "#0000FF");
        standardColors.put("Yellow", "#FFFF00");
        standardColors.put("Cyan", "#00FFFF");
        standardColors.put("Magenta", "#FF00FF");
        standardColors.put("Gray", "#808080");
        standardColors.put("Silver", "#C0C0C0");
        standardColors.put("Maroon", "#800000");
        standardColors.put("Olive", "#808000");
        standardColors.put("Green", "#008000");
        standardColors.put("Purple", "#800080");
        standardColors.put("Teal", "#008080");
        standardColors.put("Navy", "#000080");
        standardColors.put("Brown", "#A52A2A");
        standardColors.put("Orange", "#FFA500");
        standardColors.put("Pink", "#FFC0CB");
        standardColors.put("Beige", "#F5F5DC");
    }

    public String mapHexToNearestColorName(String hex) {
        int[] targetRGB = hexToRGB(hex);
        String nearestColor = hex;
        double minDistance = Double.MAX_VALUE;

        for (Map.Entry<String, String> entry : standardColors.entrySet()) {
            int[] rgb = hexToRGB(entry.getValue());
            double distance = colorDistance(targetRGB, rgb);
            if (distance < minDistance) {
                minDistance = distance;
                nearestColor = entry.getKey();
            }
        }

        return nearestColor;
    }

    public String getStandardHex(String colorName) {
        return standardColors.getOrDefault(colorName, "#999999");
    }

    private int[] hexToRGB(String hex) {
        hex = hex.replace("#", "");
        int r = Integer.parseInt(hex.substring(0, 2), 16);
        int g = Integer.parseInt(hex.substring(2, 4), 16);
        int b = Integer.parseInt(hex.substring(4, 6), 16);
        return new int[]{r, g, b};
    }

    private double colorDistance(int[] rgb1, int[] rgb2) {
        return Math.sqrt(
                Math.pow(rgb1[0] - rgb2[0], 2) +
                        Math.pow(rgb1[1] - rgb2[1], 2) +
                        Math.pow(rgb1[2] - rgb2[2], 2)
        );
    }

    public List<ColorInfo> mapAndGroupColors(List<String> hexColors) {
        Map<String, List<ColorInfo>> grouped = new HashMap<>();

        for (String hex : hexColors) {
            String name = mapHexToNearestColorName(hex);
            grouped.computeIfAbsent(name, k -> new ArrayList<>()).add(new ColorInfo(hex, name));
        }

        List<ColorInfo> finalColors = new ArrayList<>();

        for (Map.Entry<String, List<ColorInfo>> entry : grouped.entrySet()) {
            if (entry.getValue().size() >= 2 && !entry.getKey().equals(entry.getValue().get(0).getName())) {
                finalColors.add(new ColorInfo(getStandardHex(entry.getKey()), entry.getKey()));
            } else {
                finalColors.addAll(entry.getValue());
            }
        }

        return finalColors.stream().limit(3).toList();
    }
}
