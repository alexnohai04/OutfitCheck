package org.example.outfitcheck.service;

import lombok.RequiredArgsConstructor;
import org.example.outfitcheck.dto.LoggedOutfitDTO;
import org.example.outfitcheck.entity.LoggedOutfit;
import org.example.outfitcheck.entity.Outfit;
import org.example.outfitcheck.repository.LoggedOutfitRepository;
import org.example.outfitcheck.repository.OutfitRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LoggedOutfitService {

    private final LoggedOutfitRepository loggedOutfitRepository;
    private final OutfitRepository outfitRepository;

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

}
