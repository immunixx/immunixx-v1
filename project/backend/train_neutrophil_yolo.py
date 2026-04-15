"""
YOLOv8 Training Script for Neutrophil Detection
================================================
This script trains a YOLOv8 model to detect neutrophils in microscopy images.

Usage:
    python train_neutrophil_yolo.py

Requirements:
    - ultralytics (YOLOv8)
    - torch
    - opencv
"""

import os
import sys
from pathlib import Path
from ultralytics import YOLO
import torch
import json
from datetime import datetime

# Set working directory
backend_dir = Path(__file__).parent
os.chdir(backend_dir)

# Configuration
DATASET_YAML = 'dataset/data.yaml'
MODEL_NAME = 'yolov8n'  # nano model - fast training
EPOCHS = 50
IMG_SIZE = 640
BATCH_SIZE = 16
DEVICE = 0 if torch.cuda.is_available() else 'cpu'
PATIENCE = 10  # early stopping patience

def check_dataset():
    """Verify dataset structure and file counts"""
    print("\n" + "="*60)
    print("📊 DATASET VERIFICATION")
    print("="*60)
    
    dataset_root = Path('dataset')
    
    # Check directories
    train_imgs = list((dataset_root / 'images' / 'train').glob('*'))
    val_imgs = list((dataset_root / 'images' / 'val').glob('*'))
    train_labels = list((dataset_root / 'labels' / 'train').glob('*.txt'))
    val_labels = list((dataset_root / 'labels' / 'val').glob('*.txt'))
    
    train_count = len(train_imgs)
    val_count = len(val_imgs)
    
    print(f"\n✓ Training images: {train_count}")
    print(f"✓ Validation images: {val_count}")
    print(f"✓ Training labels: {len(train_labels)}")
    print(f"✓ Validation labels: {len(val_labels)}")
    
    if train_count == 0 or val_count == 0:
        print("\n⚠️  WARNING: No training or validation images found!")
        print(f"   Please add images to:")
        print(f"   - {dataset_root / 'images' / 'train'}")
        print(f"   - {dataset_root / 'images' / 'val'}")
        print(f"\n   YOLO Format Expected:")
        print(f"   - One .txt label file per image")
        print(f"   - Format: <class_id> <x> <y> <width> <height>")
        print(f"   - Coordinates normalized (0-1)")
        return False
    
    if len(train_labels) != train_count or len(val_labels) != val_count:
        print("\n⚠️  WARNING: Image/label count mismatch!")
        print(f"   Train images: {train_count}, Train labels: {len(train_labels)}")
        print(f"   Val images: {val_count}, Val labels: {len(val_labels)}")
    
    return True


def train_model():
    """Train YOLOv8 model for neutrophil detection"""
    print("\n" + "="*60)
    print("🤖 YOLOV8 NEUTROPHIL DETECTION TRAINING")
    print("="*60)
    
    # Check dataset
    if not check_dataset():
        return
    
    # Device info
    device_name = "GPU (CUDA)" if torch.cuda.is_available() else "CPU"
    print(f"\n📱 Training Device: {device_name}")
    print(f"🎯 Model: {MODEL_NAME}")
    print(f"📈 Epochs: {EPOCHS}")
    print(f"🖼️  Image Size: {IMG_SIZE}")
    print(f"📦 Batch Size: {BATCH_SIZE}")
    
    # Load model
    print(f"\n⏳ Loading {MODEL_NAME} model...")
    model = YOLO(f'{MODEL_NAME}.pt')
    
    # Train
    print("\n⏳ Starting training...")
    print("-" * 60)
    
    results = model.train(
        data=DATASET_YAML,
        epochs=EPOCHS,
        imgsz=IMG_SIZE,
        batch=BATCH_SIZE,
        device=DEVICE,
        patience=PATIENCE,
        save=True,
        project='runs/neutrophil_detection',
        name='yolov8_neutrophil',
        verbose=True,
        plots=True,
    )
    
    return results, model


