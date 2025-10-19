# points/views.py - Copy this to points/views.py after Django app creation

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import random
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
def calculate_reward_points(request):
    """
    Calculate carbon credit points for a post based on the provided data.
    For now, returns a random value between 100-400 as specified.
    
    Expected POST data:
    {
        "post_id": "string",
        "user_id": "string", 
        "tags": ["tree-planting", "community"],
        "description": "string",
        "image_url": "string"
    }
    """
    try:
        data = request.data
        post_id = data.get('post_id')
        user_id = data.get('user_id')
        tags = data.get('tags', [])
        description = data.get('description', '')
        image_url = data.get('image_url')
        
        # Log the request for debugging
        logger.info(f"Processing reward calculation for post {post_id} by user {user_id}")
        logger.info(f"Tags: {tags}, Description length: {len(description) if description else 0}")
        
        # Basic validation
        if not post_id or not user_id:
            return Response(
                {'error': 'post_id and user_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # For now: random points between 100-400
        # TODO: Implement actual ML/logic-based point calculation
        base_points = random.randint(100, 400)
        
        # Future enhancement: adjust points based on tags, description, etc.
        # Example logic (commented out):
        # if 'tree-planting' in tags:
        #     base_points += 50
        # if len(description) > 100:
        #     base_points += 25
        
        response_data = {
            'post_id': post_id,
            'user_id': user_id,
            'points': base_points,
            'calculation_method': 'random_baseline',
            'timestamp': request.timestamp if hasattr(request, 'timestamp') else None
        }
        
        logger.info(f"Awarded {base_points} points to post {post_id}")
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error calculating reward points: {str(e)}")
        return Response(
            {'error': 'Internal server error during points calculation'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def health_check(request):
    """Health check endpoint for the middleware service."""
    return Response({
        'status': 'healthy',
        'service': 'releaf-points-middleware',
        'version': '1.0.0'
    })

# URL configuration to add to points/urls.py:
POINTS_URLS = '''
from django.urls import path
from . import views

urlpatterns = [
    path('reward/', views.calculate_reward_points, name='calculate_reward'),
    path('health/', views.health_check, name='health_check'),
]
'''

# Main URLs to add to releaf_middleware/urls.py:
MAIN_URLS = '''
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('points.urls')),
]
'''

print("Copy the view functions to points/views.py and URL configurations to respective files after Django setup")