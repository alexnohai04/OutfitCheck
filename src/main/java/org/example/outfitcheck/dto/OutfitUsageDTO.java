package org.example.outfitcheck.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.example.outfitcheck.entity.Outfit;

@Getter
@Setter
@AllArgsConstructor
public class OutfitUsageDTO {
    private Outfit outfit;
    private long usageCount;
}

