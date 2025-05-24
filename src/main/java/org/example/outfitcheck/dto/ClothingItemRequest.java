package org.example.outfitcheck.dto;

import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ClothingItemRequest {
    private Long userId;
    private Long categoryId;
    private String baseColor;
    private String brand;
    private String imageUrl;
    private String link;
    private List<String> careSymbols;
    private String articleType;
    private String season;
    private String usage;
}
