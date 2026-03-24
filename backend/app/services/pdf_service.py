from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether, HRFlowable
from app.models.patient import Patient
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

def generate_patient_dossier_pdf(patient: Patient, medical_acts: list, appointments: list) -> BytesIO:
    """ Generates a comprehensive medical dossier for a patient. """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=24, spaceAfter=20, alignment=1, color=colors.HexColor("#2563EB"))
    subtitle_style = ParagraphStyle('SubtitleStyle', parent=styles['Heading2'], fontSize=16, spaceBefore=15, spaceAfter=10, color=colors.HexColor("#1E40AF"))
    label_style = ParagraphStyle('LabelStyle', parent=styles['Normal'], fontSize=10, fontName='Helvetica-Bold')
    value_style = ParagraphStyle('ValueStyle', parent=styles['Normal'], fontSize=10, fontName='Helvetica', leftIndent=10)

    elements = []

    # Header / Clinic Branding
    elements.append(Paragraph("<b>CLINIQUE MÉDICALE RHUMATO-AI</b>", ParagraphStyle('Top', parent=styles['Normal'], fontSize=8, textColor=colors.grey)))
    elements.append(Spacer(1, 10))
    
    # Header / Cover Page
    elements.append(Paragraph("DOSSIER MÉDICAL COMPLET", title_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(f"Généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}", styles['Normal']))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.lightgrey, spaceBefore=10, spaceAfter=20))

    # Patient Information
    elements.append(Paragraph("Informations du Patient", subtitle_style))
    patient_data = [
        [Paragraph("Nom Complet:", label_style), Paragraph(patient.name or "N/A", value_style)],
        [Paragraph("Âge:", label_style), Paragraph(f"{patient.age} ans" if patient.age else "N/A", value_style)],
        [Paragraph("Genre:", label_style), Paragraph(patient.gender or "N/A", value_style)],
        [Paragraph("Email:", label_style), Paragraph(patient.email or "N/A", value_style)],
        [Paragraph("Téléphone:", label_style), Paragraph(patient.phone or "N/A", value_style)],
        [Paragraph("Adresse:", label_style), Paragraph(patient.address or "N/A", value_style)],
        [Paragraph("Diagnostic Principal:", label_style), Paragraph(patient.diagnosis or "Aucun", value_style)],
    ]
    t = Table(patient_data, colWidths=[120, 350])
    t.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 20))

    # Recent Appointments
    if appointments:
        elements.append(Paragraph("Historique des Rendez-vous", subtitle_style))
        appt_header = ["Date", "Heure", "Motif", "Statut"]
        appt_data = [appt_header]
        for appt in appointments[:20]: # Show more in full dossier
            appt_data.append([appt.date, appt.time, appt.reason or "", appt.status])
        
        at = Table(appt_data, colWidths=[80, 60, 250, 80])
        at.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F3F4F6")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.black),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 10),
            ('BOTTOMPADDING', (0,0), (-1,0), 10),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('FONTSIZE', (0,1), (-1,-1), 9),
            ('BOTTOMPADDING', (0,1), (-1,-1), 5),
        ]))
        elements.append(at)
        elements.append(Spacer(1, 20))

    # Medical Acts History
    if medical_acts:
        elements.append(Paragraph("Historique des Actes Médicaux", subtitle_style))
        for act in medical_acts:
            elements.append(KeepTogether([
                Paragraph(f"Acte: {act.act_type} - {act.date}", styles['Heading3']),
                Paragraph(f"<b>Traitement:</b> {act.treatment or 'N/A'}", styles['Normal']),
                Paragraph(f"<b>Observations:</b> {act.observations or 'Aucune'}", styles['Normal']),
                Spacer(1, 10),
                HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey),
                Spacer(1, 10)
            ]))

    doc.build(elements)
    buffer.seek(0)
    return buffer
