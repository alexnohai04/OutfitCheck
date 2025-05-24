package org.example.outfitcheck.dto;
import lombok.*;
@Getter
@Setter
public class OutfitGenerationRequest {
    private Long userId;
    private String context;            // ex: "Smart Casual"
    private String season;             // ex: "Spring"
    private boolean includeHeadwear;   // whether to include headwear
    private boolean includeOuterwear;  // whether to include outerwear
    private int topwearLayers;         // number of top layers (1 or 2)
    private boolean preferFullBodywear;// whether to prefer a full-body outfit
}

