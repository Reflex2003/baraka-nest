from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.style import WD_STYLE_TYPE
from pathlib import Path

OUT = Path(r'C:\Users\REFLEX 2\Documents\Codex\2026-11-09\referenced-chatgpt-conversation-this-is-an\outputs\Baraka_Nest_Project_Documentation.docx')
doc = Document()
section = doc.sections[0]
section.top_margin = Inches(.62); section.bottom_margin = Inches(.62)
section.left_margin = Inches(.76); section.right_margin = Inches(.76)
section.header_distance = Inches(.28); section.footer_distance = Inches(.3)
FOREST='183B2C'; SAGE='96B779'; MINT='EAF2E8'; TERR='DF8750'; CREAM='FAFAF7'; INK='26352D'; MUTED='68766E'; WHITE='FFFFFF'; LINE='DCE6DA'

def shade(cell, fill):
    tcPr=cell._tc.get_or_add_tcPr(); shd=OxmlElement('w:shd'); shd.set(qn('w:fill'),fill); tcPr.append(shd)
def margins(cell, top=110, start=130, bottom=110, end=130):
    tc=cell._tc; tcPr=tc.get_or_add_tcPr(); mar=OxmlElement('w:tcMar')
    for tag,val in [('top',top),('start',start),('bottom',bottom),('end',end)]:
        el=OxmlElement('w:'+tag); el.set(qn('w:w'),str(val)); el.set(qn('w:type'),'dxa'); mar.append(el)
    tcPr.append(mar)
def set_cell(cell, text, *, color=INK, bold=False, size=9.2, fill=None, align=None):
    cell.text=''; cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
    if fill: shade(cell,fill)
    margins(cell)
    p=cell.paragraphs[0]
    if align is not None: p.alignment=align
    p.paragraph_format.space_after=Pt(0); p.paragraph_format.space_before=Pt(0)
    r=p.add_run(text); r.bold=bold; r.font.name='Aptos'; r.font.size=Pt(size); r.font.color.rgb=RGBColor.from_string(color)
    return p
def border_table(table, color=LINE, sz='6'):
    tblPr=table._tbl.tblPr; borders=OxmlElement('w:tblBorders')
    for edge in ('top','left','bottom','right','insideH','insideV'):
        e=OxmlElement('w:'+edge); e.set(qn('w:val'),'single'); e.set(qn('w:sz'),sz); e.set(qn('w:color'),color); borders.append(e)
    tblPr.append(borders)
def keep(p):
    p.paragraph_format.keep_with_next=True

def para(text='', size=10, color=INK, bold=False, before=0, after=5, align=None, italic=False):
    p=doc.add_paragraph(); p.paragraph_format.space_before=Pt(before); p.paragraph_format.space_after=Pt(after); p.paragraph_format.line_spacing=1.12
    if align is not None: p.alignment=align
    r=p.add_run(text); r.font.name='Aptos'; r.font.size=Pt(size); r.font.bold=bold; r.font.italic=italic; r.font.color.rgb=RGBColor.from_string(color)
    return p
def heading(text, level=1):
    p=doc.add_paragraph(style=f'Heading {level}'); p.paragraph_format.space_before=Pt(10 if level==1 else 6); p.paragraph_format.space_after=Pt(4); p.paragraph_format.keep_with_next=True
    r=p.add_run(text); r.font.name='Aptos Display'; r.font.size=Pt(19 if level==1 else 12); r.font.bold=True; r.font.color.rgb=RGBColor.from_string(FOREST if level==1 else TERR)
    return p
def bullets(items):
    for item in items:
        p=doc.add_paragraph(style='List Bullet'); p.paragraph_format.space_after=Pt(2); p.paragraph_format.left_indent=Inches(.21); p.paragraph_format.first_line_indent=Inches(-.12); p.paragraph_format.line_spacing=1.08
        r=p.add_run(item); r.font.name='Aptos'; r.font.size=Pt(9.3); r.font.color.rgb=RGBColor.from_string(INK)
def band(label, body, color=FOREST):
    t=doc.add_table(rows=1,cols=1); t.alignment=WD_TABLE_ALIGNMENT.CENTER
    c=t.cell(0,0); c.text=''; shade(c,color); margins(c,160,200,160,200)
    p=c.paragraphs[0]; p.paragraph_format.space_after=Pt(2); r=p.add_run(label.upper()); r.font.name='Aptos'; r.font.size=Pt(8); r.bold=True; r.font.color.rgb=RGBColor.from_string('E8B28E')
    p=c.add_paragraph(); p.paragraph_format.space_after=Pt(0); p.paragraph_format.line_spacing=1.1; r=p.add_run(body); r.font.name='Aptos'; r.font.size=Pt(10); r.font.color.rgb=RGBColor.from_string(WHITE)
    border_table(t,color,sz='0')
    doc.add_paragraph().paragraph_format.space_after=Pt(0)
