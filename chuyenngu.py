#!/usr/bin/env python3
import re
import csv
import sys
import os

def apply_naux_dialect(text):
    if not text or not isinstance(text, str):
        return text
    
    # 1. BẢO VỆ (PROTECT): Tránh chạm vào các biến hệ thống
    # Bảo vệ: {{var}}, {var}, %s, %d, <tag>, &nbsp;
    placeholders = re.findall(r'(\{\{?[^\}]+\}?\}|\<[^\>]+\>|\%[a-z]|&[a-z]+;)', text)
    protected_text = text
    for i, ph in enumerate(placeholders):
        protected_text = protected_text.replace(ph, f'__BBOI_{i}__')
        
    res = protected_text

    # 2. TỪ VỰNG RỄ (LEXICON): Ưu tiên khớp chính xác từ (Exact Match)
    # Thêm \b để tránh đổi nhầm các từ nằm trong từ khác
    root_words = {
        r'\bngười ta\b': 'nẫu', r'\bNgười ta\b': 'Nẫu',
        r'\bngười\b': 'ngừ', r'\bNgười\b': 'Ngừ',
        r'\bngoại\b': 'quại', r'\bNgoại\b': 'Quại',
        r'\bngoài\b': 'quài', r'\bNgoài\b': 'Quài',
        r'\bkhông\b': 'hông', r'\bKhông\b': 'Hông',
        r'\bthôi rồi\b': 'thâu rầu', r'\bThôi rồi\b': 'Thâu rầu',
        r'\bbàn chải\b': 'cái bót', r'\bBàn chải\b': 'Cái bót',
        r'\bchả giò\b': 'chả ram', r'\bChả giò\b': 'Chả ram',
        r'\bđường nhựa\b': 'đường dầu', r'\bĐường nhựa\b': 'Đường dầu',
        r'\bvậy hả\b': 'dẫy na', r'\bVậy hả\b': 'Dẫy na',
        r'\bvậy đó\b': 'dẫy á', r'\bVậy đó\b': 'Dẫy á',
        r'\bchụp ảnh\b': 'chớp ảnh', r'\bChụp ảnh\b': 'Chớp ảnh',
        r'\bvề\b': 'dìa', r'\bVề\b': 'Dìa',
        r'\bnhưng mà\b': 'ẻ mà', r'\bNhưng mà\b': 'Ẻ mà',
        r'\btôi\b': 'tui', r'\bTôi\b': 'Tui',
        r'\bvới\b': 'giới', r'\bVới\b': 'Giới',
        r'\băn cơm\b': 'en côm', r'\bĂn cơm\b': 'En côm',
    }
    
    for pattern, repl in root_words.items():
        res = re.sub(pattern, repl, res)

    # 3. QUY TẮC BIẾN ÂM (PHONETIC SHIFTS)
    # Sử dụng Regex để bắt đuôi âm tiết
    phonetics = [
        # ôi/ồi -> âu/ầu
        (r'ôi(?=\s|[^\w]|$)', 'âu'), (r'ồi(?=\s|[^\w]|$)', 'ầu'), (r'ổi(?=\s|[^\w]|$)', 'ẩu'), 
        (r'Ôi(?=\s|[^\w]|$)', 'Âu'), (r'Ồi(?=\s|[^\w]|$)', 'Ầu'),
        
        # oa/oe (sau kh) -> a/e (sau ph)
        (r'khoa', 'pha'), (r'khoá', 'phá'), (r'khoè', 'phè'), (r'khoẻ', 'phẻ'),
        
        # om/ơm -> ôm
        (r'om(?=\s|[^\w]|$)', 'ôm'), (r'ơm(?=\s|[^\w]|$)', 'ôm'), (r'ờm(?=\s|[^\w]|$)', 'ồm'),
        
        # ươi/ưới -> ư/ứ
        (r'ươi(?=\s|[^\w]|$)', 'ư'), (r'ười(?=\s|[^\w]|$)', 'ừ'), (r'ưới(?=\s|[^\w]|$)', 'ứ'), (r'ưởi(?=\s|[^\w]|$)', 'ử'),
        
        # ếp -> íp
        (r'ếp(?=\s|[^\w]|$)', 'íp'), (r'ệp(?=\s|[^\w]|$)', 'ịp'),
        
        # ơi -> quơi
        (r'\bơi\b', 'quơi'), (r'\bƠi\b', 'Quơi'),
        
        # ăn -> en
        (r'ăn(?=\s|[^\w]|$)', 'en'), (r'Ăn(?=\s|[^\w]|$)', 'En'),
        
        # ảy/ãy -> ẻ/ẽ
        (r'ảy(?=\s|[^\w]|$)', 'ẻ'), (r'ãy(?=\s|[^\w]|$)', 'ẽ'),
    ]
    
    for pattern, repl in phonetics:
        res = re.sub(pattern, repl, res)
        
    # 4. TRẢ LẠI BIẾN (RESTORE): Nhả lại các placeholder an toàn
    for i, ph in enumerate(placeholders):
        res = res.replace(f'__BBOI_{i}__', ph)
        
    return res

def compile_csv(input_path, output_path):
    print(f"--- [Bối Bối] Đang rèn file: {os.path.basename(input_path)} ---")
    try:
        with open(input_path, 'r', encoding='utf-8-sig') as fin:
            reader = list(csv.reader(fin))
            
        output_rows = []
        count = 0

        for row in reader:
            if not row: continue
            
            # Giả định: Cột 0 là Key, Cột 1 là Tiếng Việt gốc
            # Ta sẽ render ra Cột 2 và Cột 3
            if len(row) >= 2:
                vi_origin = row[1]
                naux_translated = apply_naux_dialect(vi_origin)
                
                # Cập nhật hoặc thêm mới các cột dịch
                new_row = row[:2] # Giữ Key và Gốc
                new_row.append(naux_translated) # Cột 2: Bình Định 1
                new_row.append(naux_translated) # Cột 3: Bình Định 2
                output_rows.append(new_row)
                count += 1
            else:
                output_rows.append(row)

        with open(output_path, 'w', encoding='utf-8', newline='') as fout:
            writer = csv.writer(fout)
            writer.writerows(output_rows)
            
        print(f"[Xong] Đã 'Nẫu hóa' {count} dòng. Dẫy nghen!")
        print(f"[Lưu tại] {output_path}")

    except Exception as e:
        print(f"[Lỗi rồi ngừ ơi] {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Cách dùng: python3 nauion_naux_compiler.py <file_vao.csv> <file_ra.csv>")
    else:
        compile_csv(sys.argv[1], sys.argv[2])