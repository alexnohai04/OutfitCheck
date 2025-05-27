package org.example.outfitcheck.config;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

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
            long pid = flaskProcess.pid();
            System.out.println("🛑 Killing RemoveBG Flask process tree (PID=" + pid + ")...");
            try {
                // taskkill /F = forțează, /T = toate procesele copil
                Process kill = new ProcessBuilder(
                        "taskkill", "/F", "/T", "/PID", Long.toString(pid)
                ).start();
                if (!kill.waitFor(5, TimeUnit.SECONDS)) {
                    System.err.println("⚠️ taskkill a picat sau a durat prea mult.");
                } else {
                    System.out.println("✅ Flask process tree terminated.");
                }
            } catch (IOException | InterruptedException e) {
                e.printStackTrace();
                Thread.currentThread().interrupt();
            }
        }
    }
}
