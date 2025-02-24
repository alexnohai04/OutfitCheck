package org.example.outfitcheck.controller;

import org.example.outfitcheck.entity.ClothingItem;
import org.example.outfitcheck.repository.ClothingItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clothing")
public class ClothingItemController {
    private final ClothingItemRepository clothingItemRepository;

    public ClothingItemController(ClothingItemRepository clothingItemRepository) {
        this.clothingItemRepository = clothingItemRepository;
    }

    // 🔹 1. Adăugare haină nouă
    @PostMapping("/add")
    public ResponseEntity<ClothingItem> addClothingItem(@RequestBody ClothingItem clothingItem) {
        ClothingItem savedItem = clothingItemRepository.save(clothingItem);
        return ResponseEntity.ok(savedItem);
    }

    // 🔹 2. Obținerea tuturor hainelor unui utilizator
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ClothingItem>> getClothingItemsByUser(@PathVariable Long userId) {
        List<ClothingItem> items = clothingItemRepository.findByOwnerId(userId);
        return ResponseEntity.ok(items);
    }

    // 🔹 3. Obținerea unui articol vestimentar după ID
    @GetMapping("/{id}")
    public ResponseEntity<ClothingItem> getClothingItemById(@PathVariable Long id) {
        Optional<ClothingItem> item = clothingItemRepository.findById(id);
        return item.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 🔹 4. Ștergerea unui articol vestimentar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClothingItem(@PathVariable Long id) {
        if (clothingItemRepository.existsById(id)) {
            clothingItemRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
