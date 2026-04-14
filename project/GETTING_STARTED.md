# Getting Started with AI WBC Analyzer

Welcome! This guide will help you get up and running with the AI WBC Analyzer in minutes.

## What You'll Need

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://www.python.org/)
- A **text editor** or IDE (VS Code recommended)
- A **web browser** (Chrome, Firefox, or Safari)

## Quick Start (2 Minutes)

### Step 1: Start the Backend (Terminal 1)

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the server
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

✅ Backend is now running!

### Step 2: Start the Frontend (Terminal 2)

Open a **new terminal** in the project root:

```bash
# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

✅ Frontend is now running!

### Step 3: Open the Application

1. Open your browser
2. Go to: `http://localhost:5173/`
3. You should see the home page with "AI-Based White Blood Cell Analyzer"

🎉 **Success!** The application is running.

---

## Your First Analysis

Now let's analyze an image:

### 1. Get a Test Image

You can use any cell microscopy image. Here's where to find one:

**Option A: Quick Test (Any Image)**
- Use any JPG/PNG image from your computer
- The system will process it and show results

**Option B: Realistic Blood Smear**
- Go to [Wikimedia Commons](https://commons.wikimedia.org/)
- Search for "blood smear"
- Download any image
- Use it in the app

### 2. Upload and Analyze

1. Click **"Start Analysis"** on the home page
2. Drag and drop your image, or click **"Browse Files"**
3. Wait 1-2 seconds while the AI processes
4. View your detailed results!

### 3. Download Report

1. Review the analysis results
2. Check the charts and tables
3. Click **"Download Report"** to get a PDF
4. Open the PDF to see a professional medical-style report

---

## Understanding the Interface

### Home Page
- **Overview** of the application
- **Feature cards** explaining capabilities
- **Start Analysis** button to begin

### Upload Page
- **Drag & drop** area for images
- **File validation** (JPG/PNG, max 10MB)
- **Preview** before analysis
- **Guidelines** for best results

### Loading Screen
- **Progress indicator** during analysis
- **Status updates** showing processing steps
- Takes 1-2 seconds typically

### Results Page
- **Summary cards**: Total count, processing time, model version
- **Data table**: Detailed WBC breakdown
- **Visual charts**: Bar chart showing proportions
- **Status indicators**: Normal vs. Review needed
- **Download button**: Get PDF report

---

## Understanding the Results

### WBC Types

The system analyzes 5 types of white blood cells:

1. **Neutrophils** (40-60% normal)
   - Most common WBC
   - Fight bacterial infections
   - First responders to infection

2. **Lymphocytes** (20-40% normal)
   - T-cells and B-cells
   - Adaptive immune response
   - Create antibodies

3. **Monocytes** (2-8% normal)
   - Largest WBC
   - Remove dead cells
   - Become macrophages

4. **Eosinophils** (1-4% normal)
   - Combat parasites
   - Involved in allergies
   - Respond to inflammation

5. **Basophils** (0.5-1% normal)
   - Least common WBC
   - Release histamine
   - Allergic reactions

### Reading the Table

| Column | Meaning |
|--------|---------|
| Cell Type | Name of WBC |
| Count | Number detected |
| Percentage | Proportion of total |
| Normal Range | Expected values |
| AI Confidence | Model certainty (%) |
| Status | Normal or Review |

### Status Colors

- 🟢 **Green (Normal)**: Value within normal range
- 🟠 **Orange (Review)**: Value outside normal range

---

## Tips for Best Results

### Image Quality
- ✅ Use clear, focused images
- ✅ Good lighting and contrast
- ✅ Multiple cells visible
- ❌ Avoid blurry images
- ❌ Avoid very dark images
- ❌ Avoid heavily compressed files

### File Requirements
- **Format**: JPG, JPEG, or PNG
- **Size**: Maximum 10MB
- **Resolution**: At least 800x800 pixels recommended

---

## Common Questions

### Q: Do I need real blood smear images?

**A**: For testing, any image works! The system will process any JPG/PNG and show results. For realistic results, use actual blood smear microscopy images.

### Q: Is this clinically accurate?

**A**: This is a **demonstration/educational tool only**. It's not FDA approved and should not be used for medical diagnosis. The current model uses simulated results for demonstration purposes.

### Q: Can I use this for real patients?

**A**: **No**. This is for research and educational purposes only. Always consult qualified healthcare professionals for medical advice.

### Q: How accurate is the AI?

**A**: This is a demo system with simulated CNN-based classification. In production, you would need a model trained on a large, validated dataset of real WBC images.

### Q: Why are my results different each time?

**A**: The demo model generates consistent but simulated results based on image characteristics. A production model would use actual deep learning classification.

### Q: Can I analyze multiple images?

**A**: Currently one image at a time. You can click "New Analysis" to process another image.

### Q: Where are the images stored?

**A**: Images are temporarily stored in `backend/uploads/` during processing. You may want to clear this directory periodically.

---

## Next Steps

### Explore the Code

**Frontend (React/TypeScript)**:
- `src/components/` - UI components
- `src/services/api.ts` - Backend communication
- `src/App.tsx` - Main application logic

**Backend (Python/FastAPI)**:
- `backend/main.py` - API server
- `backend/model.py` - CNN classifier
- `backend/report_generator.py` - PDF generation

### Customize the Application

Want to make changes? Here are some ideas:

1. **Change colors**: Edit Tailwind classes in components
2. **Add more cell types**: Extend the model.py classifier
3. **Improve model**: Replace with real trained CNN
4. **Add database**: Store analysis history
5. **Add authentication**: User accounts and login
6. **Batch processing**: Analyze multiple images

### Deploy to Production

Ready to share with others? See:
- `DEPLOYMENT.md` - Deployment guide
- `TROUBLESHOOTING.md` - Common issues
- `PROJECT_OVERVIEW.md` - Architecture details

---

## Need Help?

### Documentation
- `README.md` - Complete documentation
- `QUICKSTART.md` - Fast setup guide
- `TROUBLESHOOTING.md` - Fix common issues
- `SAMPLE_IMAGES.md` - Finding test images
- `DEPLOYMENT.md` - Production deployment

### Common Issues

**Backend won't start**:
```bash
pip install -r backend/requirements.txt
```

**Frontend won't start**:
```bash
npm install
```

**Can't connect to backend**:
- Verify backend is running on http://localhost:8000
- Check browser console for errors

**Upload fails**:
- Check file is JPG/PNG
- Ensure file is under 10MB
- Try a different image

---

## What's Next?

Now that you have the application running:

1. ✅ **Analyze some images** - Try different test images
2. ✅ **Download reports** - See the PDF generation
3. ✅ **Explore the code** - Understand how it works
4. ✅ **Make modifications** - Customize to your needs
5. ✅ **Deploy** - Share with others (optional)

---

## Important Reminder

This application is designed for **educational and research purposes only**.

⚠️ **Not for clinical use**
⚠️ **Not FDA approved**
⚠️ **Not a medical device**

Always consult qualified healthcare professionals for medical diagnosis and treatment.

---

## Enjoy!

You now have a complete AI-powered WBC analyzer running on your machine. Explore, experiment, and learn!

For questions or issues, refer to the documentation files in this project.

**Happy analyzing!** 🔬
