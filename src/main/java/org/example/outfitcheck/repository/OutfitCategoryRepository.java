package org.example.outfitcheck.repository;

import org.example.outfitcheck.entity.OutfitCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OutfitCategoryRepository extends JpaRepository<OutfitCategory, Long> {
    Optional<OutfitCategory> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);


}
