
#!/usr/bin/env python3

import re

import csv

import sys



def apply_naux_dialect(text):

    if not text or not isinstance(text, str):

        return text

    

    # 1. bọc (protect) các biến nội suy UI (vd: {amount}, %s, <br/>)

    placeholders = re.findall(r'(\{\{?[^\}]+\}?\}|\<[^\>]+\>|\%[a-z])', text)

    protected_text = text

    for i, ph in enumerate(placeholders):

        protected_text = protected_text.replace(ph, f'__BBOI_{i}__')

        

    res = protected_text



    # 2. map từ vựng rễ (exact match)

    root_words = {

        r'\bngười ta\b': 'nẫu', r'\bNgười ta\b': 'Nẫu',

        r'\bngoại\b': 'quại', r'\bNgoại\b': 'Quại',

        r'\bngoài\b': 'quài', r'\bNgoài\b': 'Quài',

        r'\bkhông\b': 'hông', r'\bKhông\b': 'Hông',

        r'\bthôi rồi\b': 'thâu rầu', r'\bThôi rồi\b': 'Thâu rầu',

        r'\bbàn chải\b': 'cái bót', r'\bBàn chải\b': 'Cái bót',

        r'\bchả giò\b': 'chả ram', r'\bChả giò\b': 'Chả ram',

        r'\bnấu canh\b': 'kho lạt', r'\bNấu canh\b': 'Kho lạt',

        r'\băn chay\b': 'ăn lạt', r'\bĂn chay\b': 'Ăn lạt',

        r'\bđường nhựa\b': 'đường dầu', r'\bĐường nhựa\b': 'Đường dầu',

        r'\bngười dùng\b': 'ngừ dùng', r'\bNgười dùng\b': 'Ngừ dùng',

        r'\bngười\b': 'ngừ', r'\bNgười\b': 'Ngừ',

        r'\bvậy hả\b': 'dẫy na', r'\bVậy hả\b': 'Dẫy na',

        r'\bvậy nhé\b': 'dẫy nghen', r'\bVậy nhé\b': 'Dẫy nghen',

        r'\bvậy đó\b': 'dẫy á', r'\bVậy đó\b': 'Dẫy á',

        r'\bchụp ảnh\b': 'chớp ảnh', r'\bChụp ảnh\b': 'Chớp ảnh',

        r'\bvề\b': 'dìa', r'\bVề\b': 'Dìa',

        r'\bnhưng mà\b': 'ẻ mà', r'\bNhưng mà\b': 'Ẻ mà',

        r'\btôi\b': 'tui', r'\bTôi\b': 'Tui',

        r'\bvới\b': 'giới', r'\bVới\b': 'Giới',

        r'\btất cả\b': 'cái', r'\bTất cả\b': 'Cái',

        r'\bđành hanh\b': 'cành nanh', r'\bĐành hanh\b': 'Cành nanh',

        r'\bcố\b': 'ráng', r'\bCố\b': 'Ráng',

        r'\bnhanh\b': 'mau', r'\bNhanh\b': 'Mau',

    }

    

    for pattern, repl in root_words.items():

        res = re.sub(pattern, repl, res)



    # 3. quy tắc biến âm

    phonetics = [

        (r'ôi\b', 'âu'), (r'ồi\b', 'ầu'), (r'ổi\b', 'ẩu'), (r'ỗi\b', 'ẫu'), (r'ội\b', 'ậu'),

        (r'Ôi\b', 'Âu'), (r'Ồi\b', 'Ầu'), (r'Ổi\b', 'Ẩu'), (r'Ỗi\b', 'Ẫu'), (r'Ội\b', 'Ậu'),

        

        (r'\bkhoa\b', 'pha'), (r'\bkhoá\b', 'phá'), (r'\bkhoà\b', 'phà'), (r'\bkhoả\b', 'phả'), (r'\bkhoã\b', 'phã'), (r'\bkhoạ\b', 'phạ'),

        (r'\bkhoe\b', 'phe'), (r'\bkhoé\b', 'phé'), (r'\bkhoè\b', 'phè'), (r'\bkhoẻ\b', 'phẻ'), (r'\bkhoẽ\b', 'phẽ'), (r'\bkhoẹ\b', 'phẹ'),

        (r'\bkhỏe\b', 'phẻ'), (r'\bKhỏe\b', 'Phẻ'),

        

        (r'om\b', 'ôm'), (r'óm\b', 'ốm'), (r'òm\b', 'ồm'), (r'ỏm\b', 'ổm'), (r'õm\b', 'ỗm'), (r'ọm\b', 'ộm'),

        (r'ơm\b', 'ôm'), (r'ớm\b', 'ốm'), (r'ờm\b', 'ồm'), (r'ởm\b', 'ổm'), (r'ỡm\b', 'ỗm'), (r'ợm\b', 'ộm'),

        

        (r'ươi\b', 'ư'), (r'ười\b', 'ừ'), (r'ưới\b', 'ứ'), (r'ưởi\b', 'ử'), (r'ưỡi\b', 'ữ'), (r'ượi\b', 'ự'),

        (r'Ươi\b', 'Ư'), (r'Ười\b', 'Ừ'), (r'Ưới\b', 'Ứ'), (r'Ưởi\b', 'Ử'), (r'Ưỡi\b', 'Ữ'), (r'Ượi\b', 'Ự'),

        

        (r'ếp\b', 'íp'), (r'ệp\b', 'ịp'), (r'Ếp\b', 'Íp'), (r'Ệp\b', 'Ịp'),

        

        (r'\bơi\b', 'quơi'), (r'\bƠi\b', 'Quơi'),

        (r'\băn\b', 'en'), (r'\bĂn\b', 'En'),

        (r'ảy\b', 'ẻ'), (r'ãy\b', 'ẽ')

    ]

    

    for pattern, repl in phonetics:

        res = re.sub(pattern, repl, res)

        

    # 4. nhả lại các placeholder an toàn

    for i, ph in enumerate(placeholders):

        res = res.replace(f'__BBOI_{i}__', ph)

        

    return res



def compile_csv(input_path, output_path):

    print(f"[bối bối] đang rèn {input_path} thành giọng Bình Định...")

    try:

        with open(input_path, 'r', encoding='utf-8') as fin, \

             open(output_path, 'w', encoding='utf-8', newline='') as fout:

            

            reader = csv.reader(fin)

            writer = csv.writer(fout)

            

            count = 0

            for row in reader:

                # file 17k của anh có định dạng: key, vi, vi_binhdinh1, vi_binhdinh2

                # ta lấy cột tiếng việt (index 1) để làm gốc dịch

                if len(row) >= 3:

                    vi_text = row[1].strip()

                    naux_text = apply_naux_dialect(vi_text)

                    # Ghi đè vào cột 2, 3

                    row[2] = naux_text

                    if len(row) >= 4:

                        row[3] = naux_text

                    else:

                        row.append(naux_text)

                elif len(row) == 2: 

                    vi_text = row[1].strip()

                    naux_text = apply_naux_dialect(vi_text)

                    row.append(naux_text)

                    row.append(naux_text)

                    

                writer.writerow(row)

                count += 1

                

        print(f"[bối bối] đập búa xong! {count} dòng đã được chuyển ngữ an toàn.")

        print(f"[bối bối] file xuất kho: {output_path}")

    except Exception as e:

        print(f"[bối bối lỗi] {e}")



if __name__ == "__main__":

    if len(sys.argv) < 3:

        print("Sử dụng: python3 nauion_naux_compiler.py <input.csv> <output.csv>")

        sys.exit(1)

    compile_csv(sys.argv[1], sys.argv[2])

