from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether, HRFlowable
from app.models.patient import Patient
from io import BytesIO
from datetime import datetime, date
import os


def calculate_age(date_of_birth):
    """Calculate age from date of birth."""
    if not date_of_birth:
        return None
    if isinstance(date_of_birth, str):
        date_of_birth = datetime.fromisoformat(date_of_birth).date()
    if isinstance(date_of_birth, datetime):
        date_of_birth = date_of_birth.date()
    
    today = date.today()
    age = today.year - date_of_birth.year - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))
    return age if age > 0 else None


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

def generate_patient_dossier_pdf(patient: Patient, medical_acts: list, appointments: list, lab_results: list = None, allergies: list = None) -> BytesIO:
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
        [Paragraph("Nom Complet:", label_style), Paragraph(f"{patient.first_name} {patient.last_name}" if patient.first_name and patient.last_name else "N/A", value_style)],
        [Paragraph("Âge:", label_style), Paragraph(f"{calculate_age(patient.date_of_birth)} ans" if patient.date_of_birth else "N/A", value_style)],
        [Paragraph("Genre:", label_style), Paragraph(patient.gender or "N/A", value_style)],
        [Paragraph("Date de Naissance:", label_style), Paragraph(patient.date_of_birth.isoformat() if patient.date_of_birth else "N/A", value_style)],
        [Paragraph("Email:", label_style), Paragraph(patient.email or "N/A", value_style)],
        [Paragraph("Téléphone:", label_style), Paragraph(patient.phone or "N/A", value_style)],
        [Paragraph("Adresse:", label_style), Paragraph(f"{patient.address or '-'}{f', {patient.city}' if patient.city else ''}", value_style)],
        [Paragraph("Diagnostic Principal:", label_style), Paragraph(patient.primary_diagnosis or "Aucun", value_style)],
        [Paragraph("Statut:", label_style), Paragraph(patient.status or "Actif", value_style)],
    ]
    t = Table(patient_data, colWidths=[120, 350])
    t.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 20))

    # Personal Health Information
    elements.append(Paragraph("Informations de Santé Personnelle", subtitle_style))
    health_data = [
        [Paragraph("Groupe Sanguin:", label_style), Paragraph(patient.blood_type or "-", value_style)],
        [Paragraph("Assurance:", label_style), Paragraph(patient.insurance or "Sans assurance", value_style)],
        [Paragraph("Numéro d'Assurance:", label_style), Paragraph(patient.insurance_number or "-", value_style)],
    ]
    ht = Table(health_data, colWidths=[120, 350])
    ht.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(ht)
    elements.append(Spacer(1, 20))

    # Allergies
    if allergies and len(allergies) > 0:
        elements.append(Paragraph("Allergies", subtitle_style))
        allergy_data = [[Paragraph("Allergène", label_style), Paragraph("Type de Réaction", label_style), Paragraph("Sévérité", label_style), Paragraph("Notes", label_style)]]
        for allergy in allergies:
            allergy_data.append([
                Paragraph(allergy.allergen or "-", value_style),
                Paragraph(allergy.reaction_type or "-", value_style),
                Paragraph(allergy.severity or "-", value_style),
                Paragraph(allergy.notes or "-", value_style)
            ])
        at = Table(allergy_data, colWidths=[80, 80, 80, 150])
        at.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F3F4F6")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.black),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 9),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('FONTSIZE', (0,1), (-1,-1), 8),
            ('BOTTOMPADDING', (0,1), (-1,-1), 5),
        ]))
        elements.append(at)
        elements.append(Spacer(1, 20))
    else:
        elements.append(Paragraph("Allergies: Aucune allergie connue", subtitle_style))
        elements.append(Spacer(1, 20))

    # Emergency Contact
    elements.append(Paragraph("Contact d'Urgence", subtitle_style))
    emergency_data = [
        [Paragraph("Nom:", label_style), Paragraph(patient.emergency_contact_name or "-", value_style)],
        [Paragraph("Relation:", label_style), Paragraph(patient.emergency_contact_relation or "-", value_style)],
        [Paragraph("Téléphone:", label_style), Paragraph(patient.emergency_contact_phone or "-", value_style)],
    ]
    et = Table(emergency_data, colWidths=[120, 350])
    et.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(et)
    elements.append(Spacer(1, 20))

    # Medical Notes
    if patient.notes:
        elements.append(Paragraph("Notes Médicales", subtitle_style))
        elements.append(Paragraph(patient.notes.replace('\n', '<br/>'), styles['Normal']))
        elements.append(Spacer(1, 20))

    # Admin Notes
    if patient.notes_admin:
        elements.append(Paragraph("Notes Administratives", subtitle_style))
        elements.append(Paragraph(patient.notes_admin.replace('\n', '<br/>'), styles['Normal']))
        elements.append(Spacer(1, 20))

    # Recent Appointments
    if appointments:
        elements.append(Paragraph("Historique des Rendez-vous", subtitle_style))
        appt_header = ["Date", "Heure", "Motif", "Statut"]
        appt_data = [appt_header]
        for appt in appointments[:20]:
            if appt.datetime_scheduled:
                dt = appt.datetime_scheduled if isinstance(appt.datetime_scheduled, str) else appt.datetime_scheduled.isoformat()
                date_str = dt.split('T')[0]
                time_str = dt.split('T')[1][:5] if 'T' in dt else '--:--'
            else:
                date_str = '--'
                time_str = '--:--'
            appt_data.append([date_str, time_str, appt.reason or "", appt.status or ""])
        
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
            act_date_str = act.act_date.isoformat() if hasattr(act, 'act_date') and act.act_date else 'N/A'
            elements.append(KeepTogether([
                Paragraph(f"<b>Acte:</b> {act.act_type} - {act_date_str}", styles['Heading3']),
                Paragraph(f"<b>Description:</b> {act.description or 'Aucune'}", styles['Normal']),
                Paragraph(f"<b>Rapport:</b> {act.report or 'Aucun'}", styles['Normal']),
                Paragraph(f"<b>Observations:</b> {act.notes or 'Aucune'}", styles['Normal']),
                Spacer(1, 10),
                HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey),
                Spacer(1, 10)
            ]))

    # Lab Results
    if lab_results and len(lab_results) > 0:
        elements.append(Paragraph("Résultats de Laboratoire", subtitle_style))
        lab_header = ["Date", "Analyse", "Résultat", "Unité", "Statut"]
        lab_data = [lab_header]
        for result in lab_results:
            result_date_str = result.result_date.isoformat() if hasattr(result, 'result_date') and result.result_date else 'N/A'
            status_text = "Anormal" if result.is_abnormal else "Normal"
            lab_data.append([
                result_date_str,
                result.result_name or "-",
                result.result_value or "-",
                result.result_unit or "-",
                status_text
            ])
        
        lt = Table(lab_data, colWidths=[80, 120, 80, 60, 70])
        lt.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F3F4F6")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.black),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 9),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('FONTSIZE', (0,1), (-1,-1), 8),
            ('BOTTOMPADDING', (0,1), (-1,-1), 5),
        ]))
        elements.append(lt)
        elements.append(Spacer(1, 20))

    doc.build(elements)
    buffer.seek(0)
    return buffer
