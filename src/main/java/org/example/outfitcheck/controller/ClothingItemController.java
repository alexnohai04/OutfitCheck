package org.example.outfitcheck.controller;

import jakarta.persistence.EntityNotFoundException;
import org.example.outfitcheck.dto.ClothingItemRequest;
import org.example.outfitcheck.dto.LastUsedResponse;
import org.example.outfitcheck.dto.VisionAnalysisResponse;
import org.example.outfitcheck.entity.ClothingItem;
import org.example.outfitcheck.service.ClothingItemService;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clothing")
public class ClothingItemController {
    private final ClothingItemService clothingItemService;

    public ClothingItemController(ClothingItemService clothingItemService) {
        this.clothingItemService = clothingItemService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addClothingItem(@RequestBody ClothingItemRequest request) {
        try {
            ClothingItem savedItem = clothingItemService.addClothingItemWithImageUrl(
                    request.getUserId(),
                    request.getCategoryId(),
                    request.getBaseColor(),
                    request.getBrand(),
                    request.getImageUrl(),
                    request.getLink(),
                    request.getCareSymbols(),
                    request.getArticleType(),
                    request.getSeason(),
                    request.getUsage()
            );
            return ResponseEntity.ok(savedItem);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @PostMapping("/upload-temp-image")
    public ResponseEntity<VisionAnalysisResponse> uploadTempImage(@RequestParam("file") MultipartFile file) {
        try {
            VisionAnalysisResponse result = clothingItemService.uploadTemporaryImage(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    new VisionAnalysisResponse("error.webp", e.getMessage(), new ArrayList<>(), null, null, null, null, null, null)
            );
        }
    }


    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ClothingItem>> getClothingItemsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(clothingItemService.getClothingItemsByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClothingItem> getClothingItemById(@PathVariable Long id) {
        Optional<ClothingItem> item = clothingItemService.getClothingItemById(id);
        return item.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/by-ids")
    public ResponseEntity<List<ClothingItem>> getClothingItemsByIds(@RequestBody List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<ClothingItem> items = clothingItemService.getClothingItemsByIds(ids);
        return ResponseEntity.ok(items);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClothingItem(@PathVariable Long id) {
        if (clothingItemService.deleteClothingItem(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/image/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        return clothingItemService.serveClothingImage(filename);
    }

    @PatchMapping("/{id}/toggle-laundry")
    public ResponseEntity<ClothingItem> toggleInLaundry(@PathVariable Long id) {
        try {
            ClothingItem updated = clothingItemService.toggleInLaundry(id);
            return ResponseEntity.ok(updated);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/last-used")
    public ResponseEntity<LastUsedResponse> getLastUsedDate(@PathVariable("id") Long clothingItemId) {
        LocalDate lastUsed = clothingItemService.getLastUsedDate(clothingItemId);
        return ResponseEntity.ok(new LastUsedResponse(lastUsed));
    }


}
