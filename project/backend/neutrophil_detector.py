"""
YOLOv8 Neutrophil Detector Integration
========================================
Integration module for using trained YOLOv8 model in Flask backend
"""

import os
from pathlib import Path
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import io

class NeutrophilDetector:
    """
    Wrapper class for YOLOv8 neutrophil detection
    """
    
    def __init__(self, model_path=None):
        """
        Initialize detector with trained model
        
        Args:
            model_path: Path to trained .pt model (default: best.pt from training)
        """
        if model_path is None:
            model_path = 'runs/neutrophil_detection/yolov8_neutrophil/weights/best.pt'
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model not found at {model_path}\n"
                f"Please train the model first: python train_neutrophil_yolo.py"
            )
        
        print(f"Loading YOLOv8 model from {model_path}...")
        self.model = YOLO(model_path)
        self.model_path = model_path
        print("✓ Model loaded successfully")
    
    def predict(self, image_source, conf=0.5):
        """
        Detect neutrophils in image
        
        Args:
            image_source: Path to image, numpy array, or PIL Image
            conf: Confidence threshold (0-1)
        
        Returns:
            dict with detections and metadata
        """
        # Get image info
        if isinstance(image_source, str):
            image = cv2.imread(image_source)
            img_path = image_source
        elif isinstance(image_source, np.ndarray):
            image = image_source
            img_path = None
        else:
            image = np.array(image_source)
            img_path = None
        
        # Store original for visualization
        original = image.copy()
        h, w = image.shape[:2]
        
        # Run detection
        results = self.model.predict(source=image, conf=conf, verbose=False)
        
        detections = []
        if results and results[0].boxes:
            for box in results[0].boxes:
                # Get coordinates (x1, y1, x2, y2 in pixels)
                coords = box.xyxy[0].cpu().numpy()
                x1, y1, x2, y2 = coords
                
                # Get confidence
                confidence = float(box.conf[0])
                
                # Get class (should be 0 = neutrophil)
                class_id = int(box.cls[0])
                
                detection = {
                    'x1': float(x1),
                    'y1': float(y1),
                    'x2': float(x2),
                    'y2': float(y2),
                    'width': float(x2 - x1),
                    'height': float(y2 - y1),
                    'confidence': confidence,
                    'class': 'Neutrophil',
                    'class_id': class_id,
                }
                detections.append(detection)
        
        return {
            'success': True,
            'image_shape': (h, w),
            'neutrophil_count': len(detections),
            'detections': detections,
            'metadata': {
                'model': 'YOLOv8n',
                'confidence_threshold': conf,
                'image_path': img_path,
            }
        }
    
    def predict_batch(self, image_paths, conf=0.5):
        """
        Detect neutrophils in multiple images
        
        Args:
            image_paths: List of image paths
            conf: Confidence threshold
        
        Returns:
            List of detection results
        """
        results = []
        for img_path in image_paths:
            result = self.predict(img_path, conf=conf)
            results.append(result)
        return results
    
    def draw_detections(self, image_source, detections, thickness=2, color=(0, 255, 0)):
        """
        Draw bounding boxes on image
        
        Args:
            image_source: Image path or array
            detections: List of detections from predict()
            thickness: Box line thickness
            color: RGB color tuple
        
        Returns:
            numpy array with drawn boxes
        """
        if isinstance(image_source, str):
            image = cv2.imread(image_source)
        else:
            image = image_source.copy() if isinstance(image_source, np.ndarray) else np.array(image_source)
        
        # Draw boxes
        for det in detections:
            x1, y1, x2, y2 = int(det['x1']), int(det['y1']), int(det['x2']), int(det['y2'])
            conf = det['confidence']
            
            # Draw rectangle
            cv2.rectangle(image, (x1, y1), (x2, y2), color, thickness)
            
            # Draw label
            label = f"Neutrophil {conf:.2%}"
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.5
            font_thickness = 1
            
            # Get text size for background
            (text_w, text_h), baseline = cv2.getTextSize(label, font, font_scale, font_thickness)
            
            # Draw background rectangle
            cv2.rectangle(image, (x1, y1 - text_h - baseline - 5), 
                         (x1 + text_w + 5, y1), color, -1)
            
            # Draw text
            cv2.putText(image, label, (x1 + 2, y1 - baseline - 2), 
                       font, font_scale, (0, 0, 0), font_thickness)
        
        return image
    
    def get_statistics(self, detections):
        """
        Calculate statistics from detections
        
        Args:
            detections: List of detections from predict()
        
        Returns:
            dict with statistics
        """
        if not detections:
            return {
                'total_neutrophils': 0,
                'avg_confidence': 0,
                'avg_size': 0,
                'size_range': None,
            }
        
        confidences = [d['confidence'] for d in detections]
        sizes = [d['width'] * d['height'] for d in detections]
        
        return {
            'total_neutrophils': len(detections),
            'avg_confidence': np.mean(confidences),
            'min_confidence': np.min(confidences),
            'max_confidence': np.max(confidences),
            'avg_size': np.mean(sizes),
            'size_range': (np.min(sizes), np.max(sizes)),
        }


