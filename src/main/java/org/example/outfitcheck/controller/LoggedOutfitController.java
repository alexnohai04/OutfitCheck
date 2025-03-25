package org.example.outfitcheck.controller;

import lombok.RequiredArgsConstructor;
import org.example.outfitcheck.dto.LoggedOutfitDTO;
import org.example.outfitcheck.entity.LoggedOutfit;
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
    public ResponseEntity<LoggedOutfit> getByUserAndDate(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return loggedOutfitService.getOutfitByUserAndDate(userId, date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{userId}/{date}")
    public ResponseEntity<Void> deleteByUserAndDate(
            @PathVariable Long userId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        loggedOutfitService.deleteByUserAndDate(userId, date);
        return ResponseEntity.noContent().build();
    }

}
