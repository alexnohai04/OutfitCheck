package org.example.outfitcheck.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.vision.v1.*;
import com.google.protobuf.ByteString;
import com.google.api.gax.core.FixedCredentialsProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
public class VisionService {

    @Value("${google.cloud.credentials.location}")
    private String credentialsPath;

    private static final String UPLOADS_FOLDER = "uploads/clothing";

    public Map<String, Object> detectLabelsAndColorsFromFilename(String filename) throws Exception {
        Path imagePath = Paths.get(UPLOADS_FOLDER).resolve(filename).normalize();

        if (!Files.exists(imagePath)) {
            throw new FileNotFoundException("Fișierul nu există: " + imagePath);
        }

        try (InputStream inputStream = Files.newInputStream(imagePath)) {
            return detectData(inputStream);
        }
    }

    private Map<String, Object> detectData(InputStream imageInputStream) throws Exception {
        GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream(credentialsPath));
        ImageAnnotatorSettings settings = ImageAnnotatorSettings.newBuilder()
                .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                .build();

        List<String> detectedObjects = new ArrayList<>();
        List<String> colors = new ArrayList<>();
        String brand = null;

        try (ImageAnnotatorClient vision = ImageAnnotatorClient.create(settings)) {
            ByteString imgBytes = ByteString.readFrom(imageInputStream);
            Image img = Image.newBuilder().setContent(imgBytes).build();

            Feature objectDetection = Feature.newBuilder().setType(Feature.Type.OBJECT_LOCALIZATION).build();
            Feature colorDetection = Feature.newBuilder().setType(Feature.Type.IMAGE_PROPERTIES).build();
            Feature logoDetection = Feature.newBuilder().setType(Feature.Type.LOGO_DETECTION).build();

            AnnotateImageRequest request = AnnotateImageRequest.newBuilder()
                    .addFeatures(objectDetection)
                    .addFeatures(colorDetection)
                    .addFeatures(logoDetection)
                    .setImage(img)
                    .build();

            BatchAnnotateImagesResponse response = vision.batchAnnotateImages(List.of(request));
            AnnotateImageResponse res = response.getResponses(0);

            if (res.hasError()) {
                throw new RuntimeException("Eroare Vision API: " + res.getError().getMessage());
            }

            // Obiecte detectate (înlocuim label detection)
            for (LocalizedObjectAnnotation obj : res.getLocalizedObjectAnnotationsList()) {
                detectedObjects.add(obj.getName());
            }

            // Culori dominante
            if (res.hasImagePropertiesAnnotation()) {
                for (ColorInfo colorInfo : res.getImagePropertiesAnnotation().getDominantColors().getColorsList()) {
                    int red = (int) colorInfo.getColor().getRed();
                    int green = (int) colorInfo.getColor().getGreen();
                    int blue = (int) colorInfo.getColor().getBlue();
                    colors.add(String.format("#%02x%02x%02x", red, green, blue));
                }
            }

            // Brand (logo)
            if (!res.getLogoAnnotationsList().isEmpty()) {
                EntityAnnotation firstLogo = res.getLogoAnnotationsList().get(0);
                brand = firstLogo.getDescription();
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("objects", detectedObjects);
        result.put("colors", colors);
        result.put("brand", brand);

        return result;
    }
}
