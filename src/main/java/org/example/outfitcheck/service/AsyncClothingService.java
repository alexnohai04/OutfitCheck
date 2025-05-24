package org.example.outfitcheck.service;

import org.example.outfitcheck.dto.VisionAnalysisResponse;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
@Service
public class AsyncClothingService {

    private final VisionService visionService;
    private final FlaskClassifierService flaskClassifierService;

    public AsyncClothingService(VisionService visionService, FlaskClassifierService flaskClassifierService) {
        this.visionService = visionService;
        this.flaskClassifierService = flaskClassifierService;
    }

    @Async
    public CompletableFuture<Map<String, Object>> analyzeWithGoogleVisionAsync(File file) throws Exception {
        return CompletableFuture.completedFuture(visionService.analyzeWithGoogleVision(file));
    }

    @Async
    public CompletableFuture<Map<String, String>> callFlaskClassifierAsync(File file) {
        return CompletableFuture.completedFuture(flaskClassifierService.callFlaskClassifier(file));
    }
}
