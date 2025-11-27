import cv2
import numpy as np
import os

def extract_features(img_path):

    # 1️⃣ Validate file exists
    if not os.path.exists(img_path):
        raise ValueError(f"Image path does not exist: {img_path}")

    # 2️⃣ Load image
    img = cv2.imread(img_path)

    # 3️⃣ Validate image loaded successfully
    if img is None:
        raise ValueError(f"Failed to load image. File may be corrupted or unreadable: {img_path}")

    # 4️⃣ Convert to RGB
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # 5️⃣ Extract RGB channels
    R, G, B = img[:,:,0], img[:,:,1], img[:,:,2]

    avg_R = np.mean(R)
    avg_G = np.mean(G)
    avg_B = np.mean(B)

    # 6️⃣ Compute green dominance ratio
    green_ratio = np.sum((G > R) & (G > B)) / (img.shape[0] * img.shape[1])

    return [avg_R, avg_G, avg_B, green_ratio]


def calculate_carbon_points(label):
    if label == "High Green":
        return 100
    elif label == "Moderate Green":
        return 50
    elif label == "Low Green":
        return 10
    else:
        return 0
