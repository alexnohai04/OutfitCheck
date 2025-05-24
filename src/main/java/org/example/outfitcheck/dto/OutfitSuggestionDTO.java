package org.example.outfitcheck.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OutfitSuggestionDTO {
    private Long top1Id;
    private Long top2Id;
    private Long bottomId;
    private Long footwearId;
    private Long outerwearId;
    private Long headwearId;       // nou
    private Long fullBodywearId;
    private double score;
}


