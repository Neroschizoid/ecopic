import cv2
import numpy as np
import os
import joblib
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split

# Correct absolute dataset path
DATASET_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dataset"))

print("Dataset path is:", DATASET_PATH)
print("Dataset exists:", os.path.isdir(DATASET_PATH))

def extract_features(img_path):
    img = cv2.imread(img_path)
    if img is None:
        print("FAILED to read:", img_path)
        return None

    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    R = img[:, :, 0]
    G = img[:, :, 1]
    B = img[:, :, 2]

    avg_R = np.mean(R)
    avg_G = np.mean(G)
    avg_B = np.mean(B)

    green_ratio = np.sum((G > R) & (G > B)) / (img.shape[0] * img.shape[1])

    return [avg_R, avg_G, avg_B, green_ratio]


# Preparing dataset
X, y = [], []
classes = ["low", "medium", "high"]

for label, class_name in enumerate(classes):

    folder_path = os.path.join(DATASET_PATH, class_name)

    print("\nChecking folder:", folder_path)
    print("Folder exists:", os.path.isdir(folder_path))
    print("Files:", os.listdir(folder_path))

    for file in os.listdir(folder_path):
        if file.lower().endswith((".png", ".jpg", ".jpeg")):
            img_path = os.path.join(folder_path, file)
            print("Reading:", img_path)

            features = extract_features(img_path)
            if features is not None:
                X.append(features)
                y.append(label)


print("\nTotal samples collected:", len(X))

# Check if dataset is empty
if len(X) == 0:
    print("ERROR: No images found. Cannot train model.")
    exit()

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = DecisionTreeClassifier(max_depth=4, random_state=42)
model.fit(X_train, y_train)

# Accuracy
print("\nTraining Accuracy:", model.score(X_train, y_train))
print("Testing Accuracy:", model.score(X_test, y_test))

# Save model
output_path = os.path.join(os.path.dirname(__file__), "green_classifier.pkl")
joblib.dump(model, output_path)

print("\nModel saved to:", output_path)
