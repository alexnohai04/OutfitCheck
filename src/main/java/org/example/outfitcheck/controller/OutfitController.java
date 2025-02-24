package org.example.outfitcheck.controller;

import org.example.outfitcheck.entity.Outfit;
import org.example.outfitcheck.repository.OutfitRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/outfits")
public class OutfitController {
    private final OutfitRepository outfitRepository;

    public OutfitController(OutfitRepository outfitRepository) {
        this.outfitRepository = outfitRepository;
    }

    // 🔹 1. Creare outfit nou
    @PostMapping("/create")
    public ResponseEntity<Outfit> createOutfit(@RequestBody Outfit outfit) {
        Outfit savedOutfit = outfitRepository.save(outfit);
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
