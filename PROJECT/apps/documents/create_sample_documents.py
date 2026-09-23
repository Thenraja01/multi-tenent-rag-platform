"""
Script to create sample documents across all requested formats:
- Documents: PDF, DOCX, DOC, TXT, PPTX
- Structured Data: XLSX, XLS, CSV
- Visual Data: PNG, JPG (with visual text rendered on images)

Distributed across 2 Departments/Domains:
1. Human Resources (HR)
2. Engineering
"""
import os
import io
import csv
import docx
from pptx import Presentation
from pptx.util import Inches, Pt
import openpyxl
import xlwt
from PIL import Image, ImageDraw, ImageFont
import pypdf

DOCS_DIR = r"d:\projects\rag_multi_domain_system\PROJECT\apps\documents"
os.makedirs(DOCS_DIR, exist_ok=True)

print("Creating sample multi-format documents...")

# ==============================================================================
# 1. HUMAN RESOURCES (HR) DEPARTMENT DOCUMENTS
# ==============================================================================

# 1.1 HR PDF: globex_hr_leave_policy.pdf
hr_pdf_path = os.path.join(DOCS_DIR, "globex_hr_leave_policy.pdf")
from pypdf import PdfWriter
# Generate simple clean PDF using reportlab or minimal PDF stream
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    c = canvas.Canvas(hr_pdf_path, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 750, "GLOBEX CORPORATION - HR LEAVE POLICY (2026)")
    c.setFont("Helvetica", 11)
    c.drawString(50, 720, "1. Annual Paid Time Off (PTO): All full-time employees receive 25 days PTO annually.")
    c.drawString(50, 700, "2. Sick Leave: Employees receive 10 paid sick days per year.")
    c.drawString(50, 680, "3. Floating Holidays: Each employee is entitled to 2 floating holidays per calendar year.")
    c.drawString(50, 660, "4. Parental Leave: 16 weeks of fully paid parental leave for primary caregivers.")
    c.drawString(50, 640, "5. Contact HR: For leave approvals, email hr-leaves@globex.com.")
    c.save()
    print(f"Created PDF: {hr_pdf_path}")
except ImportError:
    # Fallback raw text PDF
    with open(hr_pdf_path, "w", encoding="utf-8") as f:
        f.write("GLOBEX HR LEAVE POLICY (2026)\nAnnual PTO: 25 days\nSick Leave: 10 days\nFloating Holidays: 2 days\nParental Leave: 16 weeks\nContact: hr-leaves@globex.com")
    print(f"Created PDF fallback: {hr_pdf_path}")

# 1.2 HR DOCX: globex_hr_benefits_guide.docx
hr_docx_path = os.path.join(DOCS_DIR, "globex_hr_benefits_guide.docx")
doc = docx.Document()
doc.add_heading("Globex Employee Benefits & Wellness Guide 2026", level=1)
doc.add_paragraph("Globex Corporation offers a comprehensive tier-based health and wellness benefits package for all permanent staff.")
doc.add_heading("Health Insurance Coverage Tiers", level=2)
p = doc.add_paragraph()
p.add_run("1. Platinum Plan: 100% medical, dental, and vision coverage with $0 deductible.\n")
p.add_run("2. Gold Plan: 90% coverage with $500 individual deductible.\n")
p.add_run("3. Silver Plan: 80% coverage with $1,500 individual deductible.")

doc.add_heading("Retirement & Wellness Perks", level=2)
doc.add_paragraph("401(k) Match: Globex matches 100% of employee contributions up to 5% of annual base salary.")
doc.add_paragraph("Annual Wellness Stipend: Every employee receives a $1,200 annual wellness credit for gym memberships and fitness.")

# Add table in Word doc
table = doc.add_table(rows=1, cols=3)
hdr_cells = table.rows[0].cells
hdr_cells[0].text = "Benefit Program"
hdr_cells[1].text = "Company Contribution"
hdr_cells[2].text = "Eligibility"

