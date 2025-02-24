package org.example.outfitcheck.repository;

import org.example.outfitcheck.entity.Outfit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OutfitRepository extends JpaRepository<Outfit, Long> {
    List<Outfit> findByCreatorId(Long userId);
}
