package org.example.outfitcheck.repository;

import org.example.outfitcheck.entity.LoggedOutfit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LoggedOutfitRepository extends JpaRepository<LoggedOutfit, Long> {
    List<LoggedOutfit> findByUserId(Long userId);
    Optional<LoggedOutfit> findByUserIdAndDate(Long userId, LocalDate date);
}
