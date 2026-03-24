from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from io import BytesIO
from datetime import datetime
import os

def generate_medical_act_pdf(act_data: dict):
    """
    Generates a professional PDF for a medical act.
    act_data should contain: patient_name, act_type, date, diagnosis, report, treatment, amount, etc.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    subtitle_style = styles['Heading2']
    normal_style = styles['Normal']
    
    # Custom styles
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.grey,
        spaceAfter=12
    )
    
    label_style = ParagraphStyle(
        'LabelStyle',
        parent=styles['Normal'],
        fontSize=11,
        fontName='Helvetica-Bold',
        spaceAfter=4
    )

    elements = []

    # 1. Header / Clinic Info
    elements.append(Paragraph("<b>CLINIQUE MÉDICALE RHUMATO-AI</b>", title_style))
    elements.append(Paragraph("Casablanca, Maroc | Tel: +212 522 000 000", header_style))
    elements.append(Spacer(1, 12))
    
    # 2. Document Title
    elements.append(Paragraph(f"RAPPORT D'ACTE MÉDICAL: {act_data.get('act_type', 'Consultation').upper()}", subtitle_style))
    elements.append(Spacer(1, 20))
    
    # 3. Patient Info Table
    date_str = act_data.get('date', datetime.now().strftime('%Y-%m-%d'))
    patient_info = [
        [Paragraph("<b>Patient:</b>", normal_style), Paragraph(act_data.get('patient_name', 'N/A'), normal_style)],
        [Paragraph("<b>Date:</b>", normal_style), Paragraph(date_str, normal_style)],
        [Paragraph("<b>ID Patient:</b>", normal_style), Paragraph(str(act_data.get('patient_id', 'N/A')), normal_style)]
    ]
    
    t = Table(patient_info, colWidths=[100, 350])
    t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('BACKGROUND', (0, 0), (0, -1), colors.whitesmoke),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 20))
    
    # 4. Clinical Details
    sections = [
        ("Diagnostic", act_data.get('diagnosis')),
        ("Rapport d'examen", act_data.get('report')),
        ("Traitement / Prescription", act_data.get('treatment')),
        ("Notes complémentaires", act_data.get('notes'))
    ]
    
    for title, content in sections:
        if content:
            elements.append(Paragraph(f"<b>{title}</b>", normal_style))
            elements.append(Spacer(1, 6))
            elements.append(Paragraph(content.replace('\n', '<br/>'), normal_style))
            elements.append(Spacer(1, 12))
            
    # 5. Billing info if exists
    if act_data.get('amount'):
        elements.append(Spacer(1, 10))
        elements.append(Paragraph(f"<b>Montant de l'acte:</b> {act_data.get('amount')} DH", normal_style))
        
    # 6. Footer / Signature placeholder
    elements.append(Spacer(1, 50))
    elements.append(Paragraph("Cachet et signature du médecin", ParagraphStyle('Sign', parent=styles['Normal'], alignment=1)))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer
