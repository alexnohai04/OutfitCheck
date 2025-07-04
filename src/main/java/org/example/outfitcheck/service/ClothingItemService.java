package org.example.outfitcheck.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.example.outfitcheck.dto.ColorInfo;
import org.example.outfitcheck.dto.VisionAnalysisResponse;
import org.example.outfitcheck.entity.*;
import org.example.outfitcheck.repository.*;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
public class ClothingItemService {
    private final ClothingItemRepository clothingItemRepository;
    private final ClothingCategoryRepository categoryRepository;

    private final OutfitRepository outfitRepository;

    private final LoggedOutfitRepository loggedOutfitRepository;
    private final UserRepository userRepository;
    private final VisionService visionService;
    private final CategoryMapperService categoryMapperService;
    private final ColorMapperService colorMapperService;
    private final AsyncClothingService asyncClothingService;

    public ClothingItemService(ClothingItemRepository clothingItemRepository,
                               ClothingCategoryRepository categoryRepository, OutfitRepository outfitRepository, LoggedOutfitRepository loggedOutfitRepository,
                               UserRepository userRepository, VisionService visionService, CategoryMapperService categoryMapperService, ColorMapperService colorMapperService, AsyncClothingService asyncClothingService) {
        this.clothingItemRepository = clothingItemRepository;
        this.categoryRepository = categoryRepository;
        this.outfitRepository = outfitRepository;
        this.loggedOutfitRepository = loggedOutfitRepository;
        this.userRepository = userRepository;
        this.visionService = visionService;
        this.categoryMapperService = categoryMapperService;

        this.colorMapperService = colorMapperService;
        this.asyncClothingService = asyncClothingService;
    }
    public ClothingItem addClothingItemWithImageUrl(Long userId, Long categoryId, String baseColor, String brand, String imageUrl, String link, List<String> careSymbols, String articleType, String season, String usage) {
        Optional<ClothingCategory> categoryOpt = categoryRepository.findById(categoryId);
        Optional<User> userOpt = userRepository.findById(userId);

        if (categoryOpt.isEmpty()) {
            throw new IllegalArgumentException("Categoria nu există.");
        }
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Utilizatorul nu există.");
        }

        ClothingItem clothingItem = new ClothingItem();
        clothingItem.setBaseColor(baseColor);
        clothingItem.setCategory(categoryOpt.get());
        clothingItem.setOwner(userOpt.get());
        clothingItem.setBrand(brand);
        clothingItem.setLink(link);
        clothingItem.setCareSymbols(careSymbols);
        clothingItem.setArticleType(articleType);
        clothingItem.setSeason(season);
        clothingItem.setUsage(usage);
        //clothingItem.setImageUrl(imageUrl); // direct linkul complet

        clothingItem = clothingItemRepository.save(clothingItem);
        System.out.println("❌ Path-ul catre fisier: " + imageUrl);
        clothingItem.setImageUrl(saveClothingItemImage(clothingItem.getId(),imageUrl));

        return clothingItemRepository.save(clothingItem);
    }

    public List<ClothingItem> getClothingItemsByIds(List<Long> ids) {
        return clothingItemRepository.findAllById(ids);
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

            // 🔥 Trimitere în paralel
            CompletableFuture<Map<String, Object>> visionFuture = CompletableFuture.supplyAsync(() ->
                    {
                        try {
                            return visionService.detectLabelsAndColorsFromFilename(fileName);
                        } catch (Exception e) {
                            throw new RuntimeException(e);
                        }
                    }
            );

            CompletableFuture<Map<String, String>> flaskFuture = asyncClothingService.callFlaskClassifierAsync(filePath.toFile());

            // Așteaptă ambele
            CompletableFuture.allOf(visionFuture, flaskFuture).join();

            Map<String, Object> visionData = visionFuture.get();
            Map<String, String> aiData = flaskFuture.get();

            List<String> labels = (List<String>) visionData.get("objects");
            List<String> colors = (List<String>) visionData.get("colors");
            String brand = (String) visionData.get("brand");

            String suggestedCategory = categoryMapperService.mapLabelToCategory(labels);
            List<ColorInfo> topColors = colorMapperService.mapAndGroupColors(colors);

            VisionAnalysisResponse response = new VisionAnalysisResponse();
            response.setFileName(fileName);
            response.setSuggestedCategory(suggestedCategory);
            response.setTopColors(topColors);
            response.setBrand(brand);
            response.setSubCategory(aiData.get("subCategory"));
            response.setArticleType(aiData.get("articleType"));
            response.setBaseColour(aiData.get("baseColour"));
            response.setSeason(aiData.get("season"));
            response.setUsage(aiData.get("usage"));

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Eroare la analiza imaginii", e);
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

    @Transactional
    public ClothingItem toggleInLaundry(Long id) {
        ClothingItem item = clothingItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ClothingItem not found with id " + id));

        item.setInLaundry(!item.isInLaundry());
        // save() e opțional aici, dar îl folosim ca să fim siguri că persistă
        return clothingItemRepository.save(item);
    }

    public LocalDate getLastUsedDate(Long clothingItemId) {
        ClothingItem item = clothingItemRepository.findById(clothingItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Clothing item not found"));

        List<Outfit> outfits = outfitRepository.findAllByClothingItemsContaining(item);
        List<LoggedOutfit> logged = loggedOutfitRepository.findByOutfitIn(outfits);
        return logged.stream()
                .map(LoggedOutfit::getDate)
                .max(Comparator.naturalOrder())
                .orElse(null);
    }




}
