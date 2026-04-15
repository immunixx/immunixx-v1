"""
Dataset Preparation Utility for YOLOv8
========================================
Convert annotations from various formats to YOLO format and prepare dataset.
"""

import os
import json
import xml.etree.ElementTree as ET
from pathlib import Path
from shutil import copy2
import random


def normalize_coordinates(x, y, width, height, img_width, img_height):
    """Convert pixel coordinates to normalized YOLO format"""
    x_center = (x + width/2) / img_width
    y_center = (y + height/2) / img_height
    norm_width = width / img_width
    norm_height = height / img_height
    
    return x_center, y_center, norm_width, norm_height


def coco_to_yolo(coco_json, output_dir, img_dir):
    """
    Convert COCO format annotations to YOLO format
    
    COCO format: {"annotations": [{"id": 1, "image_id": 1, "bbox": [x, y, w, h], "category_id": 1}]}
    """
    print(f"Converting COCO format to YOLO...")
    
    with open(coco_json, 'r') as f:
        coco_data = json.load(f)
    
    # Create image id to width/height mapping
    img_map = {img['id']: (img['width'], img['height'], img['file_name']) 
               for img in coco_data['images']}
    
    # Group annotations by image
    img_annotations = {}
    for ann in coco_data['annotations']:
        img_id = ann['image_id']
        if img_id not in img_annotations:
            img_annotations[img_id] = []
        img_annotations[img_id].append(ann)
    
    # Convert to YOLO format
    converted = 0
    for img_id, annotations in img_annotations.items():
        if img_id not in img_map:
            continue
        
        img_width, img_height, filename = img_map[img_id]
        img_name = Path(filename).stem
        
        yolo_lines = []
        for ann in annotations:
            x, y, w, h = ann['bbox']
            class_id = ann['category_id'] - 1  # Adjust for 0-indexed
            
            x_center, y_center, norm_w, norm_h = normalize_coordinates(x, y, w, h, img_width, img_height)
            yolo_lines.append(f"{class_id} {x_center:.6f} {y_center:.6f} {norm_w:.6f} {norm_h:.6f}")
        
        # Write YOLO label file
        label_file = os.path.join(output_dir, f"{img_name}.txt")
        with open(label_file, 'w') as f:
            f.write('\n'.join(yolo_lines))
        
        converted += 1
    
    print(f"✓ Converted {converted} COCO annotations to YOLO format")
    return converted


def voc_xml_to_yolo(xml_dir, output_dir):
    """
    Convert Pascal VOC XML annotations to YOLO format
    
    XML format: <object><name>class</name><bndbox><xmin> <ymin> <xmax> <ymax>
    """
    print(f"Converting Pascal VOC XML format to YOLO...")
    
    converted = 0
    for xml_file in Path(xml_dir).glob('*.xml'):
        try:
            tree = ET.parse(xml_file)
            root = tree.getroot()
            
            # Get image dimensions
            size = root.find('size')
            img_width = int(size.find('width').text)
            img_height = int(size.find('height').text)
            
            img_name = root.find('filename').text
            img_stem = Path(img_name).stem
            
            yolo_lines = []
            for obj in root.findall('object'):
                class_name = obj.find('name').text
                class_id = 0  # Neutrophil
                
                bbox = obj.find('bndbox')
                xmin = float(bbox.find('xmin').text)
                ymin = float(bbox.find('ymin').text)
                xmax = float(bbox.find('xmax').text)
                ymax = float(bbox.find('ymax').text)
                
                # Convert to YOLO format
                x = xmin
                y = ymin
                w = xmax - xmin
                h = ymax - ymin
                
                x_center, y_center, norm_w, norm_h = normalize_coordinates(x, y, w, h, img_width, img_height)
                yolo_lines.append(f"{class_id} {x_center:.6f} {y_center:.6f} {norm_w:.6f} {norm_h:.6f}")
            
            # Write YOLO label file
            label_file = os.path.join(output_dir, f"{img_stem}.txt")
            with open(label_file, 'w') as f:
                f.write('\n'.join(yolo_lines))
            
            converted += 1
            
        except Exception as e:
            print(f"✗ Error processing {xml_file}: {e}")
    
    print(f"✓ Converted {converted} VOC XML annotations to YOLO format")
    return converted