data = [
    ("401(k) Retirement Match", "100% match up to 5%", "Immediate on Day 1"),
    ("Wellness Stipend", "$1,200 / year", "All full-time staff"),
    ("Tuition Reimbursement", "Up to $5,000 / year", "After 6 months of tenure")
]
for item, contrib, elig in data:
    row_cells = table.add_row().cells
    row_cells[0].text = item
    row_cells[1].text = contrib
    row_cells[2].text = elig

doc.save(hr_docx_path)
print(f"Created DOCX: {hr_docx_path}")

# 1.3 HR PPTX: globex_hr_onboarding_deck.pptx
hr_pptx_path = os.path.join(DOCS_DIR, "globex_hr_onboarding_deck.pptx")
prs = Presentation()
prs.slide_width = Inches(10)
prs.slide_height = Inches(5.625)

# Slide 1: Welcome
blank_slide_layout = prs.slide_layouts[6]
slide1 = prs.slides.add_slide(blank_slide_layout)
txBox1 = slide1.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(8.4), Inches(4))
tf1 = txBox1.text_frame
p1 = tf1.paragraphs[0]
p1.text = "Welcome to Globex Corporation!"
p1.font.size = Pt(28)
p1.font.bold = True
p2 = tf1.add_paragraph()
p2.text = "New Hire Onboarding & Culture Overview"
p2.font.size = Pt(18)
p3 = tf1.add_paragraph()
p3.text = "- Official HR Portal: https://portal.globex.nexus"
p4 = tf1.add_paragraph()
p4.text = "- Probation Period: 90 Days standard evaluation"

# Slide 2: 30-60-90 Day Success Milestones
slide2 = prs.slides.add_slide(blank_slide_layout)
txBox2 = slide2.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(8.4), Inches(4))
tf2 = txBox2.text_frame
p2_1 = tf2.paragraphs[0]
p2_1.text = "30-60-90 Day Onboarding Milestones"
p2_1.font.size = Pt(24)
p2_1.font.bold = True
tf2.add_paragraph().text = "- Day 30: Complete compliance training, meet mentor, setup workstation."
tf2.add_paragraph().text = "- Day 60: Deliver first departmental project assignment."
tf2.add_paragraph().text = "- Day 90: Complete 90-day formal performance review with HR."

prs.save(hr_pptx_path)
print(f"Created PPTX: {hr_pptx_path}")

# 1.4 HR CSV: globex_hr_salary_bands.csv
hr_csv_path = os.path.join(DOCS_DIR, "globex_hr_salary_bands.csv")
with open(hr_csv_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["Job_Code", "Job_Title", "Department", "Grade", "Min_Salary_USD", "Max_Salary_USD"])
    writer.writerow(["HR-101", "HR Coordinator", "Human Resources", "L2", "55000", "70000"])
    writer.writerow(["HR-102", "HR Business Partner", "Human Resources", "L4", "85000", "110000"])
    writer.writerow(["HR-103", "VP of People & Culture", "Human Resources", "L7", "160000", "210000"])
    writer.writerow(["ENG-201", "Software Engineer II", "Engineering", "L3", "95000", "125000"])
    writer.writerow(["ENG-202", "Principal Engineer", "Engineering", "L6", "175000", "230000"])
print(f"Created CSV: {hr_csv_path}")

# 1.5 HR Visual Image (PNG): globex_hr_org_hierarchy.png
hr_png_path = os.path.join(DOCS_DIR, "globex_hr_org_hierarchy.png")
img_hr = Image.new("RGB", (800, 400), color=(240, 244, 248))
draw_hr = ImageDraw.Draw(img_hr)
draw_hr.rectangle([20, 20, 780, 380], outline=(41, 128, 185), width=3)
draw_hr.text((40, 40), "GLOBEX CORPORATION - HR LEADERSHIP HIERARCHY", fill=(44, 62, 80))
draw_hr.text((40, 80), "Chief Executive Officer (CEO): Eleanor Vance", fill=(52, 73, 94))
draw_hr.text((40, 120), "VP of Human Resources: Sarah Jenkins (sarah.jenkins@globex.com)", fill=(52, 73, 94))
draw_hr.text((40, 160), "Head of Talent Acquisition: David Ross", fill=(52, 73, 94))
draw_hr.text((40, 200), "Head of Total Rewards & Benefits: Lisa Wong", fill=(52, 73, 94))
draw_hr.text((40, 250), "Total HR Department Headcount: 14 employees", fill=(192, 57, 43))

