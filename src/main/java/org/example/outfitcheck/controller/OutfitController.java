package org.example.outfitcheck.controller;

import org.example.outfitcheck.dto.OutfitDTO;
import org.example.outfitcheck.entity.ClothingItem;
import org.example.outfitcheck.entity.Outfit;
import org.example.outfitcheck.entity.User;
import org.example.outfitcheck.repository.ClothingItemRepository;
import org.example.outfitcheck.repository.OutfitRepository;
import org.example.outfitcheck.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/outfits")
public class OutfitController {
    private final OutfitRepository outfitRepository;
    private final UserRepository userRepository;
    private final ClothingItemRepository clothingItemRepository;

    public OutfitController(OutfitRepository outfitRepository, UserRepository userRepository, ClothingItemRepository clothingItemRepository) {
        this.outfitRepository = outfitRepository;
        this.userRepository = userRepository;
        this.clothingItemRepository = clothingItemRepository;
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
}
