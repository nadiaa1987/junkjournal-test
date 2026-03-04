const fs = require('fs');
const file = '/Users/mac/.gemini/antigravity/scratch/junk-journal-ai/src/app/page.tsx';
let data = fs.readFileSync(file, 'utf8');

// 1. Add info to interface
data = data.replace('accentColor: string;\n  promptTemplate', 'accentColor: string;\n  info: string;\n  promptTemplate');

// 2. Add info to each style
const infos = {
  'watercolor-garden': 'Generates soft, shabby chic watercolor illustrations. Best for nature scenes, whimsical buildings, and vintage garden elements.',
  'boho-spring-blue': 'Creates serene Mediterranean and coastal vibes with blue-plaster walls, terracotta, and sunflowers.',
  'vintage-cookbook': 'Creates detailed farmhouse kitchen aesthetic images layered over handwritten cursive recipes.',
  'whimsical-houses': 'Magical and vibrant fairy-tale house concepts lit by lanterns and stars.',
  'shabby-chic-rose': 'Feminine, delicate vintage collage with blush pink roses, lace, and letters.',
  'majestic-wild': 'Sweeping, dramatic landscape and animal scenes inspired by romantic realism.',
  'garden-cottage': 'Cozy, handmade cottagecore aesthetics featuring rustic pastels and garden props.',
  'classic-neutral': 'Timeless elegance using script, mono sketches, stamps, and neutral palettes.',
  'valentines-day': 'Delicate flat seamless patterns with scattered romantic hearts and roses.',
  'gardening-cottage': 'Highly detailed watercolor scenes of vintage gardening activities and props.'
};

let lines = data.split('\n');
let insideStyles = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const JOURNAL_STYLES: JournalStyle[] = [')) {
    insideStyles = true;
  }
  if (insideStyles && lines[i].includes('id: "')) {
    let id = lines[i].match(/id: "(.*?)"/)[1];
    if (infos[id]) {
        // find promptTemplate on following lines and insert info before it
        let j = i;
        while (!lines[j].includes('promptTemplate:')) { j++; }
        lines.splice(j, 0, `    info: "${infos[id]}",`);
    }
  }
  if (insideStyles && lines[i].trim() === '];') {
    insideStyles = false;
  }
}
data = lines.join('\n');

fs.writeFileSync(file, data);
