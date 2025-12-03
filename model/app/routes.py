from flask import Blueprint, request, jsonify
from app.utils import extract_features, calculate_carbon_points
from model.model_loader import model, label_map
import os

bp = Blueprint('api', __name__)
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@bp.route('/upload', methods=['POST'])
def upload_image():

    # 1️⃣ Check if file exists in the request
    if "image" not in request.files:
        return jsonify({"error": "No file part 'image' in request"}), 400

    file = request.files["image"]

    # 2️⃣ Check if filename is valid
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    # 3️⃣ Save file safely
    path = os.path.join(UPLOAD_DIR, file.filename)
    print("Saving file to:", path)
    file.save(path)

    # 4️⃣ Validate saved file exists
    if not os.path.exists(path):
        return jsonify({"error": "File failed to save on server"}), 500

    # 5️⃣ Extract image features
    try:
        features = extract_features(path)
    except Exception as e:
        return jsonify({"error": f"Failed to process image: {str(e)}"}), 500

    # 6️⃣ Make ML prediction
    try:
        pred_class = model.predict([features])[0]
        label = label_map[pred_class]
    except Exception as e:
        return jsonify({"error": f"Model prediction failed: {str(e)}"}), 500

    # 7️⃣ Calculate eco-points
    points = calculate_carbon_points(label)

    # 8️⃣ Build response
    response = {
        "developer_data": {
            "avg_R": features[0],
            "avg_G": features[1],
            "avg_B": features[2],
            "green_ratio": features[3],
            "predicted_label": label
        },
        "user_data": {
            "carbon_credit_points": points,
            "message": f"Your image was classified as '{label}'. You earned {points} eco-credits!"
        }
    }

    return jsonify(response)
