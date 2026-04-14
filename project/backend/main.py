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

app = FastAPI(title="AI WBC Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

classifier = WBCClassifier()

UPLOAD_DIR = "uploads"
REPORT_DIR = "reports"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(REPORT_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "AI WBC Analyzer API", "status": "online"}

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
