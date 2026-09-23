# -*- coding: utf-8 -*-
import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    """Set the background color of a table cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=140, bottom=140, left=200, right=200):
    """Set cell margins in dxa (1 pt = 20 dxa)."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def set_cell_borders(cell, top=None, bottom=None, left=None, right=None):
    """Set custom borders for a table cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="{top.get('val', 'none')}" w:sz="{top.get('sz', '4')}" w:space="0" w:color="{top.get('color', 'auto')}"/>
            <w:bottom w:val="{bottom.get('val', 'none')}" w:sz="{bottom.get('sz', '4')}" w:space="0" w:color="{bottom.get('color', 'auto')}"/>
            <w:left w:val="{left.get('val', 'none')}" w:sz="{left.get('sz', '4')}" w:space="0" w:color="{left.get('color', 'auto')}"/>
            <w:right w:val="{right.get('val', 'none')}" w:sz="{right.get('sz', '4')}" w:space="0" w:color="{right.get('color', 'auto')}"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)

def create_guide_docx(output_filename):
    doc = docx.Document()

    # Set page margins (0.8 inch for clean professional layout)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Set Normal Style
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(11)
    font.color.rgb = RGBColor(0x1F, 0x29, 0x37) # Dark slate #1F2937

    # Helper: Title
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(4)
    title_run = title_p.add_run("HƯỚNG DẪN CẤU HÌNH MÔI TRƯỜNG & KHỞI CHẠY DỰ ÁN\nBACKEND VÀ FRONTEND")
    title_run.font.name = 'Arial'
    title_run.font.size = Pt(20)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A) # Deep Navy #1E3A8A

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_before = Pt(0)
    sub_p.paragraph_format.space_after = Pt(16)
    sub_run = sub_p.add_run("Tài liệu chi tiết các bước kiểm tra JDK, Node.js, cấu hình và chạy trên IntelliJ IDEA & VS Code kèm vị trí chèn ảnh minh họa")
    sub_run.font.italic = True
    sub_run.font.size = Pt(11.5)
    sub_run.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)

    # Helper: Info Header Table
    meta_tbl = doc.add_table(rows=4, cols=2)
    meta_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_tbl.autofit = False

    headers_info = [
        ("Dự án Backend", "shtech-backend-realtime (Spring Boot 4.0.3 / Java 17 / Maven / SQL Server Port 8081)"),
        ("Dự án Frontend", "cake-shop-frontend-chính (React 18 / Vite 7 / Node.js 20-22 LTS / TailwindCSS 4 Port 5173)"),
        ("Môi trường IDE", "IntelliJ IDEA (Ultimate / Community) & Visual Studio Code"),
        ("Mục đích tài liệu", "Hướng dẫn kiểm tra đúng phiên bản môi trường và các bước vận hành dự án chuẩn xác")
    ]

    for idx, (label, val) in enumerate(headers_info):
        row = meta_tbl.rows[idx]
        cell_lbl, cell_val = row.cells[0], row.cells[1]
        cell_lbl.width = Inches(1.8)
        cell_val.width = Inches(5.0)
        
        set_cell_background(cell_lbl, "F1F5F9")
        set_cell_background(cell_val, "FFFFFF")
        set_cell_margins(cell_lbl, top=100, bottom=100, left=150, right=150)
        set_cell_margins(cell_val, top=100, bottom=100, left=150, right=150)
        
        border_spec = {'val': 'single', 'sz': '4', 'color': 'CBD5E1'}
        set_cell_borders(cell_lbl, top=border_spec, bottom=border_spec, left=border_spec, right=border_spec)
        set_cell_borders(cell_val, top=border_spec, bottom=border_spec, left=border_spec, right=border_spec)

        p_lbl = cell_lbl.paragraphs[0]
        p_lbl.paragraph_format.space_after = Pt(0)
        r_lbl = p_lbl.add_run(label)
        r_lbl.font.bold = True
        r_lbl.font.size = Pt(10)
        r_lbl.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

        p_val = cell_val.paragraphs[0]
        p_val.paragraph_format.space_after = Pt(0)
        r_val = p_val.add_run(val)
        r_val.font.size = Pt(10)
        r_val.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Helper Functions
    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(15)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A) # Navy Blue
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(12.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x02, 0x84, 0xC7) # Sky Blue #0284C7
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(11.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
        return p

    def add_p(text, bold_prefix=""):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.font.bold = True
            r_bold.font.color.rgb = RGBColor(0x11, 0x18, 0x27)
        r_text = p.add_run(text)
        r_text.font.color.rgb = RGBColor(0x37, 0x41, 0x51)
        return p

    def add_bullet(text, bold_prefix=""):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.font.bold = True
            r_bold.font.color.rgb = RGBColor(0x11, 0x18, 0x27)
        r_text = p.add_run(text)
        r_text.font.color.rgb = RGBColor(0x37, 0x41, 0x51)
        return p

    def add_code(code_str, caption=""):
        if caption:
            cp = doc.add_paragraph()
            cp.paragraph_format.space_before = Pt(4)
            cp.paragraph_format.space_after = Pt(2)
            cp.paragraph_format.keep_with_next = True
            crun = cp.add_run(f"💻 {caption}")
            crun.font.bold = True
            crun.font.size = Pt(9.5)
            crun.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)

        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.8)

        set_cell_background(cell, "F8FAFC")
        set_cell_margins(cell, top=100, bottom=100, left=180, right=180)
        border_spec = {'val': 'single', 'sz': '4', 'color': 'CBD5E1'}
        set_cell_borders(cell, top=border_spec, bottom=border_spec, left=border_spec, right=border_spec)

        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.05
        run = p.add_run(code_str)
        run.font.name = 'Consolas'
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    def add_callout(text, title="LƯU Ý QUAN TRỌNG", callout_type="warning"):
        colors = {
            "warning": ("FEF3C7", "B45309", "F59E0B", "⚠️ "),
            "info": ("EFF6FF", "1D4ED8", "3B82F6", "ℹ️ "),
            "success": ("ECFDF5", "047857", "10B981", "✅ ")
        }
        bg_col, title_col, border_col, icon = colors.get(callout_type, colors["warning"])

        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.8)

        set_cell_background(cell, bg_col)
        set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
        
        left_border = {'val': 'single', 'sz': '24', 'color': border_col}
        none_border = {'val': 'none', 'sz': '0', 'color': 'auto'}
        set_cell_borders(cell, top=none_border, bottom=none_border, left=left_border, right=none_border)

        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(2)
        r_title = p.add_run(f"{icon}{title}\n")
        r_title.font.bold = True
        r_title.font.size = Pt(10)
        r_title.font.color.rgb = RGBColor(int(title_col[:2], 16), int(title_col[2:4], 16), int(title_col[4:], 16))

        r_text = p.add_run(text)
        r_text.font.size = Pt(10)
        r_text.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    def add_img_placeholder(img_id, title, instructions, what_to_capture):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.8)

        # Light purple/blue placeholder background
        set_cell_background(cell, "F0F9FF")
        set_cell_margins(cell, top=140, bottom=140, left=200, right=200)

        # Dashed border look
        dashed_border = {'val': 'dashed', 'sz': '8', 'color': '0284C7'}
        set_cell_borders(cell, top=dashed_border, bottom=dashed_border, left=dashed_border, right=dashed_border)

        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(4)

        r_icon = p.add_run(f"📸 [VỊ TRÍ CHÈN HÌNH {img_id:02d}]: {title.upper()}\n")
        r_icon.font.name = 'Arial'
        r_icon.font.bold = True
        r_icon.font.size = Pt(11)
        r_icon.font.color.rgb = RGBColor(0x03, 0x69, 0xA1) # Dark cyan/sky

        p2 = cell.add_paragraph()
        p2.paragraph_format.space_after = Pt(2)
        r_inst = p2.add_run("🔍 Đối tượng cần chụp: ")
        r_inst.font.bold = True
        r_inst.font.size = Pt(9.5)
        r_inst.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
        r_inst_txt = p2.add_run(what_to_capture + "\n")
        r_inst_txt.font.size = Pt(9.5)
        r_inst_txt.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

        r_tip = p2.add_run("👉 Hướng dẫn: ")
        r_tip.font.bold = True
        r_tip.font.size = Pt(9.5)
        r_tip.font.color.rgb = RGBColor(0xB4, 0x53, 0x09)
        r_tip_txt = p2.add_run(instructions + "\n")
        r_tip_txt.font.size = Pt(9.5)
        r_tip_txt.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)

        p3 = cell.add_paragraph()
        p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p3.paragraph_format.space_after = Pt(0)
        r_note = p3.add_run("⬇️ (Nhấp chuột vào dòng này -> Chọn thẻ Insert trên Word -> Pictures -> This Device để dán ảnh vào đây) ⬇️\n\n\n")
        r_note.font.italic = True
        r_note.font.size = Pt(9)
        r_note.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

        doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # =========================================================================
    # NỘI DUNG TÀI LIỆU
    # =========================================================================

    # PHẦN 1
    add_h1("PHẦN 1: BƯỚC KIỂM TRA MÔI TRƯỜNG DỰ ÁN ĐANG YÊU CẦU")
    add_p("Trước khi bấm chạy bất kỳ dự án nào, nguyên tắc cốt lõi là kiểm tra mã nguồn đang yêu cầu môi trường nào (phiên bản Java, Node.js, công cụ đóng gói) để tránh xung đột môi trường dẫn tới lỗi biên dịch hoặc lỗi runtime.")

    add_h2("1.1. Cách kiểm tra yêu cầu môi trường của Backend (Spring Boot)")
    add_p("Đối với dự án Backend sử dụng Java Spring Boot và Apache Maven, toàn bộ thông số phiên bản được khai báo tập trung trong file cấu hình gốc:")
    add_bullet("pom.xml (Nằm ở thư mục gốc của Backend shtech-backend-realtime)", "File cần kiểm tra: ")
    add_bullet("Mở file pom.xml và tìm cụm thẻ <properties> chứa thông số <java.version>.", "Vị trí phiên bản: ")

    add_code("""<!-- Trích đoạn từ file pom.xml của shtech-backend-realtime -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.0.3</version>
