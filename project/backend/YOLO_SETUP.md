# YOLOv8 Neutrophil Detection Training Guide

## Dataset Setup

### 1. Folder Structure
Your dataset should be organized as follows:

```
backend/dataset/
├── images/
│   ├── train/          # Training images
│   │   ├── img1.jpg
│   │   ├── img2.jpg
│   │   └── ...
│   └── val/            # Validation images
│       ├── img50.jpg
│       ├── img51.jpg
│       └── ...
├── labels/
│   ├── train/          # Training labels (YOLO format .txt files)
│   │   ├── img1.txt
│   │   ├── img2.txt
│   │   └── ...
│   └── val/            # Validation labels
│       ├── img50.txt
│       ├── img51.txt
│       └── ...
└── data.yaml           # Dataset config (pre-created)
```

### 2. Label Format (YOLO)

Each image must have a corresponding `.txt` file with the same name in the `labels` folder.

**Format**: One line per object (neutrophil)
```
<class_id> <x_center> <y_center> <width> <height>
```

**Example** (`image1.txt`):
```
0 0.5 0.5 0.3 0.4
0 0.7 0.3 0.25 0.35
```

**Note**: 
- `class_id` = 0 (neutrophil is the only class)
- All coordinates are **normalized** (0-1 scale)
- `x_center`, `y_center` = center of bounding box
- `width`, `height` = dimensions of bounding box

### 3. Image Requirements

- **Formats**: JPG, PNG, BMP, etc.
- **Size**: Recommended 640x640 or larger (will be resized during training)
- **Count**: Minimum 50 images recommended for basic model training
  - **Train set**: 70-80% of total (~40-60 images)
  - **Validation set**: 20-30% of total (~10-20 images)

## Converting to YOLO Format

### From Annotation Tools

If you have annotations from other tools:

**From COCO JSON** (LabelImg, Roboflow):
```python
from ultralytics.utils.ops import xywh2xyxy

# Convert COCO format to YOLO format
# COCO: [x, y, width, height] → YOLO: [x_center, y_center, width, height] (normalized)
```

**From Pascal VOC XML** (VIA, LabelImg XML):
```python
# XML coordinates are in pixel format
# Convert to normalized YOLO format
def xml_to_yolo(xml_file, img_width, img_height):
    # Parse XML, get bounding boxes
    # Normalize and center: x_center = (x_min + width/2) / img_width
    pass
```

## Training

### 1. Install Dependencies

```bash
pip install ultralytics torch opencv-python numpy
```

### 2. Run Training

```bash
cd backend
python train_neutrophil_yolo.py
```

### 3. Output

Training will create:
```
runs/neutrophil_detection/yolov8_neutrophil/
├── weights/
│   ├── best.pt          # Best model (use for inference)
│   └── last.pt          # Last epoch model
├── results.csv          # Training metrics (epoch, loss, etc.)
├── confusion_matrix.png # Confusion matrix visualization
├── metrics.json         # Final accuracy metrics
└── results.png          # Training loss/accuracy plots
```

## Accuracy Metrics Explained

After training, you'll see:

### 1. **mAP (Mean Average Precision)**
- `mAP@0.5`: Average precision at 0.5 IoU threshold (loose matching)
- `mAP@0.5:0.95`: Average precision at IoU 0.5 to 0.95 (strict matching)

**Good values**:
- `mAP@0.5 > 0.8` = Good model
- `mAP@0.5:0.95 > 0.6` = Excellent model

### 2. **Precision**
- Proportion of positive predictions that were correct
- Formula: TP / (TP + FP)
- Range: 0-1 (higher is better)

### 3. **Recall**
- Proportion of actual objects detected
- Formula: TP / (TP + FN)
- Range: 0-1 (higher is better)

### 4. **IoU (Intersection over Union)**
- Measures overlap between predicted and ground truth box
- IoU ≥ threshold = correct detection

## Using Trained Model for Inference

```python
from ultralytics import YOLO

# Load trained model
model = YOLO('runs/neutrophil_detection/yolov8_neutrophil/weights/best.pt')

# Predict on image
results = model.predict(source='image.jpg', conf=0.5)

# Access results
for result in results:
    for box in result.boxes:
        x1, y1, x2, y2 = box.xyxy[0]
        confidence = box.conf[0]
        class_id = box.cls[0]
        print(f"Neutrophil detected at ({x1}, {y1}) - ({x2}, {y2}) | Confidence: {confidence:.2%}")
```

## Integration with Flask Backend

The trained model can be integrated into your Flask API:

```python
from ultralytics import YOLO

model = YOLO('runs/neutrophil_detection/yolov8_neutrophil/weights/best.pt')

@app.route('/predict', methods=['POST'])
def predict():
    # Load image
    # Run inference with trained model
    # Return results with neutrophil detections
    pass
```

## Troubleshooting

### No/Low Accuracy
- **Cause**: Insufficient training data
- **Solution**: Collect more annotated images (100+ recommended)

### Out of Memory
- **Cause**: Batch size too large
- **Solution**: Reduce `BATCH_SIZE` in `train_neutrophil_yolo.py`

### Overfitting (High train loss, low val loss)
- **Cause**: Too much data augmentation or small dataset
- **Solution**: Use data augmentation or collect more data

### Labels Not Found
- **Cause**: Label files missing or misnamed
- **Solution**: Ensure each image has corresponding `.txt` file in `labels/` folder

## Resources

- [YOLOv8 Docs](https://docs.ultralytics.com/)
- [YOLO Format](https://docs.ultralytics.com/datasets/detect/)
- [Pascal VOC Converter](https://github.com/ultralytics/yolov5/wiki/Train-Custom-Data)
