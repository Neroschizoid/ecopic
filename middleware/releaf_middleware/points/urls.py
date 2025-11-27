from django.urls import path
from .views import calculate_reward_points, health_check

urlpatterns = [
    path('reward/', calculate_reward_points, name='calculate_reward'),
    path('health/', health_check, name='health_check'),
]
