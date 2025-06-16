package org.example.outfitcheck.service;

import lombok.RequiredArgsConstructor;
import org.example.outfitcheck.dto.ClothingItemUsageDTO;
import org.example.outfitcheck.dto.LoggedOutfitDTO;
import org.example.outfitcheck.dto.OutfitUsageDTO;
import org.example.outfitcheck.entity.ClothingItem;
import org.example.outfitcheck.entity.LoggedOutfit;
import org.example.outfitcheck.entity.Outfit;
import org.example.outfitcheck.repository.ClothingItemRepository;
import org.example.outfitcheck.repository.LoggedOutfitRepository;
import org.example.outfitcheck.repository.OutfitRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoggedOutfitService {

    private final LoggedOutfitRepository loggedOutfitRepository;
    private final OutfitRepository outfitRepository;
    private final ClothingItemRepository clothingItemRepository;

    public LoggedOutfit logOutfit(LoggedOutfitDTO dto) {
        Outfit outfit = outfitRepository.findById(dto.getOutfitId())
                .orElseThrow(() -> new RuntimeException("Outfit not found"));

        // verificare dacă există deja
        loggedOutfitRepository.findByUserIdAndDate(dto.getUserId(), dto.getDate())
                .ifPresent(existing -> {
                    throw new RuntimeException("Outfit already logged for this date.");
                });

        LoggedOutfit loggedOutfit = new LoggedOutfit();
        loggedOutfit.setOutfit(outfit);
        loggedOutfit.setDate(dto.getDate());
        loggedOutfit.setUserId(dto.getUserId());

        return loggedOutfitRepository.save(loggedOutfit);
    }

    public Optional<LoggedOutfit> getOutfitByUserAndDate(Long userId, LocalDate date) {
        return loggedOutfitRepository.findByUserIdAndDate(userId, date);
    }

    public List<LoggedOutfit> getAllByUser(Long userId) {
        return loggedOutfitRepository.findByUserId(userId);
    }

    public void deleteByUserAndDate(Long userId, LocalDate date) {
        Optional<LoggedOutfit> outfit = loggedOutfitRepository.findByUserIdAndDate(userId, date);
        outfit.ifPresent(loggedOutfitRepository::delete);
    }

    public List<OutfitUsageDTO> getTopWornOutfits(Long userId) {
        List<LoggedOutfit> logs = loggedOutfitRepository.findByUserId(userId);

        Map<Outfit, Long> outfitCounts = logs.stream()
                .collect(Collectors.groupingBy(LoggedOutfit::getOutfit, Collectors.counting()));

        return outfitCounts.entrySet().stream()
                .sorted(Map.Entry.<Outfit, Long>comparingByValue().reversed())
                .limit(3)
                .map(entry -> new OutfitUsageDTO(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }



    public List<ClothingItemUsageDTO> getMostUsedClothingItems(Long userId) {
        List<LoggedOutfit> logs = loggedOutfitRepository.findByUserId(userId);
        Map<ClothingItem, Long> itemUsage = new HashMap<>();

        for (LoggedOutfit log : logs) {
            for (ClothingItem item : log.getOutfit().getClothingItems()) {
                itemUsage.merge(item, 1L, Long::sum);
            }
        }

        return itemUsage.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .map(entry -> new ClothingItemUsageDTO(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }

    public List<ClothingItem> getNeglectedItems(Long userId) {
        List<LoggedOutfit> logs = loggedOutfitRepository.findByUserId(userId);

        // Toate itemele purtate de user în ultima lună
        LocalDate now = LocalDate.now();
        LocalDate oneMonthAgo = now.minusMonths(1);

        Set<Long> wornRecently = logs.stream()
                .filter(log -> log.getDate().isAfter(oneMonthAgo))
                .flatMap(log -> log.getOutfit().getClothingItems().stream())
                .map(ClothingItem::getId)
                .collect(Collectors.toSet());

        // Toate itemele din garderoba userului
        List<ClothingItem> allItems = clothingItemRepository.findByOwnerId(userId);

        // Cele care nu au fost folosite deloc sau foarte rar
        return allItems.stream()
                .filter(item -> !wornRecently.contains(item.getId()))
                .collect(Collectors.toList());
    }



}