def diagram(nodes, fills=None):
    fills=fills or [MINT]*len(nodes)
    t=doc.add_table(rows=1,cols=len(nodes)); t.alignment=WD_TABLE_ALIGNMENT.CENTER; t.autofit=True
    for i,(c,label) in enumerate(zip(t.rows[0].cells,nodes)):
        set_cell(c,label,color=FOREST,bold=True,size=8.3,fill=fills[i],align=WD_ALIGN_PARAGRAPH.CENTER)
    border_table(t,WHITE,'12'); para('',size=2,after=1)
def grid(headers, rows, widths=None):
    t=doc.add_table(rows=1,cols=len(headers)); t.alignment=WD_TABLE_ALIGNMENT.CENTER; t.autofit=True
    for c,h in zip(t.rows[0].cells,headers): set_cell(c,h,color=WHITE,bold=True,size=8.2,fill=FOREST)
    for idx,row in enumerate(rows):
        cells=t.add_row().cells
        for c,val in zip(cells,row): set_cell(c,val,size=8.4,fill=CREAM if idx%2==0 else 'F1F5EF')
    border_table(t); para('',size=2,after=1)

def page_label(n, title, subtitle):
    para(n, size=8, color=TERR, bold=True, before=1, after=2)
    heading(title,1); para(subtitle,size=9.5,color=MUTED,after=6)

# Document styles
styles=doc.styles
normal=styles['Normal']; normal.font.name='Aptos'; normal.font.size=Pt(9.5); normal.font.color.rgb=RGBColor.from_string(INK)
for name in ['Heading 1','Heading 2']:
    styles[name].font.name='Aptos Display'
# Header/footer
header=section.header.paragraphs[0]; header.alignment=WD_ALIGN_PARAGRAPH.RIGHT
r=header.add_run('BARAKA NEST     /     PROJECT DOCUMENTATION'); r.font.name='Aptos'; r.font.size=Pt(7.5); r.font.bold=True; r.font.color.rgb=RGBColor.from_string(FOREST)
footer=section.footer.paragraphs[0]; footer.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=footer.add_run('IAN MORGAN MWENDE   •   BSC INFORMATION TECHNOLOGY   |   '); r.font.name='Aptos'; r.font.size=Pt(7.5); r.font.color.rgb=RGBColor.from_string(MUTED)
fld=OxmlElement('w:fldSimple'); fld.set(qn('w:instr'),'PAGE'); footer._p.append(fld)

# Cover page
p=doc.add_paragraph(); p.paragraph_format.space_before=Pt(72); p.paragraph_format.space_after=Pt(4)
r=p.add_run('BARAKA'); r.font.name='Aptos Display'; r.font.size=Pt(43); r.bold=True; r.font.color.rgb=RGBColor.from_string(FOREST)
r=p.add_run(' NEST'); r.font.name='Aptos Display'; r.font.size=Pt(43); r.bold=True; r.font.color.rgb=RGBColor.from_string(TERR)
para('Find a place. Find your people.',size=18,color=FOREST,bold=True,after=14)
para('PROJECT DOCUMENTATION',size=10,color=TERR,bold=True,after=5)
para('A student-focused platform for finding rental housing and compatible roommates.',size=12,color=MUTED,after=20)
band('Built for student housing searches','Baraka Nest brings rental discovery, roommate profiles and communication tools into one place, so students can make a more informed start when planning where to live.')
para('PREPARED BY',size=8,color=TERR,bold=True,before=26,after=4)
para('Ian Morgan Mwende',size=16,color=FOREST,bold=True,after=2)
para('Bachelor of Science in Information Technology  •  2026',size=9,color=MUTED,after=16)
diagram(['CREATE A PROFILE','EXPLORE RENTALS','COMPARE ROOMMATES','CONNECT & PLAN'],[MINT,'EAF2E8','F4E8DE','EAF2E8'])
para('Competition presentation copy  •  Murang’a University of Technology Innovation Week 2026',size=8,color=MUTED,before=16,after=0)

# Page 2