def split_dataset(images_dir, labels_dir, train_ratio=0.8, seed=42):
    """
    Split images/labels into train and validation sets
    
    Args:
        images_dir: Directory containing all images
        labels_dir: Directory containing all labels
        train_ratio: Proportion for training set (0.8 = 80% train, 20% val)
    """
    print(f"\nSplitting dataset...")
    print(f"Train ratio: {train_ratio*100:.0f}% | Validation ratio: {(1-train_ratio)*100:.0f}%")
    
    random.seed(seed)
    
    # Get all image files
    images = sorted([f for f in os.listdir(images_dir) 
                     if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))])
    
    # Shuffle
    random.shuffle(images)
    
    # Split
    split_idx = int(len(images) * train_ratio)
    train_images = images[:split_idx]
    val_images = images[split_idx:]
    
    print(f"Total images: {len(images)}")
    print(f"Train: {len(train_images)} | Val: {len(val_images)}")
    
    # Create train/val directories
    dataset_root = Path(images_dir).parent
    train_img_dir = dataset_root / 'images' / 'train'
    val_img_dir = dataset_root / 'images' / 'val'
    train_lbl_dir = dataset_root / 'labels' / 'train'
    val_lbl_dir = dataset_root / 'labels' / 'val'
    
    for d in [train_img_dir, val_img_dir, train_lbl_dir, val_lbl_dir]:
        d.mkdir(parents=True, exist_ok=True)
    
    # Move files
    for img in train_images:
        img_path = os.path.join(images_dir, img)
        lbl_path = os.path.join(labels_dir, Path(img).stem + '.txt')
        
        copy2(img_path, train_img_dir / img)
        if os.path.exists(lbl_path):
            copy2(lbl_path, train_lbl_dir / Path(img).stem + '.txt')
    
    for img in val_images:
        img_path = os.path.join(images_dir, img)
        lbl_path = os.path.join(labels_dir, Path(img).stem + '.txt')
        
        copy2(img_path, val_img_dir / img)
        if os.path.exists(lbl_path):
            copy2(lbl_path, val_lbl_dir / Path(img).stem + '.txt')
    
    print(f"✓ Dataset split complete")
    print(f"  Train: {train_img_dir}")
    print(f"  Val:   {val_img_dir}")


def verify_dataset(dataset_root):
    """Verify dataset structure and integrity"""
    print(f"\n" + "="*60)
    print("DATASET VERIFICATION")
    print("="*60)
    
    dataset_root = Path(dataset_root)
    
    # Check directories
    dirs = {
        'train_images': dataset_root / 'images' / 'train',
        'val_images': dataset_root / 'images' / 'val',
        'train_labels': dataset_root / 'labels' / 'train',
        'val_labels': dataset_root / 'labels' / 'val',
    }
    
    stats = {}
    for name, path in dirs.items():
        if not path.exists():
            print(f"✗ Missing directory: {path}")
        else:
            files = list(path.glob('*'))
            stats[name] = len(files)
            print(f"✓ {name}: {len(files)} files")
    
    # Check file matching
    print(f"\n" + "-"*60)
    for split in ['train', 'val']:
        img_dir = dataset_root / 'images' / split
        lbl_dir = dataset_root / 'labels' / split
        
        img_names = set(Path(f).stem for f in img_dir.glob('*'))
        lbl_names = set(Path(f).stem for f in lbl_dir.glob('*.txt'))
        
        missing = img_names - lbl_names
        if missing:
            print(f"⚠️  {split}: {len(missing)} images missing labels")
        else:
            print(f"✓ {split}: All images have labels")
    
    # Check label format
    print(f"\n" + "-"*60)
    print("Sample label content:")
    for lbl_file in list((dataset_root / 'labels' / 'train').glob('*.txt'))[:2]:
        print(f"\n{lbl_file.name}:")
        with open(lbl_file) as f:
            lines = f.readlines()
            for line in lines[:3]:
                print(f"  {line.strip()}")


def main():
    """Main utility menu"""
    import sys
    
    print("\n" + "🧬 "*20)
    print("YOLO DATASET PREPARATION UTILITY")
    print("🧬 "*20)
    
    if len(sys.argv) < 2:
        print("\nUsage:")
        print("  python prepare_dataset.py coco <coco_json> <images_dir> <output_labels_dir>")
        print("  python prepare_dataset.py voc  <xml_dir> <output_labels_dir>")
        print("  python prepare_dataset.py split <images_dir> <labels_dir> [train_ratio]")
        print("  python prepare_dataset.py verify <dataset_root>")
        print("\nExamples:")
        print("  python prepare_dataset.py coco annotations.json images/ labels/")
        print("  python prepare_dataset.py voc annotations_xml/ labels/")
        print("  python prepare_dataset.py split images_combined/ labels_combined/ 0.8")
        print("  python prepare_dataset.py verify dataset/")
        return
    
    cmd = sys.argv[1].lower()
    
    if cmd == 'coco' and len(sys.argv) == 5:
        coco_json = sys.argv[2]
        images_dir = sys.argv[3]
        output_dir = sys.argv[4]
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        coco_to_yolo(coco_json, output_dir, images_dir)
        
    elif cmd == 'voc' and len(sys.argv) == 4:
        xml_dir = sys.argv[2]
        output_dir = sys.argv[3]
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        voc_xml_to_yolo(xml_dir, output_dir)
        
    elif cmd == 'split' and len(sys.argv) >= 4:
        images_dir = sys.argv[2]
        labels_dir = sys.argv[3]
        train_ratio = float(sys.argv[4]) if len(sys.argv) > 4 else 0.8
        split_dataset(images_dir, labels_dir, train_ratio)
        
    elif cmd == 'verify' and len(sys.argv) == 3:
        dataset_root = sys.argv[2]
        verify_dataset(dataset_root)
        
    else:
        print(f"✗ Unknown command or incorrect arguments: {cmd}")


if __name__ == '__main__':
    main()
