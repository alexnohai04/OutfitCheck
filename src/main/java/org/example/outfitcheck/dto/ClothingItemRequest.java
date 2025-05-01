package org.example.outfitcheck.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ClothingItemRequest {
    private Long userId;
    private Long categoryId;
    private List<String> colors;
    private String material;
    private String brand;
    private String imageUrl;
    private String link;
    private List<String> careSymbols;
}
