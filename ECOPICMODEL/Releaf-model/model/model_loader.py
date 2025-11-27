import joblib
import os

# Load model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "green_classifier.pkl")
model = joblib.load(MODEL_PATH)

# Map class numbers to readable labels
label_map = {0: "Low Green", 1: "Moderate Green", 2: "High Green"}
