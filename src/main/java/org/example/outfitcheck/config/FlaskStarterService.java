package org.example.outfitcheck.config;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;

@Component
public class FlaskStarterService {

    private Process flaskProcess;

    @PostConstruct
    public void startFlaskService() {
        try {
            ProcessBuilder builder = new ProcessBuilder(
                    "cmd.exe", "/c",
                    "venv\\Scripts\\activate && python app.py"
            );

            builder.directory(new File("u2net-bg-removal")); // Setează directorul de lucru
            builder.redirectErrorStream(true); // Combină stdout + stderr

            flaskProcess = builder.start();
            System.out.println("🚀 Flask microservice started!");
        } catch (IOException e) {
            System.err.println("❌ Could not start Flask microservice:");
            e.printStackTrace();
        }
    }

    @PreDestroy
    public void stopFlaskService() {
        if (flaskProcess != null && flaskProcess.isAlive()) {
            flaskProcess.destroy();
            System.out.println("🛑 Flask microservice stopped.");
        }
    }
}
