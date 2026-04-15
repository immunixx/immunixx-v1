from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import numpy as np
from PIL import Image
import io
import uuid
from datetime import datetime
from model import WBCClassifier
from report_generator import generate_pdf_report
import os
import cv2
from neutrophil_detector import NeutrophilDetector

app = FastAPI(title="AI WBC Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

classifier = WBCClassifier()

# YOLO detector is optional at startup. If weights are missing, endpoints return 503
# with a clear message until training is completed.
try:
    neutrophil_detector = NeutrophilDetector()
except FileNotFoundError:
    neutrophil_detector = None

UPLOAD_DIR = "uploads"
REPORT_DIR = "reports"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(REPORT_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "AI WBC Analyzer API", "status": "online"}


@app.get("/api/detector-info")
async def detector_info():
    if neutrophil_detector is None:
        return {
            "status": "not_ready",
            "reason": "YOLO model weights not found",
            "expected_model": "runs/neutrophil_detection/yolov8_neutrophil/weights/best.pt",
            "next_step": "Run python train_neutrophil_yolo.py in backend directory"
        }

    return {
        "status": "ready",
        "model": "YOLOv8n",
        "model_path": neutrophil_detector.model_path,
    }


@app.post("/api/detect-neutrophils")
async def detect_neutrophils(file: UploadFile = File(...), conf: float = 0.5):
    if neutrophil_detector is None:
        raise HTTPException(
            status_code=503,
            detail="YOLO detector not ready. Train model first: python train_neutrophil_yolo.py"
        )

    if not file.content_type in ["image/jpeg", "image/jpg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG and PNG are allowed.")

    if not 0 <= conf <= 1:
        raise HTTPException(status_code=400, detail="conf must be between 0 and 1")

    contents = await file.read()

    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size too large. Maximum 10MB allowed.")

    try:
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(status_code=400, detail="Invalid or unreadable image file")

        result = neutrophil_detector.predict(image_source=image, conf=conf)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post("/api/analyze")
async def analyze_image(file: UploadFile = File(...)):
    if not file.content_type in ["image/jpeg", "image/jpg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG and PNG are allowed.")

    contents = await file.read()

    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size too large. Maximum 10MB allowed.")

    try:
        image = Image.open(io.BytesIO(contents))

        if image.mode != 'RGB':
            image = image.convert('RGB')

        results = classifier.predict(image)

        patient_id = f"WBC-{uuid.uuid4().hex[:8].upper()}"
        timestamp = datetime.now().isoformat()

        image_filename = f"{patient_id}_{uuid.uuid4().hex[:8]}.jpg"
        image_path = os.path.join(UPLOAD_DIR, image_filename)
        image.save(image_path, "JPEG")

        return {
            "patient_id": patient_id,
            "timestamp": timestamp,
            "image_path": image_filename,
            "results": results,
            "total_count": results["total_count"],
            "cell_types": results["cell_types"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post("/api/generate-report")
async def generate_report(analysis_data: dict):
    try:
        patient_id = analysis_data.get("patient_id")
        report_filename = f"report_{patient_id}.pdf"
        report_path = os.path.join(REPORT_DIR, report_filename)

        image_path = os.path.join(UPLOAD_DIR, analysis_data.get("image_path"))

        generate_pdf_report(
            report_path,
            analysis_data,
            image_path
        )

        return FileResponse(
            report_path,
            media_type="application/pdf",
            filename=report_filename
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
