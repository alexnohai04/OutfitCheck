package org.example.outfitcheck.controller;

import lombok.RequiredArgsConstructor;
import org.example.outfitcheck.dto.ClothingItemUsageDTO;
import org.example.outfitcheck.dto.LoggedOutfitDTO;
import org.example.outfitcheck.dto.OutfitUsageDTO;
import org.example.outfitcheck.entity.ClothingItem;
import org.example.outfitcheck.entity.LoggedOutfit;
import org.example.outfitcheck.entity.Outfit;
import org.example.outfitcheck.service.LoggedOutfitService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/logged-outfits")
@RequiredArgsConstructor
public class LoggedOutfitController {

    private final LoggedOutfitService loggedOutfitService;

    @PostMapping
    public ResponseEntity<LoggedOutfit> logOutfit(@RequestBody LoggedOutfitDTO dto) {
        return ResponseEntity.ok(loggedOutfitService.logOutfit(dto));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<List<LoggedOutfit>> getAllByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(loggedOutfitService.getAllByUser(userId));
    }

    @GetMapping("/by-user-and-date")
    public ResponseEntity<List<ClothingItem>> getByUserAndDate(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return loggedOutfitService.getOutfitByUserAndDate(userId, date)
                .map(logged -> ResponseEntity.ok(logged.getOutfit().getClothingItems()))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{userId}/{date}")
    public ResponseEntity<Void> deleteByUserAndDate(
            @PathVariable Long userId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        loggedOutfitService.deleteByUserAndDate(userId, date);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/most-worn-outfits/{userId}")
    public ResponseEntity<List<OutfitUsageDTO>> getMostWornOutfits(@PathVariable Long userId) {
        return ResponseEntity.ok(loggedOutfitService.getTopWornOutfits(userId));
    }


    @GetMapping("/most-used-items/{userId}")
    public ResponseEntity<List<ClothingItemUsageDTO>> getMostUsedClothingItems(@PathVariable Long userId) {
        return ResponseEntity.ok(loggedOutfitService.getMostUsedClothingItems(userId));
    }

    @GetMapping("/neglected-items/{userId}")
    public ResponseEntity<List<ClothingItem>> getNeglectedItems(@PathVariable Long userId) {
        return ResponseEntity.ok(loggedOutfitService.getNeglectedItems(userId));
    }



}