doc.add_page_break(); page_label('01  /  PURPOSE','Project overview','What Baraka Nest helps students do and who the platform is designed for.')
band('The idea','Moving for college can be stressful. Baraka Nest gives students a shared starting point to explore rental homes and find potential roommates.')
heading('The problem',2)
para('Students often rely on scattered rental posts and informal social channels. Details may be incomplete, and comparing budget, location and lifestyle across possible housemates takes time. Baraka Nest brings these discovery tasks together in a student-focused website.',after=5)
heading('Project objectives',2)
bullets(['Make rental options easier to browse and compare.','Help students discover potential roommates using profile preferences.','Support communication through connection requests and messages.','Give administrators tools to manage listings, user reports, reviews and announcements.','Keep the experience usable on common desktop and mobile screen sizes.'])
heading('Intended users',2)
grid(['USER','NEED','PLATFORM SUPPORT'],[
('Student / renter','Find a suitable rental and potential housemate.','Housing search, roommate profiles, preference indicators, connections and messages.'),
('Administrator','Keep platform information current and manage activity.','Listing and account tools, moderation workflows, announcements and admin profile.')])
heading('Main features',2)
grid(['AREA','WHAT USERS CAN DO'],[
('Accounts and profiles','Register, sign in, update personal details, upload a profile photo or choose a supplied avatar.'),
('Roommate discovery','Browse student profiles and compare preference indicators such as budget, area, lifestyle and interests.'),
('Housing','Browse and filter rental listings, review details, view photos and save favourites.'),
('Communication','Manage connection requests, messages and in-app notifications.'),
('Administration','Manage housing content, user records, moderation and multiple announcements with attached media.')])
para('Profile matching is a discovery aid. Students should confirm important details directly and use their own judgement when choosing a roommate.',size=8.5,color=MUTED,italic=True,before=3)

# Page 3

doc.add_page_break(); page_label('02  /  DESIGN','How the system fits together','The browser presents the experience while server routes handle protected operations and data access.')
heading('High-level architecture',2)
diagram(['STUDENT / ADMIN BROWSER','NEXT.JS PAGES & UI','API ROUTES + AUTH CHECKS','TURSO / LIBSQL','VERCEL BLOB'],[MINT,'EAF2E8','F4E8DE','EAF2E8',MINT])
para('The interface sends requests to the application server. Server routes check the user session and permissions before changing protected records. The database stores platform information, while Blob stores uploaded media.',size=9.3,after=5)
heading('Student journey',2)
diagram(['REGISTER','COMPLETE PROFILE','EXPLORE RENTALS','COMPARE ROOMMATES','CONNECT'],[MINT,MINT,'EAF2E8','F4E8DE',MINT])
heading('Roommate discovery',2)
para('Students enter preferences in their profiles. Baraka Nest uses the available details to show discovery indicators that help users decide whose profile to open. A match score is not a guarantee of compatibility.',size=9.3,after=5)
heading('Data relationships',2)
diagram(['USER','PROFILE & PREFERENCES','CONNECTIONS / MESSAGES','HOUSING & PHOTOS','ANNOUNCEMENTS & FILES'])
para('This is a conceptual view of the main records, not a complete database schema. Authentication records and platform features are stored through the app’s persistence layer.',size=8.8,color=MUTED,after=5)
heading('Technology stack',2)
grid(['TECHNOLOGY','ROLE IN BARAKA NEST'],[
('Next.js 16 + React 19','Page routing, server endpoints and interactive interface.'),('TypeScript','Types for application data and UI logic.'),('Tailwind CSS 4','Responsive interface styling.'),('Better Auth','Authentication and session handling.'),('Kysely + libSQL client','Typed SQL queries and database connectivity.'),('Turso / libSQL','Persistent application records.'),('Vercel Blob','Cloud storage for profile images, listing photos and announcement attachments.')])

# Page 4

