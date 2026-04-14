# Troubleshooting Guide

## Common Issues and Solutions

### Backend Issues

#### Issue: Cannot start backend server

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
cd backend
pip install -r requirements.txt
```

---

**Error**: `Address already in use: Port 8000`

**Solution**:
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use a different port in main.py
uvicorn.run(app, host="0.0.0.0", port=8001)
```

---

**Error**: `ImportError: cannot import name 'WBCClassifier'`

**Solution**:
Ensure all backend files are in the same directory:
- main.py
- model.py
- report_generator.py

---

#### Issue: PDF generation fails

**Error**: `reportlab module not found`

**Solution**:
```bash
pip install reportlab
```

---

**Error**: `Permission denied when saving uploads`

**Solution**:
```bash
# Create directories with proper permissions
mkdir -p backend/uploads backend/reports
chmod 755 backend/uploads backend/reports
```

---

### Frontend Issues

#### Issue: Frontend won't start

**Error**: `Cannot find module` or `npm command not found`

**Solution**:
```bash
# Install Node.js from nodejs.org
# Then install dependencies
npm install
```

---

**Error**: `Port 5173 is already in use`

**Solution**:
```bash
# Vite will automatically try the next available port
# Or manually specify a port
npm run dev -- --port 3000
```

---

#### Issue: Cannot connect to backend

**Error**: `Failed to fetch` or `Network error`

**Solution**:
1. Verify backend is running on http://localhost:8000
2. Check CORS settings in backend/main.py
3. Ensure no firewall is blocking the connection
4. Check browser console for detailed error

```bash
# Test backend directly
curl http://localhost:8000
```

---

**Error**: `CORS policy blocked`

**Solution**:
Backend should have CORS middleware enabled. Check backend/main.py:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

#### Issue: Build fails

**Error**: `TypeScript error` during build

**Solution**:
```bash
# Run type check to see specific errors
npm run typecheck

# Fix any type errors in the code
# Then rebuild
npm run build
```

---

### Image Upload Issues

#### Issue: Upload fails immediately

**Error**: `Invalid file type`

**Solution**:
- Only JPG, JPEG, and PNG files are supported
- Check file extension is correct
- Try re-saving the image in a supported format

---

**Error**: `File size too large`

**Solution**:
- Maximum file size is 10MB
- Compress the image using an online tool
- Reduce image resolution

---

#### Issue: Image preview not showing

**Solution**:
1. Check browser console for errors
2. Verify image file is not corrupted
3. Try a different image
4. Clear browser cache

---

### Analysis Issues

#### Issue: Analysis takes too long

**Solution**:
- Check backend terminal for errors
- Verify backend process is still running
- Try with a smaller image file
- Check system resources (CPU, memory)

---

**Error**: `500 Internal Server Error` during analysis

**Solution**:
1. Check backend terminal for Python errors
2. Ensure all dependencies are installed
3. Verify image is in correct format
4. Check backend logs for detailed error

---

#### Issue: Results look incorrect

**Note**: The demo model generates simulated results. For production use, you would need a trained model on real WBC data.

---

### PDF Report Issues

#### Issue: PDF download fails

**Solution**:
1. Check backend has write permissions
2. Verify reportlab is installed
3. Check browser's download settings
4. Try a different browser

---

**Error**: `Failed to generate report`

**Solution**:
```bash
# Ensure reportlab is properly installed
pip install --upgrade reportlab

# Check if uploads directory exists
ls -la backend/uploads/
```

---

### System-Specific Issues

#### Windows Users

**Issue**: `python command not found`

**Solution**:
Use `python` instead of `python3`:
```bash
python main.py
pip install -r requirements.txt
```

---

**Issue**: Path separators causing issues

**Solution**:
Windows uses backslashes. Update paths in code or use:
```python
import os
path = os.path.join('backend', 'uploads', 'file.jpg')
```

---

#### macOS Users

**Issue**: Permission denied errors

**Solution**:
```bash
# Use sudo for installation if needed
sudo pip install -r requirements.txt

# Or use virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

#### Linux Users

**Issue**: Python 3 not default

**Solution**:
```bash
# Use python3 explicitly
python3 main.py

# Or create alias
alias python=python3
```

---

## Performance Issues

### Slow Analysis

**Possible Causes**:
1. Large image files
2. Limited system resources
3. Background processes consuming CPU

**Solutions**:
- Resize images before upload
- Close unnecessary applications
- Use smaller test images

---

### Memory Issues

**Error**: `Out of memory`

**Solution**:
- Use smaller images
- Restart backend server
- Increase system swap space
- Close other memory-intensive applications

---

## Browser Compatibility

### Supported Browsers
- Chrome/Edge (recommended)
- Firefox
- Safari

### Browser Issues

**Issue**: Features not working in old browser

**Solution**:
Update to latest browser version. The app uses modern JavaScript features.

---

**Issue**: Upload not working in browser

**Solution**:
1. Check browser console for errors
2. Ensure JavaScript is enabled
3. Disable browser extensions temporarily
4. Try incognito/private mode

---

## Development Issues

### Hot Reload Not Working

**Solution**:
```bash
# Restart dev server
# Stop with Ctrl+C
npm run dev
```

---

### TypeScript Errors

**Solution**:
```bash
# Check all TypeScript errors
npm run typecheck

# Common fixes:
# - Add missing type imports
# - Define proper interfaces
# - Use 'any' type temporarily for debugging
```

---

## Still Having Issues?

### Debug Checklist

1. **Backend Running?**
   ```bash
   curl http://localhost:8000
   # Should return: {"message":"AI WBC Analyzer API","status":"online"}
   ```

2. **Frontend Running?**
   - Open http://localhost:5173 in browser
   - Should see the home page

3. **Dependencies Installed?**
   ```bash
   # Frontend
   npm list

   # Backend
   pip list
   ```

4. **Ports Available?**
   ```bash
   # Check port 8000 (backend)
   lsof -i :8000

   # Check port 5173 (frontend)
   lsof -i :5173
   ```

5. **Check Logs**
   - Backend: Check terminal running Python
   - Frontend: Check browser console (F12)

### Getting Help

If you're still stuck:

1. Check browser console (F12) for JavaScript errors
2. Check backend terminal for Python errors
3. Verify all files are in correct locations
4. Try deleting node_modules and reinstalling:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
5. Restart both servers
6. Try a different port
7. Check firewall settings

### Clean Restart

```bash
# Kill all processes
# Ctrl+C in both terminals

# Frontend
rm -rf node_modules dist
npm install
npm run dev

# Backend (in new terminal)
cd backend
pip install -r requirements.txt
python main.py
```

## Error Code Reference

| Error Code | Meaning | Solution |
|------------|---------|----------|
| 400 | Bad Request | Check file type and size |
| 404 | Not Found | Verify backend is running |
| 500 | Server Error | Check backend logs |
| CORS Error | Cross-origin blocked | Check CORS settings |
| Network Error | Cannot connect | Verify backend URL |

---

For more help, refer to:
- README.md for setup instructions
- QUICKSTART.md for getting started
- PROJECT_OVERVIEW.md for architecture details
