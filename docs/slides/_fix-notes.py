import zipfile, re, shutil, sys
from xml.etree import ElementTree as ET

src = sys.argv[1]
tmp = src + '.tmp'
# pptxgenjs 会把文字整段塞进一个 <a:t>，我们在这里切成多个 <a:p>，
# 这是 PowerPoint 唯一认得的换行方式——控制字元 0x0B 是非法 XML，会触发「需要修复」。
BREAK = '</a:t></a:r></a:p><a:p><a:r><a:rPr lang="zh-CN" altLang="en-US" dirty="0"/><a:t>'

zin = zipfile.ZipFile(src)
zout = zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED)
fixed = 0
for item in zin.infolist():
    data = zin.read(item.filename)
    if 'notesSlides/notesSlide' in item.filename and item.filename.endswith('.xml'):
        x = data.decode('utf-8')
        if '§§' in x:
            x = x.replace('§§', BREAK)
            fixed += 1
        data = x.encode('utf-8')
    zout.writestr(item, data)
zout.close(); zin.close()
shutil.move(tmp, src)

# 校验：每一份 XML 都要能被解析，且不含非法控制字元
z = zipfile.ZipFile(src)
bad = []
CTRL = re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f]')
for n in z.namelist():
    if not n.endswith('.xml') and not n.endswith('.rels'): continue
    b = z.read(n)
    if CTRL.search(b.decode('utf-8', 'replace')): bad.append((n, 'control char'))
    try: ET.fromstring(b)
    except Exception as e: bad.append((n, str(e)[:60]))
print(f'修好 {fixed} 份备注；XML 校验', '全部通过' if not bad else bad[:5])