doc.add_page_break(); page_label('03  /  OPERATIONS','Uploads and configuration','Profile avatars upload through authenticated server routes; listing and announcement uploads use the shared Blob upload flow.')
heading('Profile and admin avatar uploads',2)
diagram(['SELECT IMAGE','SERVER CHECKS SESSION + FILE','UPLOAD TO BLOB','SAVE URL IN DATABASE'],[MINT,'F4E8DE','EAF2E8',MINT])
bullets(['The signed-in user can update their own profile image.','The administrator image route checks the configured super-admin identity.','Only supported image types are accepted, and avatar files must be 4 MB or smaller.','The server uploads with a valid BLOB_READ_WRITE_TOKEN or Vercel OIDC credentials paired with BLOB_STORE_ID.'])
heading('Listing and announcement attachments',2)
diagram(['CHOOSE FILE','REQUEST UPLOAD TOKEN','SERVER CHECKS ROLE + PURPOSE','UPLOAD TO BLOB','SAVE FILE REFERENCE'],[MINT,'EAF2E8','F4E8DE','EAF2E8',MINT])
para('These upload forms use the client-token flow. Configure the connected Blob store’s read-write token in the correct Vercel environment. A missing or placeholder token can cause “Failed to retrieve the client token.”',size=9.1,after=5)
heading('Deployment configuration checklist',2)
grid(['SETTING','WHAT TO CHECK'],[
('Blob storage','Connect the intended Blob store to the Baraka Nest Vercel project.'),('Profile/admin avatar access','Provide the read-write token or ensure Vercel OIDC and BLOB_STORE_ID are available in the deployment.'),('Other file uploads','Set a valid BLOB_READ_WRITE_TOKEN in each environment that needs listing or announcement uploads.'),('App environment','Configure database URL/token, Better Auth secret and the deployed base URL.'),('After changes','Redeploy after changing Vercel environment variables; restart local development after editing .env.local.')])
band('Keep secrets private','Do not commit .env.local or share token values in screenshots, chat messages or a public repository.',color=FOREST)
heading('Local development',2)
for s in ['Install Node.js and run npm install.','Copy .env.example to .env.local and add the required local settings.','Start the app with npm run dev and open the local address shown in the terminal.']:
    p=doc.add_paragraph(style='List Number'); p.paragraph_format.space_after=Pt(2); r=p.add_run(s); r.font.name='Aptos'; r.font.size=Pt(9.2); r.font.color.rgb=RGBColor.from_string(INK)

# Page 5

doc.add_page_break(); page_label('04  /  REFERENCE','Project map and next steps','A short guide to the main screens, source folders and current project limits.')
heading('Main screens',2)
grid(['ROUTE','PURPOSE'],[
('/','Platform introduction and entry point.'),('/houses','Browse available housing listings.'),('/find-my-place','Search and filter for rental housing.'),('/roommates','Discover potential roommates.'),('/roommates/[id]','View an individual roommate profile.'),('/messages','Read and send messages.'),('/profile','Manage profile details, image and avatar.'),('/dashboard','View personal activity and housing information.'),('/notifications','View in-app notifications.'),('/contact','Reach the Baraka Nest administrator.'),('/nest-control-panel','Administrator workspace.'),('/terms and /privacy','Review platform terms and privacy information.')])
heading('Repository structure',2)
grid(['FOLDER','CONTENTS'],[
('app/','Pages, layouts, client screens and API routes.'),('app/api/','Authentication, profiles, housing, roommate, admin and upload endpoints.'),('components/','Reusable interface elements, including profile image viewing and social links.'),('lib/','Database, authentication, upload helpers and shared application rules.'),('public/','Static files, logos and locally stored avatar images.'),('docs/','Project documentation and presentation materials.')])
heading('Security and project limits',2)
bullets(['Protected server routes check the user session and role before sensitive operations.','Upload handlers check file type, size, ownership or admin permissions before storing images.','Secrets belong in environment variables and must stay out of source control.','Listing verification is outside the current project scope; students should confirm property details with the provider.','Roommate indicators depend on information users enter and cannot guarantee compatibility.','A live deployment should be checked with its production database, Blob settings and current listing data.'])
heading('Practical next steps',2)
bullets(['Test profile, listing and announcement uploads in the deployed environment.','Review registration, profile editing and search on both mobile and desktop.','Keep rental listings accurate and explain how students can contact providers.','Collect student feedback and improve search filters, accessibility and onboarding.','Document how the database and uploaded media will be backed up.'])
band('Project direction','Baraka Nest is designed to make student housing and roommate discovery easier to navigate, with clear details and practical ways to connect.')
para('Prepared by Ian Morgan Mwende  •  Bachelor of Science in Information Technology  •  2026',size=8,color=MUTED,before=8,after=0,align=WD_ALIGN_PARAGRAPH.CENTER)

# Core metadata and save
props=doc.core_properties; props.title='Baraka Nest Project Documentation'; props.subject='Student rental housing and roommate discovery platform'; props.author='Ian Morgan Mwende'; props.keywords='Baraka Nest, student housing, roommate discovery, documentation'
OUT.parent.mkdir(parents=True,exist_ok=True); doc.save(OUT)
print(OUT)
