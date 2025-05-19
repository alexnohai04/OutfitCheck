package org.example.outfitcheck.config;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;

@Component
public class FashionClassifierStarterService {

    private Process flaskProcess;

    @PostConstruct
    public void startFlaskService() {
        try {
            ProcessBuilder builder = new ProcessBuilder(
                    "cmd.exe", "/c",
                    "venv\\Scripts\\activate && python app.py"
            );

            builder.directory(new File("FashionTagger")); // Schimbă în funcție de folderul real
            builder.redirectErrorStream(true);

            flaskProcess = builder.start();
            System.out.println("🚀 FashionTagger Flask microservice started!");
        } catch (IOException e) {
            System.err.println("❌ Could not start FashionTagger Flask microservice:");
            e.printStackTrace();
        }
    }

    @PreDestroy
    public void stopFlaskService() {
        if (flaskProcess != null && flaskProcess.isAlive()) {
            flaskProcess.destroy();
            System.out.println("🛑 FashionTagger Flask microservice stopped.");
        }
    }
}