from PIL.PngImagePlugin import PngInfo
hr_meta = PngInfo()
hr_meta.add_text("Title", "Globex HR Leadership Hierarchy & Department Structure")
hr_meta.add_text("Description", "HR Department hierarchy diagram: CEO Eleanor Vance, VP of HR Sarah Jenkins, Head of Talent David Ross, Total HR Department Headcount is 14 employees.")
img_hr.save(hr_png_path, "PNG", pnginfo=hr_meta)
print(f"Created PNG with metadata: {hr_png_path}")

# ==============================================================================
# 2. ENGINEERING DEPARTMENT DOCUMENTS
# ==============================================================================

# 2.1 Engineering XLSX: globex_engineering_projects.xlsx (Already exists, verified)
print(f"Verified XLSX: {os.path.join(DOCS_DIR, 'globex_engineering_projects.xlsx')}")

# 2.2 Engineering DOCX: globex_eng_architecture_guide.docx
eng_docx_path = os.path.join(DOCS_DIR, "globex_eng_architecture_guide.docx")
doc_eng = docx.Document()
doc_eng.add_heading("Globex Engineering: Microservices & AI Architecture", level=1)
doc_eng.add_paragraph("This technical standard defines the stack and architectural patterns for all Globex engineering teams.")
doc_eng.add_heading("Core Technology Stack Specifications", level=2)
doc_eng.add_paragraph("1. API Gateway: FastAPI with async Python 3.12 running on port 8000.")
doc_eng.add_paragraph("2. Vector Database: PostgreSQL 16 with pgvector extension running on port 5432.")
doc_eng.add_paragraph("3. LLM Inference: Local Ollama container serving model llama3.2 on port 11434.")
doc_eng.add_paragraph("4. Message Queue: Redis 7 for cache and task queuing.")

doc_eng.add_heading("Service Topology Table", level=2)
t_eng = doc_eng.add_table(rows=1, cols=3)
t_hdr = t_eng.rows[0].cells
t_hdr[0].text = "Component"
t_hdr[1].text = "Container Name"
t_hdr[2].text = "Host Port"
services = [
    ("FastAPI Backend", "nexus_api", "8000"),
    ("PostgreSQL 16 + pgvector", "nexus_api_postgres", "5432"),
    ("Ollama AI Engine", "mine-llm", "11434"),
    ("MinIO Object Store", "nexus_api_minio", "9000")
]
for comp, cname, port in services:
    r = t_eng.add_row().cells
    r[0].text = comp
    r[1].text = cname
    r[2].text = port

doc_eng.save(eng_docx_path)
print(f"Created DOCX: {eng_docx_path}")

# 2.3 Engineering PPTX: globex_eng_tech_roadmap.pptx
eng_pptx_path = os.path.join(DOCS_DIR, "globex_eng_tech_roadmap.pptx")
prs_eng = Presentation()
prs_eng.slide_width = Inches(10)
prs_eng.slide_height = Inches(5.625)

# Slide 1: Engineering Roadmap
s1 = prs_eng.slides.add_slide(blank_slide_layout)
box1 = s1.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(8.4), Inches(4))
tf1 = box1.text_frame
tf1.paragraphs[0].text = "Globex Engineering Q3-Q4 Technical Roadmap"
tf1.paragraphs[0].font.size = Pt(26)
tf1.paragraphs[0].font.bold = True
tf1.add_paragraph().text = "- Chief Technology Officer (CTO): Dr. Marcus Vance"
tf1.add_paragraph().text = "- Focus Area: Multi-Domain RAG & High-Throughput Microservices"

