package org.example.outfitcheck.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class AnalyzeLabelResponse {
    private List<String> symbols;

}
