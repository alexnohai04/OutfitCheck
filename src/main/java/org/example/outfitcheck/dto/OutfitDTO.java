package org.example.outfitcheck.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter @Setter
public class OutfitDTO {
    private String name;
    private Long creatorId;
    private boolean visible;
    private List<Long> items;  // Listă cu ID-urile hainelor selectate
}
