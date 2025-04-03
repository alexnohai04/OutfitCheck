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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class VisionService {

    @Value("${google.cloud.credentials.location}")
    private String credentialsPath;

    private static final String UPLOADS_FOLDER = "uploads/clothing";

    public Map<String, Object> detectLabelsAndColorsFromFilename(String filename) throws Exception {
        Path imagePath = Paths.get("uploads/clothing").resolve(filename).normalize();

        if (!Files.exists(imagePath)) {
            throw new FileNotFoundException("Fișierul nu există: " + imagePath);
        }

        try (InputStream inputStream = Files.newInputStream(imagePath)) {
            return detectLabelsAndColors(inputStream);
        }
    }

    private Map<String, Object> detectLabelsAndColors(InputStream imageInputStream) throws Exception {
        GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream(credentialsPath));
        ImageAnnotatorSettings settings = ImageAnnotatorSettings.newBuilder()
                .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                .build();

        List<String> labels = new ArrayList<>();
        List<String> colors = new ArrayList<>();

        try (ImageAnnotatorClient vision = ImageAnnotatorClient.create(settings)) {
            ByteString imgBytes = ByteString.readFrom(imageInputStream);
            Image img = Image.newBuilder().setContent(imgBytes).build();

            // Adăugăm ambele tipuri de analiză
            Feature labelDetection = Feature.newBuilder().setType(Feature.Type.LABEL_DETECTION).build();
            Feature colorDetection = Feature.newBuilder().setType(Feature.Type.IMAGE_PROPERTIES).build();

            AnnotateImageRequest request = AnnotateImageRequest.newBuilder()
                    .addFeatures(labelDetection)
                    .addFeatures(colorDetection)
                    .setImage(img)
                    .build();

            BatchAnnotateImagesResponse response = vision.batchAnnotateImages(List.of(request));
            AnnotateImageResponse res = response.getResponses(0);

            if (res.hasError()) {
                throw new RuntimeException("Eroare Vision API: " + res.getError().getMessage());
            }

            // Etichete
            for (EntityAnnotation annotation : res.getLabelAnnotationsList()) {
                labels.add(annotation.getDescription());
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
        }

        Map<String, Object> result = new HashMap<>();
        result.put("labels", labels);
        result.put("colors", colors);

        return result;
    }

}
