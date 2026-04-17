import os
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.units import inch

# Get absolute path to the logo
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO3_PATH = os.path.join(BASE_DIR, "static", "images", "logo3.png")

def generate_invoice_pdf(data: dict) -> BytesIO:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=22,
        textColor=colors.black,
        alignment=1, # Center
        spaceAfter=15
    )
    
    label_style = ParagraphStyle(
        'LabelStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.black,
        fontName='Helvetica-Bold'
    )

    company_info_style = ParagraphStyle(
        'CompanyInfo',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.black
    )

    logo_text_style = ParagraphStyle(
        'LogoText',
        parent=styles['Normal'],
        fontSize=12,
        fontName='Helvetica-Bold',
        textColor=colors.black,
        alignment=1 # Center
    )

    elements = []

    # 1. Header: Address (Left) and Logo+Name (Right)
    # Left Content
    address_p = Paragraph(
        "<b>AJU ED Solutions LLP</b><br/>"
        "ScrumSpace CoWorks, Arikkadamukku, South,<br/>"
        "Thiruvananthapuram, Nemom, Kerala 695020<br/><br/>"
        "<b>Invoice No.</b>  inv-" + data.get('registration_id', '00000').split('-')[-1].zfill(5) + "<br/>"
        "<b>Payment Date</b> " + datetime.now().strftime('%B %d, %Y'), 
        company_info_style
    )
    
    # Right Content (Logo + Company Name below it)
    logo_elements = []
    if os.path.exists(LOGO3_PATH):
        try:
            # Resized logo to 0.8 inch as requested for a more professional look
            logo_img = Image(LOGO3_PATH, width=0.8*inch, height=0.8*inch)
            logo_elements.append(Table([[logo_img]], colWidths=[2.3*inch], style=[('ALIGN', (0,0), (-1,-1), 'CENTER')]))
        except Exception:
            pass
    
    logo_elements.append(Paragraph("<b>AJU ED SOLUTIONS</b>", logo_text_style))
    
    right_col = Table([[l] for l in logo_elements], colWidths=[2.3*inch])
    right_col.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))

    header_table = Table([[address_p, right_col]], colWidths=[4.2*inch, 2.3*inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 40))

    # 2. Main Title
    elements.append(Paragraph("Invoice", title_style))
    elements.append(Spacer(1, 10))

    # 3. Customer Info Table
    customer_header = [
        [Paragraph("Student Information", label_style)]
    ]
    t_cust_header = Table(customer_header, colWidths=[6.5*inch])
    t_cust_header.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.black),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(t_cust_header)

    customer_data = [
        ["Student Name", Paragraph(data.get('name', 'N/A'), styles['Normal'])],
        ["Student Number", Paragraph(data.get('registration_id', 'N/A'), styles['Normal'])],
        ["Mobile Number", Paragraph(data.get('phone', 'N/A'), styles['Normal'])]
    ]
    t_cust = Table(customer_data, colWidths=[1.8*inch, 4.7*inch])
    t_cust.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.black),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    elements.append(t_cust)
    elements.append(Spacer(1, 25))

    # 4. Description & Amount Table
    desc_header = [
        ["Description", "Amount"]
    ]
    t_desc_header = Table(desc_header, colWidths=[5.3*inch, 1.2*inch])
    t_desc_header.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.black),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(t_desc_header)

    # Detailed rows
    details = [
        ["Internship Track", data.get('internshipTrack', 'N/A')],
        ["Course/Program", data.get('course', 'N/A')],
        ["Internship Period", data.get('internshipPeriod', 'N/A')],
        ["Institution", data.get('institutionName', 'N/A')],
    ]
    
    # Format details into a single Paragraph for the left cell
    details_html = "<br/><br/>".join([f"<b>{d[0]}</b>: {d[1]}" for d in details])
    
    amount_val = f"INR {data.get('amount', 0):,.2f}"
    
    main_row = [
        [Paragraph(details_html, styles['Normal']), Paragraph(f"<b>{amount_val}</b>", ParagraphStyle('Amt', parent=styles['Normal'], alignment=2))]
    ]
    
    t_main = Table(main_row, colWidths=[5.3*inch, 1.2*inch])
    t_main.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.black),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'), # Changed to MIDDLE for better look
        ('LEFTPADDING', (0,0), (0,0), 12),
        ('RIGHTPADDING', (1,0), (1,0), 12),
        ('TOPPADDING', (0,0), (-1,-1), 20),
        ('BOTTOMPADDING', (0,0), (-1,-1), 60), # Large gap for that "Agoda" feel
    ]))
    elements.append(t_main)

    # 5. Grand Total Row
    total_data = [
        ["", "TOTAL AMOUNT", amount_val]
    ]
    t_total = Table(total_data, colWidths=[3.8*inch, 1.5*inch, 1.2*inch])
    t_total.setStyle(TableStyle([
        ('GRID', (1,0), (-1,-1), 0.5, colors.black),
        ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
        ('ALIGN', (2,0), (-1,-1), 'RIGHT'),
        ('FONTNAME', (1,0), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (1,0), (1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (1,0), (1,-1), 12),
        ('RIGHTPADDING', (2,0), (2,-1), 12),
        ('BACKGROUND', (1,0), (-1,-1), colors.HexColor("#f8fafc")),
    ]))
    elements.append(t_total)
    
    elements.append(Spacer(1, 40))
    footer_text = "Thank you for choosing AJU Educational Solutions. This is an electronically generated receipt."
    elements.append(Paragraph(footer_text, ParagraphStyle('Footer', parent=styles['Normal'], alignment=1, fontSize=9, textColor=colors.grey)))

    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer
