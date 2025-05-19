from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import json
import os
from tensorflow.keras.preprocessing import image
from PIL import Image

app = Flask(__name__)

model = tf.keras.models.load_model("fashion_multi_task_model.h5")
needed_cols = ['subCategory', 'articleType', 'baseColour', 'season', 'usage']

index_to_label = {}
for col in needed_cols:
    with open(f"mappings/{col}_mapping.json", "r") as f:
        class_indices = json.load(f)
        index_to_label[col] = {v: k for k, v in class_indices.items()}

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    img = Image.open(file).convert("RGB").resize((224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0

    predictions = model.predict(img_array)
    results = {}

    for i, col in enumerate(needed_cols):
        pred_index = int(np.argmax(predictions[i][0]))
        results[col] = index_to_label[col][pred_index]

    return jsonify(results)

if __name__ == "__main__":
    app.run(port=5005)
