package org.example.outfitcheck.config;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;

import java.io.*;
import java.util.concurrent.TimeUnit;

@Component
public class FashionClassifierStarterService {

    private Process flaskProcess;

    @PostConstruct
    public void startFlaskService() {
        try {
            // Comandă robustă: rulează direct python.exe din venv
            ProcessBuilder builder = new ProcessBuilder(
                    "cmd.exe", "/c",
                    "venv\\Scripts\\python.exe", "app.py"
            );

            // Setează directorul în care se află app.py
            builder.directory(new File("FashionTagger"));
            builder.redirectErrorStream(true); // stdout + stderr

            flaskProcess = builder.start();

            // Thread care citește și afișează logul din Flask
            new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(flaskProcess.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        System.out.println("[Flask] " + line);
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }).start();

            System.out.println("🚀 FashionTagger Flask microservice started!");
        } catch (IOException e) {
            System.err.println("❌ Could not start FashionTagger Flask microservice:");
            e.printStackTrace();
        }
    }

    @PreDestroy
    public void stopFlaskService() {
        if (flaskProcess != null) {
            long pid = flaskProcess.pid();
            System.out.println("🛑 Killing FashionTagger Flask process tree (PID=" + pid + ")...");
            try {
                // taskkill /F (forțează) /T (proces + copii) /PID <pid>
                Process kill = new ProcessBuilder(
                        "taskkill", "/F", "/T", "/PID", Long.toString(pid)
                ).start();
                kill.waitFor(5, TimeUnit.SECONDS);
                System.out.println("✅ Flask process tree terminated.");
            } catch (IOException | InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

}


