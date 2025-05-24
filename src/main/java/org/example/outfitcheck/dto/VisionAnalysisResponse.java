package org.example.outfitcheck.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VisionAnalysisResponse {
    private String fileName;
    private String suggestedCategory; // + getter & setter
    private List<ColorInfo> topColors;
    private String brand;

    private String subCategory;
    private String articleType;
    private String baseColour;
    private String season;
    private String usage;

}
