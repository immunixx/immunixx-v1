# YOLOv8 Neutrophil Detection - Quick Start Guide

## 📋 Prerequisites

### 1. Your Dataset
You need:
- **Images**: Blood smear microscopy images (.jpg, .png)
- **Annotations**: Bounding boxes around neutrophils

### 2. Annotation Formats Supported
- ✅ COCO JSON format (from Roboflow, Labelimg JSON)
- ✅ Pascal VOC XML format (from LabelImg XML)
- ✅ YOLO format (.txt files with normalized coordinates)
- ✅ Raw images (we'll create empty labels)

---

## 🚀 Quick Start

### Step 1: Prepare Your Dataset

**Option A: If you have COCO annotations (JSON)**
```bash
cd backend
python prepare_dataset.py coco annotations.json path/to/images/ dataset/labels/
python prepare_dataset.py split dataset/images_combined/ dataset/labels/ 0.8
```

**Option B: If you have Pascal VOC annotations (XML)**
```bash
cd backend
python prepare_dataset.py voc path/to/xml_files/ dataset/labels/
python prepare_dataset.py split dataset/images_combined/ dataset/labels/ 0.8
```

**Option C: Manual - Copy files directly**
1. Copy training images to: `backend/dataset/images/train/`
2. Copy validation images to: `backend/dataset/images/val/`
3. Add corresponding `.txt` label files in `backend/dataset/labels/train/` and `backend/dataset/labels/val/`

### Step 2: Verify Dataset
```bash
python prepare_dataset.py verify dataset/
```

Expected output:
```
✓ train_images: 80 files
✓ val_images: 20 files
✓ train_labels: 80 files
✓ val_labels: 20 files
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Train Model
```bash
python train_neutrophil_yolo.py
```

This will:
- Load YOLOv8 Nano model
- Train for 50 epochs
- Display accuracy metrics (mAP, Precision, Recall)
- Save best model to `runs/neutrophil_detection/`

### Step 5: Check Results
```
runs/neutrophil_detection/yolov8_neutrophil/
├── weights/
│   └── best.pt              # ⭐ Use this model for inference
├── metrics.json             # Accuracy metrics
├── confusion_matrix.png     # Visual analysis
└── results.png              # Training plots
```

---

## 📊 Understanding Accuracy Metrics

After training, you'll see output like:

```
✅ ACCURACY RESULTS

📦 BOUNDING BOX METRICS:
   mAP50:    0.8543
   mAP50-95: 0.6234
   Precision: 0.8765
   Recall:   0.8234
```

### What These Mean:

| Metric | Meaning | Good Range |
|--------|---------|-----------|
| **mAP@0.5** | Accuracy at loose matching (IoU ≥ 0.5) | > 0.80 |
| **mAP@0.5:0.95** | Accuracy at strict matching (IoU 0.5-0.95) | > 0.60 |
| **Precision** | Of predicted neutrophils, how many were correct | > 0.85 |
| **Recall** | Of actual neutrophils, how many were found | > 0.80 |

### Interpretation:
- ✅ **mAP > 0.80**: Model is ready for production
- ⚠️ **mAP 0.60-0.80**: Model is decent, can improve with more data
- ❌ **mAP < 0.60**: Model needs improvement (more data or training)

---

## 📝 Label Format Reference

Each image needs a `.txt` label file with same name.

### YOLO Format
```
class_id x_center y_center width height
```

**Example** (neutrophil.txt):
```
0 0.523 0.456 0.289 0.345
```

- `class_id` = 0 (neutrophil)
- `x_center` = 0.523 (52.3% from left)
- `y_center` = 0.456 (45.6% from top)
- `width` = 0.289 (28.9% of image width)
- `height` = 0.345 (34.5% of image height)

### Converting Annotations

**From pixel coordinates to YOLO:**
```python
# Pixel: (x_min, y_min, x_max, y_max) = (100, 150, 250, 350)
# Image size: 1000x1000

x_center = (100 + 250) / 2 / 1000 = 0.175
y_center = (150 + 350) / 2 / 1000 = 0.250
width = (250 - 100) / 1000 = 0.150
height = (350 - 150) / 1000 = 0.200

# YOLO: 0 0.175 0.250 0.150 0.200
```

---

## 🔧 Using the Trained Model

### In Python
```python
from ultralytics import YOLO

# Load model
model = YOLO('runs/neutrophil_detection/yolov8_neutrophil/weights/best.pt')

# Predict
results = model.predict(source='blood_smear.jpg', conf=0.5)

# Process predictions
for result in results:
    for box in result.boxes:
        x1, y1, x2, y2 = box.xyxy[0]
        confidence = box.conf[0]
        print(f"Neutrophil: ({x1:.0f}, {y1:.0f}) - ({x2:.0f}, {y2:.0f}), Conf: {confidence:.2%}")
```

### In Flask API
Add to `backend/main.py`:
```python
from ultralytics import YOLO

model = YOLO('runs/neutrophil_detection/yolov8_neutrophil/weights/best.pt')

@app.post('/detect-neutrophils')
async def detect_neutrophils(file: UploadFile):
    # Save image
    image_data = await file.read()
    
    # Run detection
    results = model.predict(source=image_data)
    
    # Return detections
    detections = []
    for result in results:
        for box in result.boxes:
            detections.append({
                'x1': float(box.xyxy[0][0]),
                'y1': float(box.xyxy[0][1]),
                'x2': float(box.xyxy[0][2]),
                'y2': float(box.xyxy[0][3]),
                'confidence': float(box.conf[0])
            })
    
    return {'neutrophils': detections}
```

---

## 🐛 Troubleshooting

### No labels found
```
⚠️ WARNING: No training or validation images found!
```
**Solution**: Add images to `backend/dataset/images/train/` and `backend/dataset/images/val/`

### ModuleNotFoundError: No module named 'ultralytics'
```bash
pip install ultralytics
```

### CUDA out of memory
Edit `train_neutrophil_yolo.py`:
```python
BATCH_SIZE = 8  # Reduce from 16
```

### Low accuracy (mAP < 0.60)
- Collect more images (aim for 100+)
- Ensure annotations are accurate
- Train longer: increase `EPOCHS` to 100

### Model overfitting (train loss << val loss)
- Reduce batch size
- Add more data
- Use data augmentation

---

## 📁 Directory Structure

```
backend/
├── dataset/
│   ├── images/
│   │   ├── train/          # 70-80% of images
│   │   └── val/            # 20-30% of images
│   ├── labels/
│   │   ├── train/          # .txt files matching train images
│   │   └── val/            # .txt files matching val images
│   └── data.yaml           # Dataset config
├── train_neutrophil_yolo.py  # Training script
├── prepare_dataset.py        # Data prep utility
├── runs/
│   └── neutrophil_detection/
│       └── yolov8_neutrophil/
│           ├── weights/
│           │   └── best.pt  # ⭐ Best trained model
│           ├── metrics.json # Final metrics
│           └── results.png  # Training plots
└── requirements.txt
```

---

## 📚 Resources

- [YOLOv8 Official Docs](https://docs.ultralytics.com/)
- [Custom Data Training](https://docs.ultralytics.com/datasets/detect/)
- [Roboflow Dataset Formats](https://roboflow.com/)
- [LabelImg Tool](https://github.com/heartexlabs/labelImg)

---

## 💡 Tips for Best Results

1. **Data Quality**: Ensure consistent image quality and clear annotations
2. **Data Variety**: Include neutrophils at different sizes, positions, and conditions
3. **Balanced Data**: Have roughly equal distribution across train/val
4. **Label Accuracy**: Double-check annotations are correct
5. **Training Time**: Start with 50 epochs, increase if accuracy improves
6. **Model Size**: YOLOv8n is fast but less accurate; use YOLOv8m for better results if you have GPU

---

**Ready to train?** Run:
```bash
cd backend
python train_neutrophil_yolo.py
```
