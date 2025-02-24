package org.example.outfitcheck.repository;

import org.example.outfitcheck.entity.ClothingCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClothingCategoryRepository extends JpaRepository<ClothingCategory, Long> {
    ClothingCategory findByName(String name);
}
