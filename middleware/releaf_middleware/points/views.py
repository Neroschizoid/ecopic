from django.shortcuts import render

# Create your views here.
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

FLASK_ML_URL = "http://127.0.0.1:5000/upload"  # your Flask service


@api_view(['POST'])
def calculate_reward_points(request):
    """
    Django Middleware – now calls Flask ML service to compute real points.
    """

    try:
        data = request.data

        post_id = data.get("post_id")
        user_id = data.get("user_id")
        image_url = data.get("image_url")

        if not post_id or not user_id:
            return Response({'error': 'post_id and user_id required'}, status=400)

        if not image_url:
            return Response({'error': 'image_url required'}, status=400)

        # -------------------------------------------
        # 1. Download image from image_url
        # -------------------------------------------

        img_response = requests.get(image_url, timeout=10)

        if img_response.status_code != 200:
            return Response({'error': 'Failed to download image'}, status=400)

        # -------------------------------------------
        # 2. Send the image to Flask ML Model
        # -------------------------------------------

        files = {
            "image": ("upload.jpg", img_response.content, "image/jpeg")
        }

        flask_response = requests.post(FLASK_ML_URL, files=files)

        if flask_response.status_code != 200:
            return Response({'error': 'ML Service error'}, status=500)

        ml_output = flask_response.json()

        # -------------------------------------------
        # 3. Extract REAL ML points from Flask
        # -------------------------------------------

        points = ml_output["user_data"]["carbon_credit_points"]

        # -------------------------------------------
        # 4. Build response for main backend
        # -------------------------------------------

        response_data = {
            "post_id": post_id,
            "user_id": user_id,
            "points": points,
            "ml_label": ml_output["developer_data"]["predicted_label"],
            "ml_green_ratio": ml_output["developer_data"]["green_ratio"],
            "method": "flask_ml_integration"
        }

        logger.info(f"ML Points assigned: {points}")

        return Response(response_data, status=200)

    
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return Response({'error': str(e)}, status=500)
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def health_check(request):
    return Response({"status": "ok", "service": "releaf-middleware"})

