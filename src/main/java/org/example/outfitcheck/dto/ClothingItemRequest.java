package org.example.outfitcheck.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClothingItemRequest {
    private String imageUrl;
    private String color;
    private String material;
    private Long categoryId;
    private Long userId;
}
