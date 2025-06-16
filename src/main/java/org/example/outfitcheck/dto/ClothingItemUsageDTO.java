package org.example.outfitcheck.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.example.outfitcheck.entity.ClothingItem;

@Getter
@Setter
@AllArgsConstructor
public class ClothingItemUsageDTO {
    private ClothingItem item;
    private Long usageCount;


}
