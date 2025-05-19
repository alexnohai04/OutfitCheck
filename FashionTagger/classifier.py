import tensorflow as tf
import numpy as np
import json
import os
from tensorflow.keras.preprocessing import image

# Obține folderul curent (acolo unde e scriptul)
current_dir = os.path.dirname(os.path.abspath(__file__))

# Căile către modelul și mapping-urile tale
model_path = os.path.join(current_dir, "fashion_multi_task_model.h5")
mappings_folder = os.path.join(current_dir, "mappings")
test_image_path = os.path.join(current_dir, "clothing_152.webp")  # <-- Înlocuiește cu imaginea ta

# Task-urile în ordinea corectă
needed_cols = ['subCategory', 'articleType', 'baseColour', 'season', 'usage']

# Încarcă modelul
model = tf.keras.models.load_model(model_path)
print("✅ Model încărcat cu succes.")

# Încarcă toate mapping-urile într-un dict
index_to_label = {}
for col in needed_cols:
    class_indices_path = os.path.join(mappings_folder, f"{col}_mapping.json")
    with open(class_indices_path, "r") as f:
        class_indices = json.load(f)
    index_to_label[col] = {v: k for k, v in class_indices.items()}

print("✅ Mapping-urile încărcate cu succes.")

# Încarcă și pregătește imaginea
img = image.load_img(test_image_path, target_size=(224, 224))
img_array = image.img_to_array(img)
img_array = np.expand_dims(img_array, axis=0)
img_array = img_array / 255.0

# Rulează predicția
predictions = model.predict(img_array)

# Afișează rezultatul pentru fiecare task
print("\n🎯 Predicții pentru imagine:")
for i, col in enumerate(needed_cols):
    pred_index = np.argmax(predictions[i][0])
    pred_label = index_to_label[col][pred_index]
    print(f"{col}: {pred_label}")

print("✅ TensorFlow:", tf.__version__)
print("🐍 Python:", sys.version)