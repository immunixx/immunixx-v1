# Quick Start Guide - AI WBC Analyzer

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

## Step 1: Start the Backend Server

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Keep this terminal running.

## Step 2: Start the Frontend Application

Open a **new terminal** in the project root directory.

Install Node.js dependencies (if not already installed):

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## Step 3: Use the Application

1. Open your browser and navigate to `http://localhost:5173/`
2. Click **"Start Analysis"** on the home page
3. Upload a blood smear image (JPG or PNG format)
4. Wait for the AI analysis to complete
5. View detailed results with charts and tables
6. Click **"Download Report"** to get a PDF report

## Testing Without Real Blood Images

Since you may not have actual blood smear images, you can use any microscopy-like image or cell images for testing purposes. The system will process any JPG/PNG image and provide simulated analysis results for demonstration.

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError` for packages
**Solution**: Make sure all dependencies are installed:
```bash
pip install fastapi uvicorn python-multipart Pillow numpy reportlab
```

**Problem**: Port 8000 already in use
**Solution**: Stop any other services using port 8000 or modify the port in `backend/main.py`

### Frontend Issues

**Problem**: Cannot connect to backend
**Solution**: Ensure the backend is running on `http://localhost:8000` and CORS is enabled

**Problem**: Vite fails to start
**Solution**: Delete `node_modules` and reinstall:
```bash
rm -rf node_modules
npm install
```

## Production Build

To build the frontend for production:

```bash
npm run build
```

The production files will be in the `dist/` directory.

## Support

For issues or questions, please refer to the main README.md file for detailed documentation.