# Flask integration example
def setup_neutrophil_detector(app):
    """
    Initialize detector and add routes to Flask app
    
    Usage:
        app = Flask(__name__)
        setup_neutrophil_detector(app)
    """
    try:
        detector = NeutrophilDetector()
        print("✓ Neutrophil detector initialized")
        
        @app.route('/api/detect-neutrophils', methods=['POST'])
        def detect_neutrophils():
            """Detect neutrophils in uploaded image"""
            from flask import request, jsonify
            
            if 'file' not in request.files:
                return jsonify({'error': 'No file provided'}), 400
            
            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            
            try:
                # Read image
                file_bytes = file.read()
                nparr = np.frombuffer(file_bytes, np.uint8)
                image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                # Get threshold from request
                conf = float(request.args.get('conf', 0.5))
                
                # Detect
                result = detector.predict(image, conf=conf)
                
                return jsonify(result), 200
                
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        
        @app.route('/api/detector-info', methods=['GET'])
        def detector_info():
            """Get detector information"""
            from flask import jsonify
            return jsonify({
                'model': 'YOLOv8n',
                'model_path': detector.model_path,
                'status': 'ready',
            }), 200
        
        return detector
        
    except FileNotFoundError as e:
        print(f"⚠️  {e}")
        return None


if __name__ == '__main__':
    """Test detector"""
    import json
    
    # Initialize
    try:
        detector = NeutrophilDetector()
    except FileNotFoundError as e:
        print(f"❌ {e}")
        exit(1)
    
    # Example: Predict on test image
    print("\n" + "="*60)
    print("DETECTOR TEST")
    print("="*60)
    
    # Find a test image
    test_image = 'dataset/images/val/image1.jpg'  # Update with your image
    
    if os.path.exists(test_image):
        print(f"\nTesting on: {test_image}")
        
        # Predict
        result = detector.predict(test_image)
        
        print(f"\nResults:")
        print(f"  Neutrophils detected: {result['neutrophil_count']}")
        
        for i, det in enumerate(result['detections'], 1):
            print(f"\n  Neutrophil {i}:")
            print(f"    Position: ({det['x1']:.0f}, {det['y1']:.0f})")
            print(f"    Size: {det['width']:.0f} x {det['height']:.0f}")
            print(f"    Confidence: {det['confidence']:.2%}")
        
        # Statistics
        stats = detector.get_statistics(result['detections'])
        print(f"\nStatistics:")
        print(f"  Total: {stats['total_neutrophils']}")
        print(f"  Avg Confidence: {stats['avg_confidence']:.2%}")
        print(f"  Avg Size: {stats['avg_size']:.0f} pixels")
        
    else:
        print(f"⚠️  Test image not found: {test_image}")
        print(f"   Add images to dataset/images/val/ first")