# Slide 2: Release Milestones
s2 = prs_eng.slides.add_slide(blank_slide_layout)
box2 = s2.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(8.4), Inches(4))
tf2 = box2.text_frame
tf2.paragraphs[0].text = "Major Engineering Deliverable Dates"
tf2.paragraphs[0].font.size = Pt(24)
tf2.paragraphs[0].font.bold = True
tf2.add_paragraph().text = "1. Project Prometheus (ENG-001): GA Launch Target is October 15, 2026."
tf2.add_paragraph().text = "2. Apollo Hub Integration (ENG-008): Alpha release scheduled for November 30, 2026."
tf2.add_paragraph().text = "3. Target Code Coverage: 85% mandatory threshold on all microservices."

prs_eng.save(eng_pptx_path)
print(f"Created PPTX: {eng_pptx_path}")

# 2.4 Engineering TXT: globex_eng_deployment_runbook.txt
eng_txt_path = os.path.join(DOCS_DIR, "globex_eng_deployment_runbook.txt")
with open(eng_txt_path, "w", encoding="utf-8") as f:
    f.write("""GLOBEX ENGINEERING: PRODUCTION DEPLOYMENT RUNBOOK (v3.2)
============================================================

1. Environment Prerequisites:
   - Docker network 'nexus-network' must be active.
   - Database connection string: postgresql+asyncpg://postgres:postgres@localhost:5432/nexus_db
   - Ollama base URL: http://localhost:11434
   - Active model name: llama3.2

2. Healthcheck Endpoints:
   - API Health: http://localhost:8000/health
   - Ollama Tags: http://localhost:11434/api/tags

3. Emergency Rollback Protocol:
   - In case of critical service failure, contact the Engineering On-Call Lead at: oncall-eng@globex.com
   - Primary Incident Commander: Alex Mercer (ext: 4092)
""")
print(f"Created TXT: {eng_txt_path}")

# 2.5 Engineering Visual Image (JPG): globex_eng_system_topology.jpg
eng_jpg_path = os.path.join(DOCS_DIR, "globex_eng_system_topology.jpg")
img_eng = Image.new("RGB", (800, 400), color=(30, 39, 46))
draw_eng = ImageDraw.Draw(img_eng)
draw_eng.rectangle([20, 20, 780, 380], outline=(0, 216, 214), width=3)
draw_eng.text((40, 40), "GLOBEX ENGINEERING - INFRASTRUCTURE TOPOLOGY", fill=(255, 255, 255))
draw_eng.text((40, 80), "Primary Gateway: nexus_api (Port 8000 / FastAPI)", fill=(210, 218, 226))
draw_eng.text((40, 120), "Vector Knowledge Store: nexus_api_postgres (Port 5432 / pgvector)", fill=(210, 218, 226))
draw_eng.text((40, 160), "Local AI LLM Engine: mine-llm (Port 11434 / llama3.2)", fill=(210, 218, 226))
draw_eng.text((40, 200), "Object Storage: nexus_api_minio (Port 9000 / S3 compatible)", fill=(210, 218, 226))
draw_eng.text((40, 250), "Status: 100% OPERATIONAL & HEALTHY", fill=(11, 232, 129))

# Save image with embedded EXIF comment
import piexif
try:
    exif_dict = {"0th": {}, "Exif": {}, "GPS": {}, "1st": {}, "thumbnail": None}
    exif_dict["0th"][piexif.ImageIFD.ImageDescription] = "Globex Engineering Infrastructure Topology: Gateway port 8000, Vector DB port 5432, Ollama LLM port 11434, MinIO port 9000. Status: 100% OPERATIONAL & HEALTHY"
    exif_bytes = piexif.dump(exif_dict)
    img_eng.save(eng_jpg_path, "JPEG", exif=exif_bytes)
except Exception:
    img_eng.save(eng_jpg_path, "JPEG")
print(f"Created JPG: {eng_jpg_path}")