</parent>

<properties>
    <java.version>17</java.version>  <!-- YÊU CẦU: JDK 17 -->
</properties>""", "Kiểm tra thẻ java.version trong pom.xml")

    add_callout(
        "Dự án Backend shtech-backend-realtime yêu cầu chính xác JDK 17!\n"
        "Nếu máy tính của bạn cấu hình chạy bằng Java 8 (JDK 1.8) sẽ bị lỗi ClassNotFound / Unsupported Class Version (cần class version 61.0).\n"
        "Nếu chọn JDK 22 hoặc JDK 23 mới hơn mà Spring Framework chưa tương thích hoàn toàn, có thể xuất hiện cảnh báo Byte Buddy / Reflection cảnh báo Warning.",
        "KẾT LUẬN YÊU CẦU BACKEND", "warning"
    )

    add_img_placeholder(
        1, "Kiểm tra phiên bản Java trong file pom.xml",
        "Mở file pom.xml trong VS Code hoặc IntelliJ IDEA, cuộn đến dòng <java.version>17</java.version> và chụp lại màn hình.",
        "Màn hình hiển thị file pom.xml với thẻ <java.version>17</java.version> được bôi sáng."
    )

    add_h2("1.2. Cách kiểm tra các phiên bản JDK đang có trên máy tính của bạn")
    add_p("Trên hệ điều hành Windows, bạn mở PowerShell hoặc Command Prompt (CMD) và thực hiện các lệnh console sau để kiểm tra:")

    add_code("""# 1. Kiểm tra phiên bản Java mặc định đang chạy trong hệ thống
