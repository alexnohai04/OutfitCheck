package org.example.outfitcheck.service;

import org.example.outfitcheck.dto.OutfitSuggestionDTO;
import org.example.outfitcheck.entity.ClothingItem;
import org.example.outfitcheck.repository.ClothingItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OutfitGeneratorService {

    @Autowired
    private ClothingItemRepository clothingItemRepository;

    private static final Map<String, String> COLOR_NAME_TO_HEX = Map.ofEntries(
            Map.entry("Red",       "#FF0000"),
            Map.entry("Dark Red",  "#8B0000"),
            Map.entry("Blue",      "#0000FF"),
            Map.entry("Light Blue","#ADD8E6"),
            Map.entry("Green",     "#00FF00"),
            Map.entry("Dark Green","#006400"),
            Map.entry("Yellow",    "#FFFF00"),
            Map.entry("Orange",    "#FFA500"),
            Map.entry("Purple",    "#800080"),
            Map.entry("Pink",      "#FFC0CB"),
            Map.entry("Brown",     "#A52A2A"),
            Map.entry("Black",     "#000000"),
            Map.entry("White",     "#FFFFFF"),
            Map.entry("Gray",      "#808080"),
            Map.entry("Light Gray", "#D3D3D3"),
            Map.entry("Dark Gray",  "#505050"),
            Map.entry("Beige",     "#F5F5DC")
    );


    public List<OutfitSuggestionDTO> generateOutfits(
            Long userId,
            String context,
            String season,
            boolean includeHeadwear,
            boolean includeOuterwear,
            int topwearLayers,
            boolean preferFullBodywear
    ) {
        List<ClothingItem> items = clothingItemRepository.findByOwnerIdAndInLaundryFalse(userId);
        // Prepare lists based on preference
        List<ClothingItem> tops;
        List<ClothingItem> bottoms;
        List<ClothingItem> footwears;

        if (preferFullBodywear) {
            tops = Collections.emptyList();
            bottoms = Collections.emptyList();
            footwears = filterBySeasonAndUsage(items, "Footwear", season, context);
        } else {
            tops = filterBySeasonAndUsage(items, "Topwear", season, context);
            bottoms = filterBySeasonAndUsage(items, "Bottomwear", season, context);
            footwears = filterBySeasonAndUsage(items, "Footwear", season, context);
        }

        List<ClothingItem> fullbodies = filterBySeasonAndUsage(items, "FullBodywear", season, context);
        List<ClothingItem> outerwears = includeOuterwear
                ? filterBySeasonAndUsage(items, "Outerwear", season, context)
                : Collections.<ClothingItem>singletonList(null);
        List<ClothingItem> headwears = includeHeadwear
                ? filter(items, "Headwear")
                : Collections.<ClothingItem>singletonList(null);

        Collections.shuffle(tops);
        Collections.shuffle(bottoms);
        Collections.shuffle(footwears);
        Collections.shuffle(fullbodies);
        Collections.shuffle(outerwears);
        Collections.shuffle(headwears);

        List<OutfitSuggestionDTO> generated = buildCombinations(
                tops, bottoms, footwears,
                outerwears, headwears, fullbodies,
                includeOuterwear, includeHeadwear,
                preferFullBodywear, topwearLayers
        );

        // Fallback if no strict outfits
        if (generated.isEmpty()) {
            tops = preferFullBodywear ? Collections.emptyList() : filterBySeasonAndUsage(items, "Topwear", season, context);
            bottoms = preferFullBodywear ? Collections.emptyList() : filterBySeasonAndUsage(items, "Bottomwear", season, context);
            footwears = filterBySeasonAndUsage(items, "Footwear", season, context);
            fullbodies = filterBySeasonAndUsage(items, "FullBodywear", season, context);
            outerwears = includeOuterwear ? filterBySeasonAndUsage(items, "Outerwear", season, context) : Collections.<ClothingItem>singletonList(null);
            headwears = includeHeadwear ? filter(items, "Headwear") : Collections.<ClothingItem>singletonList(null);

            Collections.shuffle(tops);
            Collections.shuffle(bottoms);
            Collections.shuffle(footwears);
            Collections.shuffle(fullbodies);
            Collections.shuffle(outerwears);
            Collections.shuffle(headwears);

            generated = buildCombinations(
                    tops, bottoms, footwears,
                    outerwears, headwears, fullbodies,
                    includeOuterwear, includeHeadwear,
                    preferFullBodywear, topwearLayers
            );
        }

        // Score and pick top
        generated.forEach(dto -> dto.setScore(calcScore(dto, context, season)));

        List<OutfitSuggestionDTO> sorted = generated.stream()
                .sorted(Comparator.comparingDouble(OutfitSuggestionDTO::getScore).reversed())
                .collect(Collectors.toList());

        List<OutfitSuggestionDTO> diversified = new ArrayList<>();
        for (OutfitSuggestionDTO candidate : sorted) {
            boolean similarExists = diversified.stream()
                    .anyMatch(existing -> isTooSimilar(existing, candidate));
            if (!similarExists) {
                diversified.add(candidate);
            }
            if (diversified.size() == 5) break;
        }

        return diversified;

    }

//    private List<ClothingItem> filterBySeason(List<ClothingItem> items, String category, String season) {
//        return items.stream()
//                .filter(i -> isCategory(i, category) && i.getBaseColor() != null)
//                .filter(i -> seasonRules(i.getSeason(), season, category))
//                .collect(Collectors.toList());
//    }

    private static final Map<String, Map<String, Integer>> STYLE_COMPATIBILITY_SCORES = Map.of(
            "casual", Map.of(
                    "casual", 100,
                    "smart casual", 40,
                    "sport", 30,
                    "formal", 10,
                    "party", 50
            ),
            "smart casual", Map.of(
                    "smart casual", 100,
                    "casual", 80,
                    "formal", 70,
                    "party", 60,
                    "sport", -50
            ),
            "formal", Map.of(
                    "formal", 100,
                    "smart casual", 60,
                    "casual", 30,
                    "sport", -50,
                    "party", 50
            ),
            "sport", Map.of(
                    "sport", 100,
                    "casual", 30,
                    "formal", -50,
                    "smart casual", 0,
                    "party", -50
            ),
            "party", Map.of(
                    "party", 100,
                    "smart casual", 70,
                    "casual", 60,
                    "formal", 20,
                    "sport", -50
            )
    );

    private List<ClothingItem> filterBySeasonAndUsage(List<ClothingItem> items, String category, String season, String context) {
        return items.stream()
                .filter(i -> isCategory(i, category) && i.getBaseColor() != null)
                .filter(i -> seasonRules(i.getSeason(), season, category))
                .filter(i -> isStyleCompatible(context, i.getUsage()))
                .collect(Collectors.toList());
    }

    private boolean isStyleCompatible(String requested, String itemUsage) {
        if (requested == null || itemUsage == null) return true;
        requested = requested.toLowerCase();
        itemUsage = itemUsage.toLowerCase();

        if (requested.equals("sports")) {
            return !itemUsage.equals("formal");
        }
        if (requested.equals("formal")) {
            return !itemUsage.equals("sports");
        }
        return true; // pentru alte stiluri (casual, streetwear, etc.)
    }

    private List<ClothingItem> filter(List<ClothingItem> items, String category) {
        return items.stream()
                .filter(i -> isCategory(i, category) && i.getBaseColor() != null)
                .collect(Collectors.toList());
    }

    private boolean seasonRules(String itemSeason, String season, String category) {
        if (itemSeason == null) return false;
        switch (season.toLowerCase()) {
            case "winter":
                return !itemSeason.equalsIgnoreCase("Summer");
            case "summer":
                return !itemSeason.equalsIgnoreCase("Winter");
            case "spring":
            case "fall":
                if ("Outerwear".equalsIgnoreCase(category)) {
                    return !itemSeason.equalsIgnoreCase("Winter");
                } else if ("Bottomwear".equalsIgnoreCase(category)) {
                    return !itemSeason.equalsIgnoreCase("Summer");
                }
                return true;
            default:
                return true;
        }
    }

    private List<OutfitSuggestionDTO> buildCombinations(
            List<ClothingItem> tops,
            List<ClothingItem> bottoms,
            List<ClothingItem> footwears,
            List<ClothingItem> outerwears,
            List<ClothingItem> headwears,
            List<ClothingItem> fullbodies,
            boolean includeOuterwear,
            boolean includeHeadwear,
            boolean preferFullBodywear,
            int topwearLayers
    ) {
        List<OutfitSuggestionDTO> combos = new ArrayList<>();
        if (!preferFullBodywear && (bottoms.isEmpty() || footwears.isEmpty())) return combos;
        if (includeOuterwear && outerwears.stream().allMatch(Objects::isNull)) return combos;
        if (includeHeadwear && headwears.stream().allMatch(Objects::isNull)) return combos;

        if (preferFullBodywear && !fullbodies.isEmpty()) {
            for (ClothingItem fb : fullbodies) {
                for (ClothingItem fw : footwears) {
                    for (ClothingItem o : includeOuterwear ? outerwears : Collections.<ClothingItem>singletonList(null)) {
                        for (ClothingItem hw : includeHeadwear ? headwears : Collections.<ClothingItem>singletonList(null)) {
                            combos.add(buildDTO(null, null, null, fw, o, hw, fb));
                        }
                    }
                }
            }
        } else if (topwearLayers == 1) {
            for (ClothingItem t : tops) {
                for (ClothingItem b : bottoms) {
                    for (ClothingItem fw : footwears) {
                        for (ClothingItem o : includeOuterwear ? outerwears : Collections.<ClothingItem>singletonList(null)) {
                            for (ClothingItem hw : includeHeadwear ? headwears : Collections.<ClothingItem>singletonList(null)) {
                                combos.add(buildDTO(t, null, b, fw, o, hw, null));
                            }
                        }
                    }
                }
            }
        } else {
            for (int i = 0; i < tops.size(); i++) {
                for (int j = i + 1; j < tops.size(); j++) {
                    ClothingItem t1 = tops.get(i), t2 = tops.get(j);
                    for (ClothingItem b : bottoms) {
                        for (ClothingItem fw : footwears) {
                            for (ClothingItem o : includeOuterwear ? outerwears : Collections.<ClothingItem>singletonList(null)) {
                                for (ClothingItem hw : includeHeadwear ? headwears : Collections.<ClothingItem>singletonList(null)) {
                                    combos.add(buildDTO(t1, t2, b, fw, o, hw, null));
                                }
                            }
                        }
                    }
                }
            }
        }
        return combos;
    }
    private boolean isTooSimilar(OutfitSuggestionDTO a, OutfitSuggestionDTO b) {
        int diffCount = 0;
        if (!Objects.equals(a.getTop1Id(), b.getTop1Id())) diffCount++;
        if (!Objects.equals(a.getTop2Id(), b.getTop2Id())) diffCount++;
        if (!Objects.equals(a.getBottomId(), b.getBottomId())) diffCount++;
        if (!Objects.equals(a.getFootwearId(), b.getFootwearId())) diffCount++;
        if (!Objects.equals(a.getOuterwearId(), b.getOuterwearId())) diffCount++;
        if (!Objects.equals(a.getHeadwearId(), b.getHeadwearId())) diffCount++;
        if (!Objects.equals(a.getFullBodywearId(), b.getFullBodywearId())) diffCount++;
        return diffCount <= 1; // consideră că sunt prea similare dacă diferă prin cel mult 1 articol
    }


    private OutfitSuggestionDTO buildDTO(
            ClothingItem t1, ClothingItem t2, ClothingItem b,
            ClothingItem fw, ClothingItem o, ClothingItem hw, ClothingItem fb
    ) {
        return new OutfitSuggestionDTO(
                t1 != null ? t1.getId() : null,
                t2 != null ? t2.getId() : null,
                b  != null ? b.getId()  : null,
                fw != null ? fw.getId() : null,
                o  != null ? o.getId()  : null,
                hw != null ? hw.getId() : null,
                fb != null ? fb.getId() : null,
                0.0
        );
    }

    private double calcScore(OutfitSuggestionDTO dto, String context, String season) {
        double score = 100;
        List<Long> ids = Arrays.asList(
                dto.getTop1Id(), dto.getTop2Id(), dto.getBottomId(),
                dto.getFootwearId(), dto.getOuterwearId(), dto.getHeadwearId(), dto.getFullBodywearId()
        ).stream().filter(Objects::nonNull).collect(Collectors.toList());
        for (int i = 0; i < ids.size(); i++) {
            String c1 = Optional.ofNullable(clothingItemRepository.findById(ids.get(i)).orElseThrow().getBaseColor()).orElse("");
            for (int j = i + 1; j < ids.size(); j++) {
                String c2 = Optional.ofNullable(clothingItemRepository.findById(ids.get(j)).orElseThrow().getBaseColor()).orElse("");
                score -= colorDistance(c1, c2) / 3.0;
            }
        }
        for (Long id : ids) {
            ClothingItem item = clothingItemRepository.findById(id).orElse(null);
            if (item != null) {
                if (season.equalsIgnoreCase(item.getSeason())) score += 10;
                String itemStyle = Optional.ofNullable(item.getUsage()).orElse("").toLowerCase();
                String requestedStyle = Optional.ofNullable(context).orElse("").toLowerCase();

                int bonus = Optional.ofNullable(STYLE_COMPATIBILITY_SCORES.get(requestedStyle))
                        .map(map -> map.getOrDefault(itemStyle, 0))
                        .orElse(0);

                score += bonus;

            }
        }
        return score;
    }

    private double colorDistance(String n1, String n2) {
        try {
            Color c1 = Color.decode(COLOR_NAME_TO_HEX.getOrDefault(n1.trim(), "#000000"));
            Color c2 = Color.decode(COLOR_NAME_TO_HEX.getOrDefault(n2.trim(), "#000000"));
            int dr = c1.getRed() - c2.getRed();
            int dg = c1.getGreen() - c2.getGreen();
            int db = c1.getBlue() - c2.getBlue();
            return Math.sqrt(dr * dr + dg * dg + db * db);

        } catch (Exception e) {
            return 999;
        }
    }

    private boolean isCategory(ClothingItem item, String category) {
        return item.getCategory() != null
                && category.equalsIgnoreCase(item.getCategory().getName());
    }
}
