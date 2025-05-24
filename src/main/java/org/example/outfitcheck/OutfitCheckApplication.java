package org.example.outfitcheck;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class OutfitCheckApplication {
    public static void main(String[] args) {
        SpringApplication.run(OutfitCheckApplication.class, args);
        System.out.println("OutfitCheck application has started!");
    }
}
