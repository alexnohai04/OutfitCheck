package org.example.outfitcheck.repository;

import org.example.outfitcheck.entity.ClothingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClothingItemRepository extends JpaRepository<ClothingItem, Long> {
    List<ClothingItem> findByOwnerId(Long userId);
    List<ClothingItem> findByOwnerIdAndInLaundryFalse(Long ownerId);

}
