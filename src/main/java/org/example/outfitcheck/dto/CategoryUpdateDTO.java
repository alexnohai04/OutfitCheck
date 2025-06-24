package org.example.outfitcheck.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class CategoryUpdateDTO {
    private List<Long> categoryIds;
}
