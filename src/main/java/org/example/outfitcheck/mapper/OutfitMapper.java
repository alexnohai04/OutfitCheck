//package org.example.outfitcheck.mapper;
//import org.example.outfitcheck.dto.OutfitDTO;
//import org.example.outfitcheck.entity.ClothingItem;
//import org.example.outfitcheck.entity.Outfit;
//import org.springframework.stereotype.Component;
//
//import java.util.stream.Collectors;
//
//@Component
//public class OutfitMapper {
//    public OutfitDTO toDto(Outfit outfit) {
//        return new OutfitDTO(
//                outfit.getId(),
//                outfit.getName(),
//                outfit.getCreator().getId(),
//                outfit.isVisible(),
//                outfit.getClothingItems().stream()
//                        .map(ClothingItem::getId)
//                        .collect(Collectors.toList())
//        );
//    }
//}