java -version

# 2. Kiểm tra phiên bản Trình biên dịch Java (Java Compiler)
javac -version

# 3. Liệt kê toàn bộ các bản JDK đã cài đặt trong thư mục Program Files (PowerShell)
Get-ChildItem "C:\\Program Files\\Java"

# 4. Kiểm tra biến môi trường JAVA_HOME hiện tại
$env:JAVA_HOME""", "Các lệnh Console kiểm tra JDK trên máy")

    add_p("Kết quả kiểm tra thực tế trên máy tính hiện tại cho thấy:")
    add_bullet("C:\\Program Files\\Java\\java-se-8u44-ri (Java 8 - Đã cũ, dùng cho các app legacy)", "JDK 8: ")
    add_bullet("C:\\Program Files\\Java\\jdk-17 (Java 17 LTS - ĐÚNG PHIÊN BẢN CẦN CHỌN)", "JDK 17: ")
    add_bullet("C:\\Program Files\\Java\\jdk-22 (Java 22)", "JDK 22: ")
    add_bullet("C:\\Program Files\\Java\\jdk-23 (Java 23)", "JDK 23: ")

    add_callout(
        "Bởi vì máy tính cài nhiều phiên bản Java, lệnh mặc định 'java -version' có thể đang trỏ về JDK 22. "
        "Do đó, TRONG CẢ INTELLIJ VÀ VS CODE, BẠN BẮT BUỘC PHẢI CHỈ ĐỊNH RÕ RÀNG ĐƯỜNG DẪN 'C:\\Program Files\\Java\\jdk-17' CHO DỰ ÁN!",
        "LỰA CHỌN PHÙ HỢP", "info"
    )

    add_img_placeholder(
        2, "Kiểm tra JDK trên máy qua PowerShell",
        "Mở PowerShell, gõ các lệnh 'java -version' và 'Get-ChildItem \"C:\\Program Files\\Java\"' rồi chụp màn hình kết quả.",
        "Cửa sổ PowerShell hiển thị danh sách các thư mục JDK trong C:\\Program Files\\Java (jdk-17, jdk-22, jdk-23)."
    )

    add_h2("1.3. Cách kiểm tra yêu cầu môi trường của Frontend (React + Vite)")
    add_p("Đối với dự án Frontend React, bạn kiểm tra 2 file quan trọng:")
    add_bullet("package.json: Xem danh sách các thư viện sử dụng (React 18.3.1, Vite 7.1.2, TailwindCSS 4.1.12, Ant Design 6.3.1).", "1. File ")
    add_bullet("Dockerfile: Khai báo môi trường container chuẩn dùng để build dự án.", "2. File ")

    add_code("""# Trích đoạn Dockerfile của dự án Frontend cake-shop-frontend-chính:
# Stage 1: Build React
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build""", "Kiểm tra Dockerfile xác định phiên bản Node.js")

    add_p("Từ Dockerfile và Vite 7, dự án yêu cầu môi trường:")
    add_bullet("Node.js phiên bản LTS: Node.js v20.x hoặc Node.js v22.x (Khuyến nghị v20.18+ hoặc v22.12+).", "Yêu cầu Node: ")
    add_bullet("npm v10.x hoặc v11.x đi kèm Node.js.", "Yêu cầu npm: ")

    add_p("Chạy các lệnh sau trên Terminal để kiểm tra Node.js trên máy bạn:")
    add_code("""# Kiểm tra phiên bản Node.js
node -v
# Kết quả mẫu: v22.9.0 (Đạt tiêu chuẩn tương thích cao)

