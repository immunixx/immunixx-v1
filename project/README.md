# AI WBC Analyzer

A comprehensive web application for analyzing White Blood Cell (WBC) images using AI/ML powered CNN-based classification. This application provides professional medical-style reports with detailed WBC differential counts.

## Features

- **AI-Powered Analysis**: CNN-based image classification for 5 WBC types
- **Medical-Grade UI**: Professional leaf green and white themed interface
- **Real-time Processing**: Instant analysis with confidence scores
- **Visual Reports**: Interactive charts and tables displaying results
- **PDF Generation**: Downloadable medical-style reports
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## WBC Types Detected

1. **Neutrophils** - Fight bacterial infections
2. **Lymphocytes** - Immune system response
3. **Monocytes** - Remove dead cells and debris
4. **Eosinophils** - Combat parasitic infections
5. **Basophils** - Allergic and inflammatory responses

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons

### Backend
- FastAPI (Python)
- CNN-based classification model
- ReportLab for PDF generation
- Pillow for image processing

## Project Structure

```
ai-wbc-analyzer/
├── frontend (React app)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.tsx
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── LoadingAnalysis.tsx
│   │   │   └── Results.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types.ts
│   │   └── App.tsx
│   └── package.json
│
└── backend (FastAPI server)
    ├── main.py
    ├── model.py
    ├── report_generator.py
    └── requirements.txt
```

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the FastAPI server:
```bash
python main.py
```

The API will run on `http://localhost:8000`

### Frontend Setup

1. Install Node.js dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will run on `http://localhost:5173`

## Usage

1. **Start Analysis**: Click "Start Analysis" on the home page
2. **Upload Image**: Drag & drop or browse for a blood smear image (JPG/PNG)
3. **View Results**: Wait for AI processing and view detailed analysis
4. **Download Report**: Click "Download Report" to get a PDF with complete analysis

## API Endpoints

### POST /api/analyze
Analyzes uploaded WBC image and returns classification results.

**Request**: Multipart form data with image file

**Response**:
```json
{
  "patient_id": "WBC-XXXXXXXX",
  "timestamp": "2024-01-01T12:00:00",
  "total_count": 125,
  "cell_types": [
    {
      "cell_type": "Neutrophil",
      "count": 60,
      "percentage": 48.0,
      "confidence": 0.95
    }
  ]
}
```

### POST /api/generate-report
Generates a PDF report from analysis data.

**Request**: JSON with analysis data

**Response**: PDF file download

## Normal WBC Ranges

| Cell Type | Normal Range |
|-----------|--------------|
| Neutrophil | 40-60% |
| Lymphocyte | 20-40% |
| Monocyte | 2-8% |
| Eosinophil | 1-4% |
| Basophil | 0.5-1% |

## Important Disclaimer

This application is designed for **research and educational purposes only**. It should not be used as a substitute for professional medical diagnosis or treatment. Always consult qualified healthcare providers for medical advice.

## Development

### Build Frontend
```bash
npm run build
```

### Run Frontend Type Check
```bash
npm run typecheck
```

### Run Frontend Linting
```bash
npm run lint
```

## License

This project is for educational and research purposes.
