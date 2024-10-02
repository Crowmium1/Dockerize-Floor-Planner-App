# # Use official Python image as base
# FROM python:3.9-slim

# # Install dependencies
# RUN apt-get update && \
#     apt-get install -y --no-install-recommends \
#     software-properties-common

# # Add FreeCAD PPA
# RUN add-apt-repository ppa:freecad-maintainers/freecad-stable && \
#     apt-get update

# # Install FreeCAD in headless mode
# RUN apt-get install -y --no-install-recommends \
#     freecad-python3 \
#     libgl1-mesa-glx \
#     && apt-get clean && \
#     rm -rf /var/lib/apt/lists/*

# # Set environment variables
# ENV PYTHONUNBUFFERED=1

# # Set work directory
# WORKDIR /app

# # Copy requirements
# COPY requirements.txt /app/

# # Install pip dependencies
# RUN pip install --no-cache-dir --upgrade pip && \
#     pip install --no-cache-dir -r requirements.txt

# # Copy project code
# COPY . /app/

# # Expose port
# EXPOSE 8000

# # Run the application
# CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]

# Use Ubuntu as the base image
FROM ubuntu:20.04

# Set environment variables 
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/usr/lib/freecad/lib


# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    software-properties-common \
    wget \
    gnupg2 \
    python3-pip \
    freecad && \
    rm -rf /var/lib/apt/lists/*

# Add FreeCAD PPA and install FreeCAD
RUN add-apt-repository ppa:freecad-maintainers/freecad-stable && \
    apt-get update && \
    apt-get install -y --no-install-recommends freecad && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Install FreeCAD and Python bindings
RUN apt-get update && apt-get install -y freecad freecad-python3

# Copy the backend's requirements.txt and install dependencies
COPY backend/requirements.txt /app/requirements.txt
RUN pip3 install --upgrade pip && pip3 install -r /app/requirements.txt

# Copy project code to the container
COPY . /app/

# Expose port 8000 for FastAPI
EXPOSE 8000

# Start the FastAPI app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]