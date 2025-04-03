package org.example.outfitcheck.service;

import org.example.outfitcheck.dto.ColorInfo;
import org.example.outfitcheck.dto.VisionAnalysisResponse;
import org.example.outfitcheck.entity.ClothingCategory;
import org.example.outfitcheck.entity.ClothingItem;
import org.example.outfitcheck.entity.User;
import org.example.outfitcheck.repository.ClothingCategoryRepository;
import org.example.outfitcheck.repository.ClothingItemRepository;
import org.example.outfitcheck.repository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Service
public class ClothingItemService {
    private final ClothingItemRepository clothingItemRepository;
    private final ClothingCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final VisionService visionService;
    private final CategoryMapperService categoryMapperService;
    private final ColorMapperService colorMapperService;

    public ClothingItemService(ClothingItemRepository clothingItemRepository,
                               ClothingCategoryRepository categoryRepository,
                               UserRepository userRepository, VisionService visionService, CategoryMapperService categoryMapperService, ColorMapperService colorMapperService) {
        this.clothingItemRepository = clothingItemRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.visionService = visionService;
        this.categoryMapperService = categoryMapperService;

        this.colorMapperService = colorMapperService;
    }
    public ClothingItem addClothingItemWithImageUrl(Long userId, Long categoryId, List colors, String material, String brand, String imageUrl) {
        Optional<ClothingCategory> categoryOpt = categoryRepository.findById(categoryId);
        Optional<User> userOpt = userRepository.findById(userId);

        if (categoryOpt.isEmpty()) {
            throw new IllegalArgumentException("Categoria nu există.");
        }
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Utilizatorul nu există.");
        }

        ClothingItem clothingItem = new ClothingItem();
        clothingItem.setColors(colors);
        clothingItem.setMaterial(material);
        clothingItem.setCategory(categoryOpt.get());
        clothingItem.setOwner(userOpt.get());
        //clothingItem.setImageUrl(imageUrl); // direct linkul complet

        clothingItem = clothingItemRepository.save(clothingItem);
        System.out.println("❌ Path-ul catre fisier: " + imageUrl);
        clothingItem.setImageUrl(saveClothingItemImage(clothingItem.getId(),imageUrl));

        return clothingItemRepository.save(clothingItem);
    }

    public void sendToFlaskRemoveBg(String localPath) {
        File file = new File(localPath);
        if (!file.exists()) {
            System.out.println("❌ Fișierul nu există: " + localPath);
            return;
        }

        try {
            String boundary = "----WebKitFormBoundary" + System.currentTimeMillis();
            URL url = new URL("http://127.0.0.1:5000/remove_bg");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            connection.setDoOutput(true);
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

            try (DataOutputStream request = new DataOutputStream(connection.getOutputStream())) {
                // Scrie începutul multipart
                request.writeBytes("--" + boundary + "\r\n");
                request.writeBytes("Content-Disposition: form-data; name=\"image\"; filename=\"" + file.getName() + "\"\r\n");
                request.writeBytes("Content-Type: image/webp\r\n\r\n");
                Files.copy(file.toPath(), request);
                request.writeBytes("\r\n--" + boundary + "--\r\n");
                request.flush();
            }

            int responseCode = connection.getResponseCode();
            if (responseCode == 200) {
                System.out.println("✅ BG removed. Overwriting file...");

                // Suprascrie fișierul original cu răspunsul (imaginea fără background)
                try (InputStream in = connection.getInputStream();
                     FileOutputStream out = new FileOutputStream(file)) {
                    byte[] buffer = new byte[8192];
                    int bytesRead;
                    while ((bytesRead = in.read(buffer)) != -1) {
                        out.write(buffer, 0, bytesRead);
                    }
                }

            } else {
                System.out.println("❌ Server returned error code: " + responseCode);
            }

            connection.disconnect();

        } catch (IOException e) {
            System.out.println("💥 Eroare la sendToFlaskRemoveBg:");
            e.printStackTrace();
        }
    }

    private String saveClothingItemImage(Long id, String tempFileName) {
        try {
            String fileNameOnly = Paths.get(tempFileName).getFileName().toString();
            Path tempPath = Paths.get("uploads/clothing").resolve(fileNameOnly);

            if (!Files.exists(tempPath)) {
                throw new RuntimeException("Fișierul temporar nu există.");
            }

            String finalFileName = "clothing_" + id + ".webp";
            Path finalPath = Paths.get("uploads/clothing").resolve(finalFileName);

            Files.move(tempPath, finalPath, StandardCopyOption.REPLACE_EXISTING);


            return "/uploads/clothing/" + finalFileName;
        } catch (IOException e) {
            throw new RuntimeException("Eroare la salvarea finală a imaginii", e);
        }
    }

    public VisionAnalysisResponse uploadTemporaryImage(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Fișierul este gol");
            }

            String fileName = "temp_" + UUID.randomUUID() + ".webp";
            Path uploadPath = Paths.get("uploads/clothing");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, file.getBytes());

            sendToFlaskRemoveBg(filePath.toString());

            Map<String, Object> visionData = visionService.detectLabelsAndColorsFromFilename(fileName);
            List<String> labels = (List<String>) visionData.get("labels");
            List<String> colors = (List<String>) visionData.get("colors");
            String brand = (String) visionData.get("brand");

            // ✅ Mapăm categoria
            String suggestedCategory = categoryMapperService.mapLabelToCategory(labels);
            List<ColorInfo> topColors = colorMapperService.mapAndGroupColors(colors);

            return new VisionAnalysisResponse(fileName, suggestedCategory, topColors, brand);

        } catch (IOException e) {
            throw new RuntimeException("Eroare la salvarea imaginii temporare", e);
        } catch (Exception e) {
            throw new RuntimeException("Eroare la analiza Vision", e);
        }
    }



    public ResponseEntity<Resource> serveClothingImage(String filename) {
        try {
            if (!filename.endsWith(".webp")) {
                filename += ".webp";
            }

            Path filePath = Paths.get("uploads/clothing").resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok().body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    public List<ClothingItem> getClothingItemsByUser(Long userId) {
        return clothingItemRepository.findByOwnerId(userId);
    }

    public Optional<ClothingItem> getClothingItemById(Long id) {
        return clothingItemRepository.findById(id);
    }

    public boolean deleteClothingItem(Long id) {
        if (clothingItemRepository.existsById(id)) {
            clothingItemRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
