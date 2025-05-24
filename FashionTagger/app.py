from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import json
import os
from tensorflow.keras.preprocessing import image
from PIL import Image
import logging
import traceback

# Configurare logging
logging.basicConfig(level=logging.DEBUG)
app = Flask(__name__)

# Încărcare model
try:
    model = tf.keras.models.load_model("fashion_multi_task_model.h5")
    app.logger.info("✅ Model loaded successfully.")
except Exception as e:
    app.logger.error("❌ Failed to load model: %s", traceback.format_exc())
    raise e

# Încărcare mappinguri
needed_cols = ['subCategory', 'articleType', 'baseColour', 'season', 'usage']
index_to_label = {}

try:
    for col in needed_cols:
        with open(f"mappings/{col}_mapping.json", "r") as f:
            class_indices = json.load(f)
            index_to_label[col] = {v: k for k, v in class_indices.items()}
    app.logger.info("✅ All mappings loaded.")
except Exception as e:
    app.logger.error("❌ Failed to load mappings: %s", traceback.format_exc())
    raise e

@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        file = request.files["image"]
        app.logger.info("📷 Image received: %s", file.filename)

        try:
            img = Image.open(file)
            img.verify()  # Verificare integritate imagine
            file.seek(0)  # Repozitionare cursor după verify()
            img = Image.open(file).convert("RGB").resize((224, 224))
        except Exception as e:
            app.logger.error("❌ Invalid image: %s", traceback.format_exc())
            return jsonify({"error": "Invalid image format", "details": str(e)}), 400

        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0) / 255.0

        predictions = model.predict(img_array)
        app.logger.debug("🔍 Raw predictions: %s", predictions)

        if len(predictions) != len(needed_cols):
            app.logger.error("❌ Prediction output mismatch: expected %d, got %d",
                             len(needed_cols), len(predictions))
            return jsonify({
                "error": "Prediction output mismatch",
                "expected_outputs": len(needed_cols),
                "received_outputs": len(predictions)
            }), 500

        results = {}
        for i, col in enumerate(needed_cols):
            pred_index = int(np.argmax(predictions[i][0]))
            if pred_index not in index_to_label[col]:
                app.logger.error("❌ Invalid prediction index %d for column %s", pred_index, col)
                return jsonify({
                    "error": "Invalid prediction index",
                    "column": col,
                    "index": pred_index
                }), 500
            results[col] = index_to_label[col][pred_index]

        app.logger.info("✅ Prediction successful: %s", results)
        return jsonify(results), 200

    except Exception as e:
        app.logger.error("🔥 Internal server error: %s", traceback.format_exc())
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5005)