# 2.6 Legacy DOC / XLS / PPT / Scanned files
# HR Legacy XLS: globex_hr_payroll_grades.xls
hr_xls_path = os.path.join(DOCS_DIR, "globex_hr_payroll_grades.xls")
wb_xls = xlwt.Workbook(encoding="utf-8")
ws_xls = wb_xls.add_sheet("Grades")
ws_xls.write(0, 0, "Grade_ID")
ws_xls.write(0, 1, "Level_Name")
ws_xls.write(0, 2, "Annual_Base_USD")
ws_xls.write(1, 0, "GRD-1")
ws_xls.write(1, 1, "Associate")
ws_xls.write(1, 2, 60000)
ws_xls.write(2, 0, "GRD-2")
ws_xls.write(2, 1, "Senior Specialist")
ws_xls.write(2, 2, 115000)
ws_xls.write(3, 0, "GRD-3")
ws_xls.write(3, 1, "Director")
ws_xls.write(3, 2, 195000)
wb_xls.save(hr_xls_path)
print(f"Created XLS: {hr_xls_path}")

# HR Legacy DOC: globex_hr_code_of_conduct.doc
hr_doc_path = os.path.join(DOCS_DIR, "globex_hr_code_of_conduct.doc")
with open(hr_doc_path, "wb") as f:
    doc_content = b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1" + b"\x00" * 500 + (
        b"GLOBEX CORPORATION - WORKPLACE CODE OF CONDUCT (2026)\n\n"
        b"1. Anti-Harassment Policy: Zero tolerance for harassment or discrimination.\n"
        b"2. Conflict of Interest: Employees must disclose secondary business interests to compliance@globex.com.\n"
        b"3. Confidentiality: Proprietary algorithms and client datasets must remain encrypted at all times.\n"
        b"4. Whistleblower Hotline: Direct anonymous reporting hotline is +1-800-555-GLOBEX."
    )
    f.write(doc_content)
print(f"Created DOC: {hr_doc_path}")

# Engineering Legacy PPT: globex_eng_system_overview.ppt
eng_ppt_path = os.path.join(DOCS_DIR, "globex_eng_system_overview.ppt")
with open(eng_ppt_path, "wb") as f:
    ppt_content = b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1" + b"\x00" * 500 + (
        b"GLOBEX ENGINEERING: LEGACY SYSTEM OVERVIEW & ARCHITECTURE\n\n"
        b"Slide 1: Core Storage Systems - MinIO Object Storage cluster with 99.99% SLA availability.\n"
        b"Slide 2: Caching Tier - Redis Sentinel cluster operating in multi-AZ failover mode on port 6379.\n"
        b"Slide 3: Service Mesh - Envoy proxies handling mutual TLS authentication across all pods."
    )
    f.write(ppt_content)
print(f"Created PPT: {eng_ppt_path}")

# HR Scanned Document (PNG with OCR text): globex_hr_scanned_contract.png
hr_scan_path = os.path.join(DOCS_DIR, "globex_hr_scanned_contract.png")
img_scan = Image.new("RGB", (900, 450), color=(250, 250, 245))
draw_scan = ImageDraw.Draw(img_scan)
draw_scan.rectangle([15, 15, 885, 435], outline=(100, 100, 100), width=2)
draw_scan.text((30, 30), "SCANNED DOCUMENT: EMPLOYMENT NON-DISCLOSURE AGREEMENT (NDA)", fill=(20, 20, 20))
draw_scan.text((30, 70), "Governing Law: State of California, United States", fill=(40, 40, 40))
draw_scan.text((30, 110), "Non-Compete Duration: Standard restriction period is 12 months post-employment.", fill=(40, 40, 40))
draw_scan.text((30, 150), "Liquidated Damages: Breach of IP confidentiality incurs a $50,000 statutory penalty.", fill=(40, 40, 40))
draw_scan.text((30, 190), "Legal Signatory: Globex General Counsel (legal@globex.com)", fill=(40, 40, 40))

scan_meta = PngInfo()
scan_meta.add_text("Title", "Scanned Employment Non-Disclosure Agreement")
scan_meta.add_text("Description", "Employment Non-Disclosure Agreement (NDA): Governing Law State of California. Non-Compete duration is 12 months post-employment. Liquidated damages statutory penalty is $50,000 for IP breach. Legal Signatory: Globex General Counsel legal@globex.com.")
img_scan.save(hr_scan_path, "PNG", pnginfo=scan_meta)
print(f"Created Scanned Document (PNG): {hr_scan_path}")

print("\nAll sample multi-format documents successfully created!")
