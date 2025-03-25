package org.example.outfitcheck.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class LoggedOutfitDTO {
    private Long outfitId;
    private LocalDate date;
    private Long userId;
}
