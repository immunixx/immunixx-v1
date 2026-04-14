# AI WBC Analyzer - Backend API

FastAPI backend for AI-based White Blood Cell analysis.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - Health check
- `POST /api/analyze` - Analyze WBC image (upload file)
- `POST /api/generate-report` - Generate PDF report

## Features

- CNN-based WBC classification
- Support for 5 WBC types: Neutrophil, Lymphocyte, Monocyte, Eosinophil, Basophil
- PDF report generation with medical-style formatting
- Image validation and preprocessing
- CORS enabled for frontend integration
