import { jsPDF } from 'jspdf';
import { AnalysisResult } from '../types';

const NORMAL_RANGES: Record<string, { min: number; max: number; label: string }> = {
  Neutrophil:  { min: 40, max: 60, label: '40–60%' },
  Lymphocyte:  { min: 20, max: 40, label: '20–40%' },
  Monocyte:    { min: 2,  max: 8,  label: '2–8%'   },
  Eosinophil:  { min: 1,  max: 4,  label: '1–4%'   },
  Basophil:    { min: 0.5,max: 1,  label: '0.5–1%' },
};

function isNormal(pct: number, type: string): boolean {
  const r = NORMAL_RANGES[type];
  return r ? pct >= r.min && pct <= r.max : true;
}

export const generatePDFReport = async (results: AnalysisResult, imagePreview?: string) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, margin = 18;
  const overallStatus = results.cell_types.every(c => isNormal(c.percentage, c.cell_type)) ? 'Normal' : 'Review Required';
  const patient = results.patient_details;

  // Header bar
  doc.setFillColor(46, 158, 80);
  doc.rect(0, 0, W, 34, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Smart White Blood Cell Analyzer', margin, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('WBC Differential Count Report', margin, 21);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 27);

  // Patient info box
  doc.setFillColor(241, 253, 244);
  doc.roundedRect(margin, 40, W - margin * 2, 34, 3, 3, 'F');
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Patient ID: ${results.patient_id}`, margin + 4, 48);
  doc.text(`Model Version: ${results.results.model_version}`, margin + 4, 54);
  doc.text(`Processing Time: ${results.results.processing_time}s`, margin + 4, 60);
  doc.text(`Total WBC Count: ${results.total_count}`, margin + 4, 66);

  doc.setFont('helvetica', 'normal');
  if (patient) {
    const rightColX = W / 2 + 4;
    doc.text(`Name: ${patient.name}`, rightColX, 48);
    doc.text(`Age: ${patient.age}`, rightColX, 54);
    doc.text(`Mobile: ${patient.mobileNumber}`, rightColX, 60);
    doc.text(`Emergency: ${patient.emergencyContact}`, rightColX, 66);

    const addressLines = doc.splitTextToSize(`Address: ${patient.address}`, W - margin * 2 - 8);
    doc.text(addressLines, margin + 4, 72);
  } else {
    doc.text('Patient details not provided', W / 2 + 4, 60);
  }

  // Embedded image
  if (imagePreview) {
    try {
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(margin, 82, 60, 50, 2, 2, 'F');
      doc.addImage(imagePreview, 'JPEG', margin + 1, 83, 58, 48);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text('Blood Smear Image', margin + 20, 134);
    } catch (_) { /* image embed optional */ }
  }

  // Primary result summary
  const sumX = margin + 66;
  doc.setFillColor(220, 245, 227);
  doc.roundedRect(sumX, 82, W - margin - sumX, 50, 2, 2, 'F');
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Primary WBC Detected', sumX + 4, 92);
  doc.setFontSize(15);
  doc.setTextColor(22, 101, 52);
  doc.text(results.dominant_type, sumX + 4, 102);
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  doc.setFont('helvetica', 'normal');
  doc.text(`Confidence: ${(results.dominant_confidence * 100).toFixed(1)}%`, sumX + 4, 110);
  doc.text(`Overall Status: ${overallStatus}`, sumX + 4, 117);
  doc.text(`Analysis Date: ${new Date(results.timestamp).toLocaleDateString()}`, sumX + 4, 124);

  // Table
  let y = 142;
  doc.setFillColor(46, 158, 80);
  doc.rect(margin, y, W - margin * 2, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  const cols = [margin + 2, margin + 42, margin + 70, margin + 98, margin + 128, margin + 154];
  ['Cell Type','Count','Percentage','Normal Range','Confidence','Status'].forEach((h, i) => doc.text(h, cols[i], y + 5.5));

  results.cell_types.forEach((cell, idx) => {
    y += 9;
    doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 253 : 255, idx % 2 === 0 ? 250 : 255);
    doc.rect(margin, y, W - margin * 2, 9, 'F');
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const normal = isNormal(cell.percentage, cell.cell_type);
    doc.text(cell.cell_type, cols[0], y + 6);
    doc.text(String(cell.count), cols[1], y + 6);
    doc.text(`${cell.percentage.toFixed(2)}%`, cols[2], y + 6);
    doc.text(NORMAL_RANGES[cell.cell_type]?.label ?? '—', cols[3], y + 6);
    doc.text(`${(cell.confidence * 100).toFixed(1)}%`, cols[4], y + 6);
    doc.setTextColor(normal ? 21 : 194, normal ? 128 : 65, normal ? 61 : 12);
    doc.setFont('helvetica', 'bold');
    doc.text(normal ? 'Normal' : 'Review', cols[5], y + 6);
    doc.setTextColor(31, 41, 55);
  });

  // Disclaimer
  y += 20;
  doc.setFillColor(255, 247, 237);
  doc.roundedRect(margin, y, W - margin * 2, 20, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(146, 64, 14);
  doc.text('⚠ Important Notice', margin + 4, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(
    'This report is generated by an automated analysis workflow for research and educational purposes only. It is not a substitute for',
    margin + 4, y + 12
  );
  doc.text('professional medical diagnosis. Always consult a qualified healthcare provider.', margin + 4, y + 17);

  // Footer
  doc.setFillColor(46, 158, 80);
  doc.rect(0, 285, W, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text('Immunixx WBC Platform  |  For Research & Educational Purposes Only  |  © 2026', W / 2, 292, { align: 'center' });

  doc.save(`WBC_Report_${results.patient_id}.pdf`);
};
