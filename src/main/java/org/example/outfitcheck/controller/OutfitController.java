package org.example.outfitcheck.controller;

import org.example.outfitcheck.config.JwtUtil;
import org.example.outfitcheck.dto.OutfitDTO;
import org.example.outfitcheck.entity.ClothingItem;
import org.example.outfitcheck.entity.Outfit;
import org.example.outfitcheck.entity.User;
import org.example.outfitcheck.repository.ClothingItemRepository;
import org.example.outfitcheck.repository.OutfitRepository;
import org.example.outfitcheck.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/outfits")
public class OutfitController {
    private final OutfitRepository outfitRepository;
    private final UserRepository userRepository;
    private final ClothingItemRepository clothingItemRepository;
    private final JwtUtil jwtUtil;


    public OutfitController(OutfitRepository outfitRepository, UserRepository userRepository, ClothingItemRepository clothingItemRepository, JwtUtil jwtUtil) {
        this.outfitRepository = outfitRepository;
        this.userRepository = userRepository;
        this.clothingItemRepository = clothingItemRepository;
        this.jwtUtil = jwtUtil;
    }

    // 🔹 1. Creare outfit nou

    @PostMapping("/create")
    public ResponseEntity<Outfit> createOutfit(@RequestBody OutfitDTO outfitDTO) {
        Optional<User> userOptional = userRepository.findById(outfitDTO.getCreatorId());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        User creator = userOptional.get();

        // Convertim lista de ID-uri în obiecte ClothingItem
        List<ClothingItem> clothingItems = clothingItemRepository.findAllById(outfitDTO.getItems());

        Outfit newOutfit = new Outfit();
        newOutfit.setName(outfitDTO.getName());
        newOutfit.setCreator(creator);
        newOutfit.setClothingItems(clothingItems);

        Outfit savedOutfit = outfitRepository.save(newOutfit);
        return ResponseEntity.ok(savedOutfit);
    }

    // 🔹 2. Obținerea tuturor outfit-urilor unui utilizator
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Outfit>> getOutfitsByUser(@PathVariable Long userId) {
        List<Outfit> outfits = outfitRepository.findByCreatorId(userId);
        return ResponseEntity.ok(outfits);
    }

    @GetMapping("/user_public/{userId}")
    public ResponseEntity<List<Outfit>> getPublicOutfitsByUser(@PathVariable Long userId) {
        List<Outfit> outfits = outfitRepository.findByCreatorIdAndVisibleTrue(userId);
        return ResponseEntity.ok(outfits);
    }

    // 🔹 3. Obținerea unui outfit după ID
    @GetMapping("/{id}")
    public ResponseEntity<Outfit> getOutfitById(@PathVariable Long id) {
        Optional<Outfit> outfit = outfitRepository.findById(id);
        return outfit.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 🔹 4. Ștergerea unui outfit
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOutfit(@PathVariable Long id) {
        if (outfitRepository.existsById(id)) {
            outfitRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/toggle-visibility")
    public ResponseEntity<?> toggleVisibility(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token
    ) {
        try {
            Long userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
            Optional<Outfit> outfitOptional = outfitRepository.findById(id);

            if (outfitOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Outfit outfit = outfitOptional.get();

            if (!outfit.getCreator().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to modify this outfit.");
            }

            outfit.setVisible(!outfit.isVisible());
            Outfit updatedOutfit = outfitRepository.save(outfit);

            return ResponseEntity.ok(updatedOutfit);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid token.");
        }
    }

    @GetMapping("/clothing-items/{itemId}/outfits")
    public ResponseEntity<List<Outfit>> getOutfitsByClothingItem(@PathVariable Long itemId) {
        ClothingItem item = clothingItemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Clothing item not found"));

        List<Outfit> outfits = outfitRepository.findAllByClothingItemsContaining(item);

        return ResponseEntity.ok(outfits);
    }

}
