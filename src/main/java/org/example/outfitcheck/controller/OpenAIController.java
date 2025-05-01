package org.example.outfitcheck.controller;

import org.example.outfitcheck.dto.AnalyzeLabelRequest;
import org.example.outfitcheck.dto.AnalyzeLabelResponse;
import org.example.outfitcheck.service.OpenAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/openai")
public class OpenAIController {

    @Autowired
    private OpenAIService openAIService;

    @PostMapping("/analyze-label")
    public AnalyzeLabelResponse analyzeLabel(@RequestBody AnalyzeLabelRequest request) {
        var symbols = openAIService.analyzeLabel(request.getImageBase64());
        return new AnalyzeLabelResponse(symbols);
    }
}