# Kiểm tra phiên bản npm
npm -v
# Kết quả mẫu: 11.12.1""", "Kiểm tra Node & npm trên Terminal")

    add_img_placeholder(
        3, "Kiểm tra Node.js và npm trong Terminal",
        "Mở Terminal, gõ 'node -v' và 'npm -v' rồi chụp lại kết quả hiển thị.",
        "Màn hình Terminal in ra phiên bản node v20.x hoặc v22.x và npm v10/11.x."
    )

    # PHẦN 2
    add_h1("PHẦN 2: THIẾT LẬP VÀ CHẠY DỰ ÁN BACKEND TRÊN INTELLIJ VÀ VS CODE")
    add_p("Dự án Backend có tên thư mục: D:\\CTY\\shtech-backend-realtime. Backend viết bằng Spring Boot và cung cấp API Realtime cho hệ thống MES SCADA DRC tại cổng port 8081.")

    add_h2("2.1. Hướng dẫn chạy Backend trên IntelliJ IDEA (Khuyến nghị số 1)")
    add_p("IntelliJ IDEA là IDE tối ưu và mạnh mẽ nhất cho các dự án Java Spring Boot.")

    add_h3("Bước 1: Mở dự án trên IntelliJ IDEA")
    add_bullet("Khởi động IntelliJ IDEA -> Chọn File > Open...", "Thao tác: ")
    add_bullet("Trỏ đến thư mục 'D:\\CTY\\shtech-backend-realtime' hoặc click chọn trực tiếp file 'pom.xml' -> Chọn Open as Project.", "Chọn đường dẫn: ")
    add_bullet("Nếu xuất hiện thông báo 'Trust Project?', chọn Trust Project.", "Bảo mật: ")

    add_img_placeholder(
        4, "Mở dự án shtech-backend-realtime trong IntelliJ IDEA",
        "Chụp lại cửa sổ Open Project của IntelliJ khi đang chọn thư mục shtech-backend-realtime.",
        "Hộp thoại mở dự án của IntelliJ IDEA đang trỏ tới đúng thư mục Backend."
    )

    add_h3("Bước 2: Cấu hình Project SDK (Chọn đúng JDK 17)")
    add_bullet("Trên thanh menu trên cùng, vào File > Project Structure... (hoặc ấn tổ hợp phím tắt Ctrl + Alt + Shift + S).", "Mở cài đặt SDK: ")
    add_bullet("Tại menu bên trái, chọn thẻ Project.", "Mục Project: ")
    add_bullet("Tại mục SDK: Click vào danh sách xổ xuống. Nếu chưa có JDK 17, chọn Add SDK > JDK... > Trỏ tới đường dẫn: C:\\Program Files\\Java\\jdk-17.", "Chọn JDK: ")
    add_bullet("Tại mục Language level: Chọn '17 - Sealed types, always-strict floating-point, etc.'", "Ngôn ngữ: ")
    add_bullet("Bấm Apply và OK.", "Lưu thiết lập: ")

    add_img_placeholder(
        5, "Cấu hình Project SDK sang JDK 17 trong Project Structure",
        "Chụp lại màn hình hộp thoại Project Structure với mục SDK hiển thị '17' và đường dẫn C:\\Program Files\\Java\\jdk-17.",
        "Cửa sổ Project Structure với SDK 17 và Language level 17 được khoanh vùng nổi bật."
    )

    add_h3("Bước 3: Cấu hình Maven Runner sử dụng JDK 17")
    add_bullet("Vào File > Settings... (hoặc phím tắt Ctrl + Alt + S).", "Mở Settings: ")
    add_bullet("Điều hướng tới: Build, Execution, Deployment > Build Tools > Maven > Importing -> Tại mục JDK for importer, chọn JDK 17.", "Cấu hình Import: ")
    add_bullet("Tiếp tục chọn mục: Maven > Runner -> Tại mục JRE, chọn JDK 17 (hoặc Use Project SDK 17).", "Cấu hình Runner: ")
    add_bullet("Bấm Apply và OK.", "Lưu: ")

    add_img_placeholder(
        6, "Cấu hình Maven Runner và Importer dùng JDK 17",
        "Chụp ảnh mục Settings > Build Tools > Maven > Runner hiển thị JRE là Project SDK 17.",
        "Cửa sổ Settings của IntelliJ IDEA tại phần Maven Runner."
    )

    add_h3("Bước 4: Đồng bộ dependencies của Maven (Reload Maven Project)")
    add_bullet("Mở thanh công cụ Maven ở mép phải màn hình IntelliJ IDEA (biểu tượng chữ M).", "Mở tab Maven: ")
    add_bullet("Nhấn nút Reload All Maven Projects (Biểu tượng hai mũi tên xoay tròn góc trên bên trái của tab Maven).", "Thao tác: ")
    add_bullet("Chờ thanh tiến trình ở góc dưới bên phải tải hết các thư viện JAR từ pom.xml.", "Chờ tải: ")

    add_img_placeholder(
        7, "Reload All Maven Projects trong IntelliJ IDEA",
        "Chụp cửa sổ tab Maven bên phải với con trỏ chuột đang chỉ vào nút Reload All Maven Projects.",
        "Tab Maven với nút Reload All Maven Projects và danh sách dependencies đã nhận đủ."
    )

    add_h3("Bước 5: Kiểm tra cấu hình kết nối Database (application.properties)")
    add_p("Mở file theo đường dẫn: src/main/resources/application.properties. Xác nhận các thông số:")
    add_bullet("server.port=8081 (Cổng chạy Backend)", "Cổng máy chủ: ")
    add_bullet("datasource.primary.jdbc-url=jdbc:sqlserver://113.160.226.58:1444;databaseName=MainSoft_DRC_Barcode...", "CSDL Sản xuất: ")
    add_bullet("datasource.chart.jdbc-url=jdbc:sqlserver://113.160.226.58:1444;databaseName=MainSoft_DRC_Chart...", "CSDL Biểu đồ: ")

    add_callout(
        "LƯU Ý VỀ KẾT NỐI MẠNG ĐẾN CSDL SQL SERVER:\n"
        "Địa chỉ máy chủ SQL Server là IP: 113.160.226.58 cổng 1444.\n"
        "Máy tính của bạn bắt buộc phải có kết nối Internet hoặc được thông mạng LAN/VPN đến địa chỉ trên thì Backend mới khởi động thành công!",
        "ĐIỀU KIỆN TIÊN QUYẾT DATABASE", "warning"
    )

    add_h3("Bước 6: Khởi chạy ứng dụng (Run Spring Boot Application)")
    add_bullet("Điều hướng cây thư mục bên trái tới file: src/main/java/com/shtech/vn/Shtech25022026Application.java", "Tìm file chính: ")
    add_bullet("Click chuột phải vào file Shtech25022026Application.java -> Chọn Run 'Shtech25022026Application' (hoặc bấm tổ hợp phím Ctrl + Shift + F10).", "Thực hiện chạy: ")
    add_bullet("Ngoài ra, có thể click vào nút hình tam giác màu xanh lá cây nằm ngay cạnh tên hàm public static void main().", "Cách khác: ")

    add_img_placeholder(
        8, "Chạy class chính Shtech25022026Application",
        "Chụp màn hình editor mở file Shtech25022026Application.java với menu chuột phải chọn Run 'Shtech25022026Application'.",
        "Giao diện code Java với nút Play xanh lá cây bên cạnh class SpringBootApplication."
    )

    add_h3("Bước 7: Đọc log Console kiểm tra trạng thái khởi động thành công")
    add_p("Quan sát cửa sổ Run ở phía dưới màn hình, các dòng log sau chứng minh Backend đã hoạt động:")
    add_code("""  .   ____          _            __ _ _
 /\\\\ / ___'_ __ _ _(_)_ __  __ _ \\ \\ \\ \\
( ( )\\___ | '_ | '_| | '_ \\/ _` | \\ \\ \\ \\
 \\\\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v4.0.3)

... INFO [main] com.shtech.vn.Shtech25022026Application  : Starting Shtech25022026Application...
... INFO [main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 8081 (http) with context path '/'
... INFO [main] com.shtech.vn.Shtech25022026Application  : Started Shtech25022026Application in 4.512 seconds (process running for 5.105)""", "Dấu hiệu Backend khởi động thành công trên Console")

    add_img_placeholder(
        9, "Console log thông báo Tomcat started on port 8081",
        "Chụp khung Run Console của IntelliJ IDEA hiển thị dòng 'Tomcat started on port 8081' và 'Started Shtech25022026Application'.",
        "Tab Run Console với biểu tượng Spring Boot và dòng thông báo port 8081."
    )

    add_h2("2.2. Hướng dẫn chạy Backend trên Visual Studio Code (VS Code)")
    add_p("Nếu lập trình viên thích sử dụng môi trường nhẹ VS Code cho Backend, hãy thực hiện theo các bước sau:")

    add_h3("Bước 1: Cài đặt các Extension Java cần thiết")
    add_bullet("Extension Pack for Java (của Microsoft - ID: vscjava.vscode-java-pack).", "Gói 1: ")
    add_bullet("Spring Boot Extension Pack (của VMware - ID: vmware.vscode-boot-dev-pack).", "Gói 2: ")

    add_h3("Bước 2: Cấu hình trỏ JDK 17 trong VS Code Settings")
    add_bullet("Nhấn Ctrl + Shift + P -> Gõ 'Preferences: Open User Settings (JSON)'.", "Mở Settings: ")
    add_bullet("Thêm hoặc sửa cấu hình Java Runtime trỏ tới JDK 17:", "Thêm cấu hình: ")

    add_code("""// Thêm vào file settings.json của VS Code:
"java.configuration.runtimes": [
    {
        "name": "JavaSE-17",
        "path": "C:\\\\Program Files\\\\Java\\\\jdk-17",
        "default": true
    }
],
"java.jdt.ls.java.home": "C:\\\\Program Files\\\\Java\\\\jdk-17" """, "Cấu hình JDK 17 trong VS Code settings.json")

    add_h3("Bước 3: Mở dự án và khởi chạy")
    add_bullet("Mở thư mục D:\\CTY\\shtech-backend-realtime trong VS Code.", "Mở thư mục: ")
    add_bullet("Cách 1 (Giao diện): Mở file Shtech25022026Application.java, click chữ 'Run' xuất hiện ngay trên đầu hàm main().", "Khởi chạy UI: ")
    add_bullet("Cách 2 (Terminal dòng lệnh): Mở Terminal trong VS Code (Ctrl + `) và gõ lệnh Maven Wrapper có sẵn:", "Khởi chạy CLI: ")

    add_code("""# Chạy Spring Boot thông qua Maven Wrapper (cmd trên Windows):
.\\mvnw.cmd spring-boot:run

# Hoặc nếu máy đã cài Maven vào biến môi trường:
mvn spring-boot:run""", "Lệnh khởi chạy Backend trên Terminal VS Code")

    add_img_placeholder(
        10, "Chạy Backend Spring Boot trên VS Code",
        "Chụp màn hình VS Code với file Shtech25022026Application.java có chữ Run hoặc Terminal đang chạy .\\mvnw.cmd spring-boot:run.",
        "Giao diện VS Code hiển thị log khởi chạy Spring Boot thành công."
    )

    # PHẦN 3
    add_h1("PHẦN 3: THIẾT LẬP VÀ CHẠY DỰ ÁN FRONTEND TRÊN VS CODE VÀ INTELLIJ")
    add_p("Dự án Frontend có tên thư mục: D:\\CTY\\cake-shop-frontend-chính-20251014T092929Z-1-001\\cake-shop-frontend-chính. Đây là ứng dụng Dashboard giám sát SCADA/MES DRC viết bằng React 18, Vite 7, TailwindCSS v4.")

    add_h2("3.1. Hướng dẫn chạy Frontend trên VS Code (Khuyến nghị số 1)")
    add_p("VS Code là công cụ tối ưu số 1 cho hệ sinh thái JavaScript, React và Vite.")

    add_h3("Bước 1: Mở thư mục dự án Frontend trong VS Code")
    add_bullet("Mở VS Code -> Chọn File > Open Folder... (hoặc Ctrl + K, Ctrl + O).", "Thao tác: ")
    add_bullet("Chọn thư mục: D:\\CTY\\cake-shop-frontend-chính-20251014T092929Z-1-001\\cake-shop-frontend-chính.", "Đường dẫn: ")

    add_h3("Bước 2: Các Extension VS Code khuyên dùng")
    add_bullet("Tailwind CSS IntelliSense: Hỗ trợ gợi ý class Tailwind.", "Extension 1: ")
    add_bullet("ESLint: Bắt lỗi cú pháp JavaScript/React.", "Extension 2: ")
    add_bullet("Prettier - Code formatter: Tự động căn chỉnh format code đẹp.", "Extension 3: ")

    add_h3("Bước 3: Cấu hình file môi trường (.env)")
    add_bullet("Kiểm tra trong thư mục gốc xem đã có file tên là .env chưa.", "Kiểm tra: ")
    add_bullet("Nếu chưa có, tạo file mới tên chính xác là .env (không có đuôi .txt).", "Tạo file: ")
    add_bullet("Mở file .env và điền địa chỉ API của Backend:", "Điền cấu hình: ")

    add_code("""# File: .env (chạy trên máy nội bộ)
VITE_API_URL=http://localhost:8081""", "Nội dung file .env kết nối Backend")

    add_callout(
        "- Nếu Backend chạy ngay trên cùng máy tính với Frontend: Giữ nguyên 'http://localhost:8081'.\n"
        "- Nếu Backend chạy trên máy chủ nội bộ hoặc máy ảo khác: Thay 'localhost' bằng địa chỉ IP của máy chủ đó (Ví dụ: http://192.168.1.50:8081).",
        "QUY TẮC ĐỊA CHỈ API", "info"
    )

    add_img_placeholder(
        11, "Cấu hình file .env trong Frontend",
        "Chụp màn hình VS Code mở file .env chứa dòng VITE_API_URL=http://localhost:8081.",
        "Editor VS Code hiển thị nội dung file .env ngắn gọn."
    )

    add_h3("Bước 4: Cài đặt thư viện dependencies (Tải node_modules)")
    add_bullet("Mở Terminal trong VS Code bằng cách bấm tổ hợp phím: Ctrl + ` (hoặc vào menu Terminal > New Terminal).", "Mở Terminal: ")
    add_bullet("Chạy lệnh cài đặt với cờ --legacy-peer-deps (BẮT BUỘC):", "Chạy lệnh: ")

    add_code("""# Cài đặt thư viện:
npm install --legacy-peer-deps""", "Lệnh cài đặt thư viện Frontend")

    add_callout(
        "TẠI SAO PHẢI DÙNG CỜ '--legacy-peer-deps'?\n"
        "Dự án sử dụng các gói UI như react-select, react-quill, react-router v7 có sự chênh lệch nhỏ về version phụ thuộc. "
        "Nếu chỉ gõ 'npm install' thông thường, npm v10/v11 sẽ chặn lại và báo lỗi 'ERESOLVE unable to resolve dependency tree'. "
        "Thêm cờ '--legacy-peer-deps' sẽ giúp npm bỏ qua kiểm tra xung đột nghiêm ngặt và cài đặt hoàn tất 100%!",
        "GIẢI THÍCH KỸ THUẬT QUAN TRỌNG", "warning"
    )

    add_img_placeholder(
        12, "Quá trình chạy lệnh npm install --legacy-peer-deps",
        "Chụp màn hình Terminal sau khi chạy lệnh npm install --legacy-peer-deps và hoàn thành (hiển thị added ... packages).",
        "Terminal hiển thị kết quả cài đặt thành công thư mục node_modules."
    )

    add_h3("Bước 5: Khởi chạy ứng dụng chế độ phát triển (Development)")
    add_bullet("Tại cửa sổ Terminal, chạy lệnh:", "Lệnh chạy: ")

    add_code("""# Khởi chạy Vite Dev Server:
npm run dev

# Mở rộng: Cho phép các thiết bị khác trong cùng mạng LAN truy cập xem giao diện:
npm run dev -- --host""", "Lệnh khởi động Vite Frontend")

    add_bullet("Terminal sẽ hiển thị thông báo Vite khởi động thành công chỉ trong vài mili-giây:", "Thông báo: ")

    add_code("""  VITE v7.1.2  ready in 438 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help""", "Log khởi chạy thành công của Vite")

    add_h3("Bước 6: Truy cập ứng dụng trên trình duyệt")
    add_bullet("Mở trình duyệt Web (Google Chrome, Microsoft Edge, Brave, v.v.).", "Mở trình duyệt: ")
    add_bullet("Truy cập vào địa chỉ: http://localhost:5173", "Đường dẫn: ")
    add_bullet("Giao diện Dashboard Kế hoạch và Giám sát SCADA MES sẽ hiển thị đầy đủ các biểu đồ cột, tròn và bảng số liệu.", "Kiểm tra: ")

    add_img_placeholder(
        13, "Giao diện Dashboard chạy trên trình duyệt tại cổng 5173",
        "Chụp ảnh toàn màn hình trình duyệt hiển thị Dashboard giám sát kế hoạch MES DRC với địa chỉ http://localhost:5173/ trên thanh URL.",
        "Màn hình Dashboard hoàn chỉnh với các biểu đồ hiển thị dữ liệu thực tế."
    )

    add_h2("3.2. Hướng dẫn chạy Frontend trên IntelliJ IDEA")
    add_p("Nếu bạn muốn quản lý cả Backend và Frontend chung một phần mềm IntelliJ IDEA:")
    add_bullet("Vào File > Open... -> Chọn thư mục Frontend cake-shop-frontend-chính.", "Mở thư mục: ")
    add_bullet("Vào File > Settings... > Languages & Frameworks > Node.js -> Đảm bảo mục 'Node interpreter' trỏ đúng file node.exe (ví dụ C:\\Program Files\\nodejs\\node.exe).", "Kiểm tra Node: ")
    add_bullet("Mở file package.json -> Nhấp chuột vào biểu tượng Play (tam giác xanh) cạnh script 'dev' -> Chọn Run 'dev'.", "Chạy qua UI: ")
    add_bullet("Hoặc mở tab Terminal ở dưới đáy của IntelliJ IDEA và gõ: npm run dev.", "Chạy qua Terminal: ")

    add_img_placeholder(
        14, "Chạy Frontend trong IntelliJ IDEA",
        "Chụp giao diện IntelliJ IDEA mở file package.json với nút Play cạnh dòng \"dev\": \"vite\".",
        "Cửa sổ IntelliJ IDEA với tab Run 'npm dev' đang hiển thị link http://localhost:5173."
    )

    # PHẦN 4
    add_h1("PHẦN 4: BẢNG TỔNG HỢP CÁC LỆNH KIỂM TRA & XỬ LÝ LỖI (TROUBLESHOOTING)")
    add_p("Dưới đây là cẩm nang các câu lệnh Console quan trọng để kiểm tra, test lỗi và xử lý nhanh khi hệ thống gặp sự cố trong quá trình phát triển.")

    add_h2("4.1. Bảng lệnh Console kiểm tra môi trường & kiểm tra cổng (Ports)")

    tbl_cmd = doc.add_table(rows=7, cols=3)
    tbl_cmd.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_cmd.autofit = False

    cmd_data = [
        ("Mục đích kiểm tra", "Câu lệnh PowerShell / CMD", "Kết quả mong đợi"),
        ("Kiểm tra Java Runtime", "java -version", "Hiển thị version java (khuyến nghị JDK 17)"),
        ("Kiểm tra Node.js", "node -v", "Hiển thị v20.x hoặc v22.x"),
        ("Kiểm tra Cổng Backend (8081)", "netstat -ano | findstr :8081", "Nếu đang chạy sẽ có LISTENING kèm PID"),
        ("Kiểm tra Cổng Frontend (5173)", "netstat -ano | findstr :5173", "Nếu đang chạy sẽ có LISTENING kèm PID"),
        ("Test kết nối HTTP Backend", "curl -I http://localhost:8081", "Trả về HTTP/1.1 200 OK hoặc 404/401"),
        ("Tắt tiến trình chiếm cổng", "taskkill /PID <MÃ_PID> /F", "SUCCESS: The process has been terminated")
    ]

    for r_idx, (col0, col1, col2) in enumerate(cmd_data):
        row = tbl_cmd.rows[r_idx]
        c0, c1, c2 = row.cells[0], row.cells[1], row.cells[2]
        c0.width = Inches(2.0)
        c1.width = Inches(2.8)
        c2.width = Inches(2.0)

        is_header = (r_idx == 0)
        bg = "1E3A8A" if is_header else ("F8FAFC" if r_idx % 2 == 1 else "FFFFFF")
        set_cell_background(c0, bg)
        set_cell_background(c1, bg)
        set_cell_background(c2, bg)

        set_cell_margins(c0, top=100, bottom=100, left=120, right=120)
        set_cell_margins(c1, top=100, bottom=100, left=120, right=120)
        set_cell_margins(c2, top=100, bottom=100, left=120, right=120)

        border = {'val': 'single', 'sz': '4', 'color': 'CBD5E1'}
        set_cell_borders(c0, top=border, bottom=border, left=border, right=border)
        set_cell_borders(c1, top=border, bottom=border, left=border, right=border)
        set_cell_borders(c2, top=border, bottom=border, left=border, right=border)

        for cell_obj, text_content in [(c0, col0), (c1, col1), (c2, col2)]:
            p = cell_obj.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(text_content)
            if is_header:
                run.font.bold = True
                run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                run.font.size = Pt(9.5)
            else:
                run.font.size = Pt(9)
                run.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
                if cell_obj == c1:
                    run.font.name = 'Consolas'
                    run.font.bold = True

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    add_h2("4.2. Xử lý các sự cố thường gặp (Troubleshooting Guide)")

    add_h3("Sự cố 1: Lỗi 'Port 8081 is already in use' hoặc 'Port 5173 is already in use'")
    add_p("Hiện tượng: Khi bấm chạy Backend hoặc Frontend, Terminal báo cổng đã bị chiếm dụng bởi một tiến trình khác.")
    add_p("Cách khắc phục triệt để bằng lệnh Console:")
    add_code("""# Bước 1: Tìm mã tiến trình (PID) đang chiếm cổng 8081
netstat -ano | findstr :8081
# Ví dụ kết quả in ra:
# TCP    0.0.0.0:8081    0.0.0.0:0    LISTENING    15428
# (Ở đây PID là 15428)

# Bước 2: Tắt cưỡng bức tiến trình đó (thay 15428 bằng PID thực tế của bạn):
taskkill /PID 15428 /F

# Bước 3: Khởi động lại dự án bình thường.""", "Khắc phục lỗi trùng cổng (Port In Use)")

    add_h3("Sự cố 2: Lỗi 'Unsupported class file major version 65 / 66' hoặc 'Java 8 not supported'")
    add_p("Hiện tượng: Khi build Backend trong IntelliJ, báo lỗi compiler version không tương thích.")
    add_p("Nguyên nhân: IntelliJ đang trỏ nhầm vào JDK 22/23 (major version 66) hoặc JDK 8 (major version 52) trong khi pom.xml yêu cầu JDK 17 (major version 61).")
    add_p("Cách khắc phục: Vào File > Project Structure > Project -> Chỉnh cả SDK và Language Level về JDK 17. Sau đó vào Settings > Build Tools > Maven > Runner -> Đổi JRE về JDK 17.")

    add_h3("Sự cố 3: Lỗi 'Connection refused: connect' hoặc không kết nối được Database SQL Server")
    add_p("Hiện tượng: Khi chạy Backend, console báo lỗi com.microsoft.sqlserver.jdbc.SQLServerException: The TCP/IP connection to the host 113.160.226.58, port 1444 has failed.")
    add_p("Cách kiểm tra bằng PowerShell:")
    add_code("""# Test cổng mạng của máy chủ Database SQL Server:
Test-NetConnection -ComputerName 113.160.226.58 -Port 1444

# Nếu 'TcpTestSucceeded : True' -> Đường truyền bình thường, kiểm tra lại user/password trong application.properties.
# Nếu 'TcpTestSucceeded : False' -> Kiểm tra mạng Internet, Wifi công ty hoặc bật phần mềm VPN.""", "Lệnh kiểm tra kết nối CSDL")

    add_h3("Sự cố 4: Biểu đồ Frontend báo lỗi Network Error hoặc CORS khi gọi API")
    add_p("Hiện tượng: Frontend mở được giao diện nhưng các biểu đồ báo lỗi không tải được dữ liệu.")
    add_p("Các bước kiểm tra xử lý:")
    add_bullet("Bước 1: Xác nhận Backend đã chạy chưa bằng cách mở tab mới trên trình duyệt vào http://localhost:8081.", "Kiểm tra 1: ")
    add_bullet("Bước 2: Mở file .env trong Frontend kiểm tra đúng dòng VITE_API_URL=http://localhost:8081 (không được có dấu gạch chéo '/' ở cuối).", "Kiểm tra 2: ")
    add_bullet("Bước 3: Mở Developer Tools trên trình duyệt (F12) -> Thẻ Console & Network để xem mã lỗi chi tiết (404, 500 hay Failed to fetch).", "Kiểm tra 3: ")

    add_h3("Sự cố 5: Xóa trắng và cài đặt lại (Clean Install) khi thư viện bị lỗi")
    add_p("Nếu thư mục thư viện bị lỗi hỏng do mất mạng giữa chừng, bạn có thể thực hiện xóa sạch và cài đặt lại từ đầu theo các lệnh an toàn sau:")

    add_code("""# === DỌN DẸP VÀ CÀI LẠI FRONTEND (Chạy trong thư mục Frontend) ===
# 1. Xóa thư mục node_modules và lock file
Remove-Item -Recurse -Force node_modules, package-lock.json

# 2. Cài lại thư viện sạch sẽ
npm install --legacy-peer-deps

# 3. Khởi động lại
npm run dev


# === DỌN DẸP VÀ BIÊN DỊCH LẠI BACKEND (Chạy trong thư mục Backend) ===
# 1. Dọn dẹp thư mục build target
.\\mvnw.cmd clean compile

# 2. Khởi động lại Spring Boot
.\\mvnw.cmd spring-boot:run""", "Lệnh dọn dẹp và Clean Install toàn bộ")

    add_img_placeholder(
        15, "Giao diện F12 Developer Tools kiểm tra Network API",
        "Mở trình duyệt tại http://localhost:5173, bấm phím F12, chọn thẻ Network và tải lại trang để chụp danh sách API Backend trả về mã 200 OK.",
        "Tab Network của trình duyệt hiển thị các request API thành công."
    )

    # Lời kết
    add_h1("LỜI KẾT")
    add_p("Chúc mừng bạn đã hoàn thành việc thiết lập và vận hành hệ thống MES DRC (Backend Spring Boot & Frontend React Vite). "
          "Tài liệu này đã được bố trí sẵn các khung viền nét đứt kèm hướng dẫn chụp ảnh minh họa chi tiết. "
          "Bạn chỉ việc chụp ảnh màn hình các bước tương ứng trên máy tính của mình và dán trực tiếp vào các khung chữ nhật có sẵn để hoàn thiện cuốn cẩm nang nội bộ hoàn chỉnh nhất!")

    # Lưu tài liệu
    doc.save(output_filename)
    print(f"Document successfully created at: {output_filename}")

if __name__ == "__main__":
    out_path = r"d:\CTY\cake-shop-frontend-chính-20251014T092929Z-1-001\cake-shop-frontend-chính\HUONG_DAN_CHAY_DU_AN_BACKEND_FRONTEND.docx"
    create_guide_docx(out_path)
