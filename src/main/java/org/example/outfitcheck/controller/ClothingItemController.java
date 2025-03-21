package org.example.outfitcheck.controller;

import org.example.outfitcheck.dto.ClothingItemRequest;
import org.example.outfitcheck.entity.ClothingItem;
import org.example.outfitcheck.service.ClothingItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clothing")
public class ClothingItemController {
    private final ClothingItemService clothingItemService;

    public ClothingItemController(ClothingItemService clothingItemService) {
        this.clothingItemService = clothingItemService;
    }

    // 🔹 1. Adăugare haină nouă cu imagine
    @PostMapping("/add")
    public ResponseEntity<?> addClothingItem(
            @RequestParam("userId") Long userId,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("color") String color,
            @RequestParam("material") String material,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            ClothingItem savedItem = clothingItemService.addClothingItem(userId, categoryId, color, material, file);
            return ResponseEntity.ok(savedItem);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 🔹 2. Obținerea tuturor hainelor unui utilizator
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ClothingItem>> getClothingItemsByUser(@PathVariable Long userId) {
        List<ClothingItem> items = clothingItemService.getClothingItemsByUser(userId);
        return ResponseEntity.ok(items);
    }

    // 🔹 3. Obținerea unui articol vestimentar cu imaginea sa
    @GetMapping("/{id}")
    public ResponseEntity<ClothingItem> getClothingItemById(@PathVariable Long id) {
        Optional<ClothingItem> item = clothingItemService.getClothingItemById(id);
        return item.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 🔹 4. Ștergerea unui articol vestimentar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClothingItem(@PathVariable Long id) {
        if (clothingItemService.deleteClothingItem(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
