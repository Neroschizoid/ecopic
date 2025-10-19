#!/usr/bin/env python3
"""
Setup script to create the Django project structure for ReLeaf middleware.
Run this after installing requirements: python setup_django.py
"""

import os
import subprocess
import sys

def run_command(cmd, cwd=None):
    """Run a shell command and return the result."""
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error running: {cmd}")
            print(f"Error output: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"Exception running {cmd}: {e}")
        return False

def main():
    middleware_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("Setting up Django project for ReLeaf middleware...")
    
    # Create Django project
    if not run_command("django-admin startproject releaf_middleware .", cwd=middleware_dir):
        print("Failed to create Django project")
        sys.exit(1)
    
    # Create points app
    if not run_command("python manage.py startapp points", cwd=middleware_dir):
        print("Failed to create points app")
        sys.exit(1)
    
    print("Django project structure created successfully!")
    print("Next steps:")
    print("1. Configure settings in releaf_middleware/settings.py")
    print("2. Implement the points calculation logic in points/views.py")
    print("3. Run: python manage.py runserver 8000")

if __name__ == "__main__":
    main()