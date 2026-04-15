from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
import os

def generate_pdf_report(output_path, analysis_data, image_path):
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#2d5016'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#2d5016'),
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )

    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=6
    )

    story.append(Paragraph("AI-BASED WHITE BLOOD CELL ANALYSIS REPORT", title_style))
    story.append(Spacer(1, 0.3*inch))

    info_data = [
        ["Patient ID:", analysis_data.get("patient_id", "N/A")],
        ["Analysis Date:", datetime.fromisoformat(analysis_data.get("timestamp")).strftime("%Y-%m-%d %H:%M:%S")],
        ["Model Version:", "CNN-WBC-v1.0"],
        ["Total WBC Count:", str(analysis_data.get("total_count", 0))]
    ]

    patient_details = analysis_data.get("patient_details", {}) or {}
    if patient_details:
        info_data.extend([
            ["Patient Name:", patient_details.get("name", "N/A")],
            ["Age:", patient_details.get("age", "N/A")],
            ["Mobile Number:", patient_details.get("mobileNumber", "N/A")],
            ["Emergency Contact:", patient_details.get("emergencyContact", "N/A")],
            ["Address:", patient_details.get("address", "N/A")],
        ])

    info_table = Table(info_data, colWidths=[2*inch, 4*inch])
    info_table.setStyle(TableStyle([
        ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 11),
        ('FONT', (1, 0), (1, -1), 'Helvetica', 11),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#2d5016')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))

    story.append(info_table)
    story.append(Spacer(1, 0.3*inch))

    if os.path.exists(image_path):
        story.append(Paragraph("Blood Smear Image", heading_style))
        img = RLImage(image_path, width=3*inch, height=3*inch)
        story.append(img)
        story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph("WBC Differential Count Analysis", heading_style))
    story.append(Spacer(1, 0.1*inch))

    table_data = [["Cell Type", "Count", "Percentage (%)", "AI Confidence"]]

    cell_types = analysis_data.get("cell_types", [])
    for cell in cell_types:
        table_data.append([
            cell.get("cell_type", "N/A"),
            str(cell.get("count", 0)),
            f"{cell.get('percentage', 0):.2f}%",
            f"{cell.get('confidence', 0) * 100:.1f}%"
        ])

    results_table = Table(table_data, colWidths=[2*inch, 1.5*inch, 1.5*inch, 1.5*inch])
    results_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4a7c2c')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f8e8')]),
    ]))

    story.append(results_table)
    story.append(Spacer(1, 0.4*inch))

    story.append(Paragraph("Reference Ranges (Normal Values)", heading_style))
    reference_data = [
        ["Cell Type", "Normal Range"],
        ["Neutrophil", "40-60%"],
        ["Lymphocyte", "20-40%"],
        ["Monocyte", "2-8%"],
        ["Eosinophil", "1-4%"],
        ["Basophil", "0.5-1%"]
    ]

    ref_table = Table(reference_data, colWidths=[3*inch, 3*inch])
    ref_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4a7c2c')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f8e8')]),
    ]))

    story.append(ref_table)
    story.append(Spacer(1, 0.5*inch))

    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.red,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    story.append(Paragraph("DISCLAIMER", disclaimer_style))
    story.append(Spacer(1, 0.1*inch))

    disclaimer_text = ParagraphStyle(
        'DisclaimerText',
        parent=styles['Normal'],
        fontSize=8,
        alignment=TA_CENTER,
        textColor=colors.grey
    )

    story.append(Paragraph(
        "This report is generated by an AI-based system for research and educational purposes only. "
        "It should not be used as a substitute for professional medical diagnosis or treatment. "
        "Always consult a qualified healthcare provider for medical advice.",
        disclaimer_text
    ))

    doc.build(story)
