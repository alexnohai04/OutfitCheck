package org.example.outfitcheck.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class LastUsedResponse {
    private LocalDate lastUsed;
}

