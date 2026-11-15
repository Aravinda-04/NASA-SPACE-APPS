from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json
import shutil
import subprocess
import zipfile
import numpy as np

root = Path(__file__).resolve().parents[1] / 'output/stage4-spike/evidence'
font = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 26)
items = [('turn-000.jpg', '0% — corner already peeled'), ('turn-025.jpg', '25%'),
         ('turn-050.jpg', '50%'), ('turn-075.jpg', '75%'),
         ('turn-100.jpg', '100% — clipped Pioneer content'),
         ('baseline-event.jpg', 'Approved Stage 3 Pioneer layout')]
sheet = Image.new('RGB', (2304, 944), '#14212a')
draw = ImageDraw.Draw(sheet)
for index, (name, label) in enumerate(items):
    x, y = (index % 3) * 768, (index // 3) * 472
    draw.text((x + 14, y + 5), label, font=font, fill='#f4ecd9')
    sheet.paste(Image.open(root / name).convert('RGB').resize((768, 432), Image.Resampling.LANCZOS), (x, y + 40))
sheet.save(root / 'turn-contact-sheet.jpg', quality=94)

ffmpeg = shutil.which('ffmpeg') or 'C:/Program Files/ShareX/ffmpeg.exe'
clips = []
for prefix, title in [('snap', 'Short corner drag — snap-back'), ('drag', 'Corner drag — completed turn'), ('click', 'Edge click — backward turn')]:
    frames = json.loads((root / f'{prefix}-recording.json').read_text())
    manifest = ['ffconcat version 1.0']
    for index, frame in enumerate(frames):
        image = Image.new('RGB', (1536, 906), '#14212a')
        ImageDraw.Draw(image).text((18, 5), title + ' | captured frames, original timing', font=font, fill='#f4ecd9')
        image.paste(Image.open(root / frame['name']).convert('RGB'), (0, 42))
        filename = f'review-{prefix}-{index:04d}.jpg'
        image.save(root / filename, quality=94)
        duration = (frames[index + 1]['time'] - frame['time']) / 1000 if index + 1 < len(frames) else .8
        manifest.extend([f"file '{filename}'", f'duration {max(.02, duration):.6f}'])
    manifest.append(f"file 'review-{prefix}-{len(frames)-1:04d}.jpg'")
    manifest_path = root / f'{prefix}.ffconcat'
    manifest_path.write_text('\n'.join(manifest) + '\n')
    output = root / f'{prefix}.mp4'
    subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(manifest_path), '-fps_mode', 'vfr', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'fast', '-crf', '19', str(output)], check=True)
    clips.append(output)
(root / 'clips.ffconcat').write_text('ffconcat version 1.0\n' + ''.join(f"file '{clip.name}'\n" for clip in clips))
subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(root / 'clips.ffconcat'), '-c', 'copy', '-movflags', '+faststart', str(root / 'gestures.mp4')], check=True)

crop = (146, 138, 1390, 800)
comparisons = []
for actual, baseline, label in [('turn-000.jpg', 'baseline-map.jpg', 'first engine frame vs static atlas'), ('turn-100.jpg', 'baseline-event.jpg', 'landed Pioneer vs Stage 3')]:
    a = np.asarray(Image.open(root / actual).convert('RGB').crop(crop), dtype=np.int16)
    b = np.asarray(Image.open(root / baseline).convert('RGB').crop(crop), dtype=np.int16)
    maximum = np.abs(a - b).max(axis=2)
    comparisons.append({'comparison': label, 'crop': crop, 'format': 'decoded JPEG', 'changed_pixels_percent': float((maximum > 0).mean() * 100), 'pixels_over_16_of_255_percent': float((maximum > 16).mean() * 100)})
(root / 'pixel-comparison.json').write_text(json.dumps(comparisons, indent=2))

selected = [root / name for name, _ in items] + [root / 'baseline-map.jpg', root / 'turn-contact-sheet.jpg', root / 'gestures.mp4'] + list(root.glob('*.json'))
with zipfile.ZipFile(root.parent / 'stage-a-evidence.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for item in sorted(set(selected)):
        archive.write(item, item.name)
print(json.dumps({'comparisons': comparisons, 'video_bytes': (root / 'gestures.mp4').stat().st_size, 'evidence_zip': str(root.parent / 'stage-a-evidence.zip')}, indent=2))
