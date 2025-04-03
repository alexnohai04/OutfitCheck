package org.example.outfitcheck.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class CategoryMapperService {

    private static final Map<String, String> labelToCategory = Map.ofEntries(
            // 👕 Topwear
            Map.entry("shirt", "Topwear"),
            Map.entry("t-shirt", "Topwear"),
            Map.entry("blouse", "Topwear"),
            Map.entry("top", "Topwear"),
            Map.entry("tank top", "Topwear"),
            Map.entry("polo", "Topwear"),
            Map.entry("sweater", "Topwear"),
            Map.entry("cardigan", "Topwear"),
            Map.entry("hoodie", "Topwear"),
            Map.entry("jacket", "Topwear"),
            Map.entry("coat", "Topwear"),
            Map.entry("vest", "Topwear"),
            Map.entry("kimono", "Topwear"),
            Map.entry("tunic", "Topwear"),
            Map.entry("crop top", "Topwear"),
            Map.entry("long sleeve", "Topwear"),
            Map.entry("short sleeve", "Topwear"),

            // 👖 Bottomwear
            Map.entry("jeans", "Bottomwear"),
            Map.entry("pants", "Bottomwear"),
            Map.entry("trousers", "Bottomwear"),
            Map.entry("shorts", "Bottomwear"),
            Map.entry("joggers", "Bottomwear"),
            Map.entry("leggings", "Bottomwear"),
            Map.entry("sweatpants", "Bottomwear"),
            Map.entry("cargo pants", "Bottomwear"),
            Map.entry("culottes", "Bottomwear"),
            Map.entry("skirt", "Bottomwear"),
            Map.entry("mini skirt", "Bottomwear"),
            Map.entry("maxi skirt", "Bottomwear"),

            // 👗 FullBodywear
            Map.entry("dress", "FullBodywear"),
            Map.entry("gown", "FullBodywear"),
            Map.entry("robe", "FullBodywear"),
            Map.entry("jumpsuit", "FullBodywear"),
            Map.entry("romper", "FullBodywear"),
            Map.entry("overalls", "FullBodywear"),
            Map.entry("onesie", "FullBodywear"),
            Map.entry("snowsuit", "FullBodywear"),
            Map.entry("coverall", "FullBodywear"),

            // 👟 Footwear
            Map.entry("shoes", "Footwear"),
            Map.entry("sneakers", "Footwear"),
            Map.entry("boots", "Footwear"),
            Map.entry("sandals", "Footwear"),
            Map.entry("heels", "Footwear"),
            Map.entry("loafers", "Footwear"),
            Map.entry("slippers", "Footwear"),
            Map.entry("flip flops", "Footwear"),
            Map.entry("platforms", "Footwear"),
            Map.entry("oxfords", "Footwear"),
            Map.entry("clogs", "Footwear"),

            // 🧢 Headwear
            Map.entry("hat", "Headwear"),
            Map.entry("cap", "Headwear"),
            Map.entry("beanie", "Headwear"),
            Map.entry("beret", "Headwear"),
            Map.entry("fedora", "Headwear"),
            Map.entry("headband", "Headwear"),
            Map.entry("hood", "Headwear"),
            Map.entry("visor", "Headwear"),
            Map.entry("turban", "Headwear"),
            Map.entry("helmet", "Headwear")
    );


    public String mapLabelToCategory(List<String> labels) {
        for (String label : labels) {
            String key = label.toLowerCase();
            if (labelToCategory.containsKey(key)) {
                return labelToCategory.get(key);
            }
        }
        return null;
    }
}