def evaluate_model(model):
    """Evaluate model and display accuracy metrics"""
    print("\n" + "="*60)
    print("📊 MODEL EVALUATION & ACCURACY METRICS")
    print("="*60)
    
    # Validate
    print("\n⏳ Validating model...")
    metrics = model.val()
    
    # Extract accuracy metrics
    print("\n" + "="*60)
    print("✅ ACCURACY RESULTS")
    print("="*60)
    
    # Box metrics
    print(f"\n📦 BOUNDING BOX METRICS:")
    print(f"   mAP50:    {metrics.box.map50:.4f}")
    print(f"   mAP50-95: {metrics.box.map:.4f}")
    print(f"   Precision: {metrics.box.p.mean():.4f}")
    print(f"   Recall:   {metrics.box.r.mean():.4f}")
    
    # Overall mAP
    print(f"\n🎯 OVERALL PERFORMANCE:")
    print(f"   Mean Average Precision (mAP@0.5):   {metrics.box.map50:.4f}")
    print(f"   Mean Average Precision (mAP@0.5:0.95): {metrics.box.map:.4f}")
    
    # Save metrics
    metrics_dict = {
        'timestamp': datetime.now().isoformat(),
        'model': MODEL_NAME,
        'epochs': EPOCHS,
        'batch_size': BATCH_SIZE,
        'image_size': IMG_SIZE,
        'metrics': {
            'mAP50': float(metrics.box.map50),
            'mAP50_95': float(metrics.box.map),
            'precision': float(metrics.box.p.mean()),
            'recall': float(metrics.box.r.mean()),
        }
    }
    
    metrics_file = 'runs/neutrophil_detection/yolov8_neutrophil/metrics.json'
    os.makedirs(os.path.dirname(metrics_file), exist_ok=True)
    
    with open(metrics_file, 'w') as f:
        json.dump(metrics_dict, f, indent=2)
    
    print(f"\n💾 Metrics saved to: {metrics_file}")
    
    return metrics


def predict_sample():
    """Test prediction on sample images"""
    print("\n" + "="*60)
    print("🔮 SAMPLE PREDICTIONS")
    print("="*60)
    
    model_path = 'runs/neutrophil_detection/yolov8_neutrophil/weights/best.pt'
    
    if not os.path.exists(model_path):
        print("⚠️  Model weights not found. Training may have failed.")
        return
    
    model = YOLO(model_path)
    
    # Get sample validation images
    val_images = list(Path('dataset/images/val').glob('*'))
    
    if not val_images:
        print("⚠️  No validation images found for testing")
        return
    
    print(f"\n📸 Testing on {min(3, len(val_images))} sample images...")
    
    for img_path in val_images[:3]:
        print(f"\n  Processing: {img_path.name}")
        results = model.predict(source=str(img_path), conf=0.5)
        
        if results and results[0].boxes:
            detections = results[0].boxes
            print(f"  ✓ Detections: {len(detections)}")
            for i, box in enumerate(detections):
                confidence = float(box.conf[0])
                print(f"    - Neutrophil {i+1}: {confidence:.2%} confidence")
        else:
            print(f"  ✗ No neutrophils detected")


def main():
    """Main training pipeline"""
    try:
        print("\n" + "🧬 "*20)
        print("YOLOV8 NEUTROPHIL DETECTION - TRAINING PIPELINE")
        print("🧬 "*20)
        
        # Train
        results, model = train_model()
        
        if results and model:
            # Evaluate
            metrics = evaluate_model(model)
            
            # Sample predictions
            predict_sample()
            
            print("\n" + "="*60)
            print("✅ TRAINING COMPLETE")
            print("="*60)
            print(f"\n📁 Results saved to: runs/neutrophil_detection/yolov8_neutrophil/")
            print(f"🎯 Best model: runs/neutrophil_detection/yolov8_neutrophil/weights/best.pt")
            print(f"📊 Metrics: runs/neutrophil_detection/yolov8_neutrophil/metrics.json")
            
        else:
            print("❌ Training failed")
            
    except Exception as e:
        print(f"\n❌ Error during training: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
