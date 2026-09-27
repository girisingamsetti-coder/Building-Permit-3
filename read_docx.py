import docx
import io
with io.open('docx_out.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join([p.text for p in docx.Document('public/LTP.docx').paragraphs]))
