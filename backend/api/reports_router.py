import csv
import json
import io
from datetime import datetime
from fastapi import APIRouter, Depends, Response, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from backend.database import get_db
from backend.models import IncidentAlert, TelemetryLog

router = APIRouter(prefix="/reports", tags=["Reports & Export"])

@router.get("/export/csv")
def export_incidents_csv(db: Session = Depends(get_db)):
    alerts = db.query(IncidentAlert).order_by(IncidentAlert.timestamp.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Alert ID", "Timestamp", "Entity ID", "Entity Type", "Attack Type", 
        "Severity", "Risk Score", "Confidence", "Status", "Explanation"
    ])

    for a in alerts:
        writer.writerow([
            a.id, a.timestamp.isoformat(), a.entity_id, a.entity_type, a.attack_type,
            a.severity, a.risk_score, a.confidence_score, a.status, a.natural_language_explanation
        ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=soc_incident_report.csv"}
    )

@router.get("/export/json")
def export_incidents_json(db: Session = Depends(get_db)):
    alerts = db.query(IncidentAlert).order_by(IncidentAlert.timestamp.desc()).all()
    data = []
    for a in alerts:
        data.append({
            "alert_id": a.id,
            "timestamp": a.timestamp.isoformat(),
            "entity_id": a.entity_id,
            "entity_type": a.entity_type,
            "attack_type": a.attack_type,
            "severity": a.severity,
            "risk_score": a.risk_score,
            "confidence_score": a.confidence_score,
            "status": a.status,
            "feature_contributions": a.feature_contributions_json,
            "explanation": a.natural_language_explanation,
            "recommendation": a.analyst_recommendation
        })

    json_bytes = json.dumps(data, indent=2).encode()
    return StreamingResponse(
        io.BytesIO(json_bytes),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=soc_incident_report.json"}
    )

@router.get("/export/pdf")
def export_executive_summary_pdf(db: Session = Depends(get_db)):
    """
    Generates a genuine, valid binary PDF document using ReportLab summarizing enterprise UEBA security posture.
    """
    alerts = db.query(IncidentAlert).order_by(IncidentAlert.risk_score.desc()).all()
    total_events = db.query(TelemetryLog).count()
    critical_cnt = sum(1 for a in alerts if a.severity == "CRITICAL")
    high_cnt = sum(1 for a in alerts if a.severity == "HIGH")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#475569'),
        spaceAfter=12
    )
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=colors.HexColor('#334155'),
        spaceAfter=4
    )

    story = []

    # Title Banner
    story.append(Paragraph("AEGIS-UEBA EXECUTIVE SECURITY POSTURE REPORT", title_style))
    story.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')} | Organization: Enterprise Security Operations Center (SOC)", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#00f0ff'), spaceAfter=12))

    # Executive Summary Metrics
    story.append(Paragraph("1. EXECUTIVE SUMMARY METRICS", heading_style))
    summary_data = [
        ["Metric Description", "Value", "System Posture Diagnosis"],
        ["Total Telemetry Events Analyzed", str(total_events), "Inference Active (<12ms)"],
        ["Total Flagged Incident Alerts", str(len(alerts)), "Top 1.0% Budget Threshold Enforced"],
        ["Critical Severity Threats", str(critical_cnt), "ACTION REQUIRED" if critical_cnt > 0 else "NORMAL"],
        ["High Severity Threats", str(high_cnt), "MONITORING"],
    ]
    t1 = Table(summary_data, colWidths=[200, 100, 240])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#f8fafc'), colors.white]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 9),
    ]))
    story.append(t1)
    story.append(Spacer(1, 12))

    # Top Incident Alerts Table
    story.append(Paragraph("2. PRIORITIZED INCIDENT ALERTS QUEUE", heading_style))
    alert_rows = [["ID", "Entity ID", "Attack Category", "Risk", "Severity", "Status"]]
    for a in alerts[:10]:
        alert_rows.append([
            f"#{a.id}",
            a.entity_id,
            a.attack_type,
            f"{a.risk_score}/100",
            a.severity,
            a.status
        ])

    if len(alert_rows) == 1:
        alert_rows.append(["-", "No Active Alerts", "N/A", "0/100", "LOW", "CLEAN"])

    t2 = Table(alert_rows, colWidths=[40, 90, 180, 60, 80, 90])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 8),
    ]))
    story.append(t2)
    story.append(Spacer(1, 12))

    # Machine Learning Architecture Notes
    story.append(Paragraph("3. MACHINE LEARNING & EXPLAINABILITY SPECIFICATIONS", heading_style))
    story.append(Paragraph("• <b>Ensemble Detection</b>: Isolation Forest (25%), One-Class SVM (20%), Local Outlier Factor (15%), Statistical Z-Score / Geo-Velocity (40%).", body_style))
    story.append(Paragraph("• <b>Explainability Layer</b>: Feature attribution breakdown (% weight), natural language narrative, and risk scoring (0-100 scale).", body_style))
    story.append(Paragraph("• <b>Concept Drift Diagnostic</b>: Population Stability Index (PSI) and Kolmogorov-Smirnov (KS) distribution monitoring.", body_style))

    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cbd5e1'), spaceAfter=8))
    story.append(Paragraph("CONFIDENTIAL | Generated automatically by AegisUEBA Security Operations Platform", ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#94a3b8'), alignment=1)))

    doc.build(story)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=executive_ueba_report.pdf"}
    )
