package org.example.outfitcheck.controller;

import org.example.outfitcheck.dto.OutfitGenerationRequest;
import org.example.outfitcheck.dto.OutfitSuggestionDTO;
import org.example.outfitcheck.service.OutfitGeneratorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class OutfitRecommendationController {

    private final OutfitGeneratorService outfitGeneratorService;

    public OutfitRecommendationController(OutfitGeneratorService outfitGeneratorService) {
        this.outfitGeneratorService = outfitGeneratorService;
    }


    @PostMapping("/generate")
    public ResponseEntity<List<OutfitSuggestionDTO>> generateOutfits(
            @RequestBody OutfitGenerationRequest request
    ) {
        List<OutfitSuggestionDTO> outfits = outfitGeneratorService.generateOutfits(
                request.getUserId(),
                request.getContext(),
                request.getSeason(),
                request.isIncludeHeadwear(),
                request.isIncludeOuterwear(),
                request.getTopwearLayers(),
                request.isPreferFullBodywear()
        );

        if (outfits == null || outfits.isEmpty()) {
            System.out.println("⚠️  No outfit could be generated.");
            return ResponseEntity.noContent().build();
        }

        System.out.println("✅ Generated outfits: " + outfits);
        return ResponseEntity.ok(outfits);
    }


}
