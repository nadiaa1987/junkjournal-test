"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import JSZip from "jszip";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
// ─────────────────────────────────────────────
// STYLE PRESETS — Inspired by BowArts Etsy Shop
// ─────────────────────────────────────────────
interface JournalStyle {
  id: string;
  label: string;
  emoji: string;
  accentColor: string;
  info: string;
  promptTemplate: (topic: string, seed: number) => string;
  suggestions: string[];
}

const JOURNAL_STYLES: JournalStyle[] = [
  {
    id: "watercolor-garden",
    label: "Watercolor Garden",
    emoji: "🌸",
    accentColor: "#c6a4b0",
    info: "Generates soft, shabby chic watercolor illustrations. Best for nature scenes, whimsical buildings, and vintage garden elements.",
    promptTemplate: (topic, seed) =>
      `Create a detailed image description for a junk journal page in a "Watercolor Whimsical Garden" style.
      Theme: "${topic}".
      Style: Soft watercolor illustration, cottagecore aesthetic, delicate brushstrokes, shabby chic, whimsical, dreamy and nostalgic.
      Colors: Soft pastel palette (sage green, dusty rose, creamy beige, sky blue).
      Elements: watercolor flowers, rustic wooden textures, stone walls, whimsical garden scenes, birdbaths, clotheslines.
      Format: Full-page edge-to-edge illustration, A4 printable, high artistic quality. Under 65 words. Seed:${seed}`,
    suggestions: ["Cottage Garden", "Stone Bridge", "Vintage Mailbox", "Whimsical Archway", "Girl Reading Under Tree", "Bunny in Flower Field", "Fairy Sitting on Mushroom", "Ivy-Covered Well"],
  },

  {
    id: "boho-spring-blue",
    label: "Boho Spring Blue",
    emoji: "🫐💙",
    accentColor: "#5b8fbd",
    info: "Creates serene Mediterranean and coastal vibes with blue-plaster walls, terracotta, and sunflowers.",
    promptTemplate: (topic, seed) =>
      `Create a detailed image description for a junk journal page in a "Boho Spring Blue Vintage" style.
      Theme: "${topic}".
      Style: Soft romantic watercolor illustration with vintage grain texture. Mediterranean / Provençal / Greek boho aesthetic — serene, airy, nostalgic and timeless.
      Colors: Dominant palette of cornflower blue, dusty steel blue, teal, slate blue, aged blue-grey plaster — accented with warm cream, terracotta, soft sage green, sandy beige, and pops of orange blossom or sunflower yellow.
      Scenes & settings (choose fitting ones): weathered blue-plaster walls, stone arched doorways opening to valley views, cobblestone pathways by the sea, checkerboard or Moroccan tile floors, blue painted wooden doors with terracotta flower pots, coastal village rooftops, garden with stone fountain, wicker chair against blue wall, wooden swing in a leafy garden.
      Objects & botanicals: blue ceramic pitchers/jugs with white blossoms, mason jars with daisies, teal glass bottles with floral motifs, wooden rocking chair with straw hat, kitchen shelves with white ceramic jars, spice jars, watering can with garden tools, blue wine bottle with grapes, seashells on sandy beach, wooden kitchen utensils, terracotta pots with climbing vines.
      Nature: sunflowers, white jasmine or cherry blossoms, wildflowers, lush green trailing vines on stone arches, orange blossom branches on blue backgrounds.
      Format: Full-page serene watercolor illustration, A4 printable, high artistic quality. Under 80 words. Seed:${seed}`,
    suggestions: ["Blue Door Garden", "Coastal Village", "Mediterranean Kitchen", "Stone Arch & Roses", "Woman on Blue Balcony", "Cat on Terracotta Rooftop", "Fisherman at Sunrise Harbor", "Sunflower Market Stall"],
  },
  {
    id: "vintage-cookbook",
    label: "Vintage Cookbook",
    emoji: "📖🍰",
    accentColor: "#c4874a",
    info: "Creates detailed farmhouse kitchen aesthetic images layered over handwritten cursive recipes.",
    promptTemplate: (topic, seed) =>
      `Create a detailed image description for a junk journal page in a "Vintage Cookbook" style.
      Theme: "${topic}".
      Style: Warm romantic watercolor illustration layered over aged handwritten cursive recipe manuscript background. Nostalgic farmhouse kitchen aesthetic, antique cookbook feel, rich and detailed still-life composition.
      Colors: Warm sepia, aged cream, burnt sienna, soft golden brown, terracotta, warm ivory — tea-stained throughout.
      Food & ingredients (choose fitting ones): pancakes with berries, rustic bread loaves with butter, croissants, layered cakes with roses, fruit pies on lace doilies, roasted turkey/chicken with herbs, lemon tarts, fresh fruits, jam jars, chocolates, honey jars, vegetables in baskets.
      Kitchen objects: mason jars, cast iron skillet, ceramic pitchers, silver measuring spoons, mortar & pestle, spice tins, wine and dessert glasses, scales, kitchen whisks and utensils, candles, copper pots.
      Botanicals: sprigs of rosemary, lavender, thyme, wildflowers scattered around.
      Texture: dense handwritten cursive recipe text fills the background on aged parchment, with tea stains and worn edges.
      Format: Full-page richly layered illustration, A4 printable, high artistic quality. Under 75 words. Seed:${seed}`,
    suggestions: ["Sunday Baking", "Harvest Kitchen", "French Patisserie", "Rustic Bread & Herbs", "Grandma Rolling Dough", "Chef with Berry Tart", "Country Market Basket", "Cozy Kitchen at Dawn"],
  },
  {
    id: "whimsical-houses",
    label: "Whimsical Houses",
    emoji: "🏡✨",
    accentColor: "#8b6fc4",
    info: "Magical and vibrant fairy-tale house concepts lit by lanterns and stars.",
    promptTemplate: (topic, seed) =>
      `Create a detailed image description for a junk journal page featuring a "Whimsical Fairy-Tale House" illustration.
      Theme: "${topic}".
      Style: Vibrant, saturated watercolor painting, fantastical and imaginative, storybook illustration, magical and dreamlike, full of wonder and whimsy.
      Colors: Rich jewel tones and rainbow pastels — candy pink, violet, turquoise, sunflower yellow, emerald green, deep navy night sky, warm golden glow from windows.
      House types (pick fitting one): cupcake house, mushroom house, treehouse with spiral staircase, balloon-lifted cottage, house built on a snail shell, castle tower wrapped in ivy, shoe house, house inside a giant flower, enchanted forest cottage, cloud castle, candy-striped house, house lit by fireflies and lanterns.
      Magical elements: glowing windows, stone pathways, swirling chimneys, floating lanterns, giant sunflowers, fireflies, star-filled night sky, crescent moon, enchanted forest, butterflies, heart decorations, swirls and curls.
      Format: Full-page vibrant illustration, A4 printable, highly detailed and magical. Under 70 words. Seed:${seed}`,
    suggestions: ["Mushroom Cottage", "Balloon House", "Treehouse Night", "Candy Castle", "Witch's Tower in Forest", "Fairy on Cloud Castle", "Gnome Village at Dusk", "Giant Shoe House"],
  },
  {
    id: "shabby-chic-rose",
    label: "Shabby Chic Rose",
    emoji: "🌹",
    accentColor: "#d4849a",
    info: "Feminine, delicate vintage collage with blush pink roses, lace, and letters.",
    promptTemplate: (topic, seed) =>
      `Create a detailed image description for a junk journal page in a "Shabby Chic Rose" style.
      Theme: "${topic}".
      Style: Soft romantic watercolor illustration layered over aged handwritten cursive script paper background. Shabby chic, feminine, nostalgic, distressed and delicate.
      Colors: Blush pink, dusty rose, antique cream, soft teal/mint, warm ivory, faded peach, parchment beige.
      Elements (choose fitting ones for the theme): pink watercolor roses, lace doilies, handwritten vintage letters & envelopes, ornate keys, vintage scissors, perfume bottles, teapots with roses, stacked old books, songbirds, flickering candles, gilded mirrors, mason jars with roses, apothecary bottles, butterfly on envelope with wax seal, pocket watches, iron lanterns, shuttered windows with climbing roses, ribbon-tied love letters, rose-framed oval frames.
      Texture: aged parchment paper with faint cursive script overlay, soft tea staining, torn paper edges.
      Format: Full-page richly layered collage illustration, A4 printable, high artistic quality. Under 70 words. Seed:${seed}`,
    suggestions: ["Rose Tea Set", "Vintage Letters", "Secret Garden Key", "Perfume & Roses", "Lady Writing at Vanity", "Bride with Rose Bouquet", "Girl Reading Love Letter", "Lace Gloves & Pearls"],
  },
  {
    id: "majestic-wild",
    label: "Majestic & Wild",
    emoji: "🐴",
    accentColor: "#6b7fa3",
    info: "Sweeping, dramatic landscape and animal scenes inspired by romantic realism.",
    promptTemplate: (topic, seed) =>
      `Create a detailed image description for a junk journal page in a "Majestic Wild Nature" style.
      Theme: "${topic}".
      Style: Grand, painterly, impressionistic nature scene, dramatic lighting, romantic realism, National Geographic meets watercolor.
      Colors: Rich earth tones, deep forest greens, golden hour amber, storm grey, twilight purples.
      Elements: wild horses, majestic animals, open meadows, misty forests, dramatic skies, flowing water, ancient trees.
      Format: Full-page sweeping landscape illustration, A4 printable, high artistic quality. Under 65 words. Seed:${seed}`,
    suggestions: ["Wild Horses", "Forest Deer", "Mountain Eagles", "Misty Meadow", "Wolf Howling at Moon", "Bear Fishing in River", "Fox in Autumn Forest", "Owl on Ancient Oak"],
  },
  {
    id: "garden-cottage",
    label: "Garden Cottage",
    emoji: "🏡",
    accentColor: "#9eb87e",
    info: "Cozy, handmade cottagecore aesthetics featuring rustic pastels and garden props.",
    promptTemplate: (topic, seed) =>
      `Create a detailed image description for a junk journal page in a "Garden Cottage / Cottagecore" style.
      Theme: "${topic}".
      Style: Warm and cozy cottagecore, vintage cottage aesthetic, rustic pastels, handmade and homeopathic.
      Colors: Butter yellow, blush pink, mint green, lavender, warm linen white.
      Elements: flower boxes, birdhouses, picket fences, jam jars, doilies, herb gardens, stone pathways, climbing ivy, wooden gates.
      Format: Full-page illustration, A4 printable, charming and detailed. Under 65 words. Seed:${seed}`,
    suggestions: ["Herb Garden", "Cozy Porch", "Flower Window Box", "Garden Gate", "Cat Napping on Doorstep", "Girl Picking Strawberries", "Rabbit in Vegetable Patch", "Wooden Swing with Roses"],
  },
  {
    id: "classic-neutral",
    label: "Classic Neutral",
    emoji: "🦢",
    accentColor: "#a09387",
    info: "Timeless elegance using script, mono sketches, stamps, and neutral palettes.",
    promptTemplate: (topic, seed) =>
      `Create a detailed image description for a junk journal page in a "Classic Beige & Grey Vintage" style.
      Theme: "${topic}".
      Style: Timeless, elegant, neutral vintage aesthetic, sophisticated scrapbook, editorial feel with aged patina.
      Colors: Warm beige, classic grey, off-white, aged cream, soft charcoal, pale taupe.
      Elements: script typography, architectural sketches, vintage postage stamps, monograms, aged lace, damask patterns, French script, ornate filigree.
      Format: Full-page elegant collage, A4 printable, refined and detailed. Under 65 words. Seed:${seed}`,
    suggestions: ["French Script", "Monogram Florals", "Vintage Stamps", "Elegant Damask", "Lady in Pearls Portrait", "Victorian Reading Room", "Gentleman's Writing Desk", "Ornate Clock & Candles"],
  },
  {
    id: "valentines-day",
    label: "Valentine's Day",
    emoji: "💌🌹",
    accentColor: "#e04c64",
    info: "Delicate flat seamless patterns with scattered romantic hearts and roses.",
    promptTemplate: (topic, seed) =>
      `Create a detailed image description for a junk journal page in a "Valentine's Day Watercolor Pattern" style.
      Theme: "${topic}".
      Style: Flat 2D seamless pattern layout, all-over print design, delicate watercolor painting, shabby chic romantic aesthetic, wrapping paper style, evenly distributed motifs with no single central focal point.
      Background: Cream, warm ivory, soft pastel pink watercolor wash, or faint vintage paper texture.
      Motifs (incorporate based on theme): densely scattered watercolor hearts, delicate branching vines with leaves shaped like hearts, lush bloomed red and pink roses, heart-shaped floral wreaths, hand-painted hearts with stitched details, vertical pink stripes.
      Palette: Bright cherry red, soft blush pink, pale rose, deep crimson, warm cream, accented with soft sage green leaves and occasional dusty denim blue or warm ochre details.
      Format: Edge-to-edge continuous flat pattern illustration for scrapbooking, high artistic quality. Under 80 words. Seed:${seed}`,
    suggestions: ["Branches with Heart Leaves", "Scattered Seamless Hearts", "Vintage Red Roses", "Pink Stripes & Hearts", "Couple Under Cherry Blossoms", "Cherub with Arrow", "Girl with Heart Balloons", "Love Letters & Wax Seal"],
  },
  {
    id: "gardening-cottage",
    label: "Gardening",
    emoji: "🪴🧺",
    accentColor: "#7d9c6c",
    info: "Highly detailed watercolor scenes of vintage gardening activities and props.",
    promptTemplate: (topic, seed) =>
      `Create a detailed image description for a junk journal page in a "Vintage Cottagecore Gardening" style.
      Theme: "${topic}".
      Style: Soft, detailed, shabby chic watercolor illustration, nostalgic and romantic cottage garden aesthetic. Looks like a hand-painted scene on vintage paper.
      Scenes & Elements: stone steps covered in ivy, wicker baskets filled with yarn or flowers, weathered wooden arches or pergolas, blue rustic doors, vintage watering cans with daisies, birdbaths surrounded by lavender, wooden wheelbarrows overflowing with tulips, rustic wooden benches, stone bridges over streams, birdhouses on tables, potted plants, old wooden ladders leaning against picket fences.
      Colors: Soft natural greens, earthy wooden browns, dusty pinks, pastel lavenders, cornflower blues, and warm sunlight tones.
      Format: Full-page high artistic quality illustration, beautiful garden scene for scrapbooking, A4 printable. Under 80 words. Seed:${seed}`,
    suggestions: ["Wicker Basket & Watering Can", "Stone Steps with Ivy", "Vintage Birdbath", "Wooden Ladder Garden", "Old Lady Tending Roses", "Child in Sunhat with Sunflowers", "Cat Among Flower Pots", "Beekeeper in Garden"],
  },
];

// ─────────────────────────────────────────────

interface GeneratedItem {
  id: number;
  prompt: string;
  imageUrl: string;
  regenerating?: boolean;
}

export default function Home() {
  const { deductCredits, addCredits, user } = useAuth();
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(1);
  const [format, setFormat] = useState<"square" | "a4">("a4");
  const [activeStyleId, setActiveStyleId] = useState(JOURNAL_STYLES[0].id);
  const [items, setItems] = useState<GeneratedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const [customStyles, setCustomStyles] = useState<JournalStyle[]>([]);
  const [showAddStyleModal, setShowAddStyleModal] = useState(false);
  const [showStyleInfoModal, setShowStyleInfoModal] = useState(false);
  const [newStyleForm, setNewStyleForm] = useState({ label: '', emoji: '✨', info: '', prompt: '' });
  const [imageLink, setImageLink] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedSuggestions, setAnalyzedSuggestions] = useState<string[]>([]);
  const [namingFromPrompt, setNamingFromPrompt] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('junk-journal-custom-styles');
    if (saved) {
      try {
        setCustomStyles(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse customs styles");
      }
    }
  }, []);

  const allStyles = [...JOURNAL_STYLES, ...customStyles];
  const activeStyle = allStyles.find(s => s.id === activeStyleId) || allStyles[0];

  // ── Emoji auto-picker based on prompt keywords ──────────────────
  const getEmojiForPrompt = (prompt: string): string => {
    const p = prompt.toLowerCase();
    if (p.match(/watercolor|floral|flower|garden|blossom/)) return '🌸';
    if (p.match(/gothic|dark academia|victorian|ravens|coffin/)) return '🦇';
    if (p.match(/steampunk|gear|mechanical|clockwork|brass/)) return '⚙️';
    if (p.match(/forest|nature|tree|woodland|mushroom/)) return '🌿';
    if (p.match(/ocean|sea|coastal|beach|nautical|wave/)) return '🌊';
    if (p.match(/vintage|retro|antique|aged|parchment|sepia/)) return '📜';
    if (p.match(/food|kitchen|cook|bake|recipe|cake|bread/)) return '🍰';
    if (p.match(/cosmic|space|galaxy|star|celestial|moon/)) return '✨';
    if (p.match(/fairy|magic|whimsical|enchant|fantasy|elf/)) return '🧚';
    if (p.match(/rose|romantic|love|valentines|heart/)) return '🌹';
    if (p.match(/boho|bohemian|mediterrane|greek|moroccan/)) return '🫐';
    if (p.match(/animal|horse|wild|wolf|bear|fox|deer/)) return '🐴';
    if (p.match(/cottage|cozy|home|farmhouse|rustic/)) return '🏡';
    if (p.match(/neutral|elegant|classic|damask|filigree/)) return '🦢';
    if (p.match(/christmas|winter|snow|holly|nordic/)) return '❄️';
    if (p.match(/autumn|fall|harvest|pumpkin|maple/)) return '🍂';
    if (p.match(/summer|tropical|hibiscus|sunset|palm/)) return '🌺';
    if (p.match(/japanese|asian|zen|sakura|kimono/)) return 'ðŸŽ';
    if (p.match(/art deco|geometric|abstract|bauhaus/)) return '💎';
    if (p.match(/ink|sketch|pencil|charcoal|drawing/)) return '✏️';
    if (p.match(/cat|kitten|feline/)) return '🐱';
    if (p.match(/bird|swallow|sparrow|robin/)) return '🐦';
    if (p.match(/butterfly|dragonfly|insect/)) return '🦋';
    if (p.match(/lavender|purple|violet|lilac/)) return '💜';
    return '🎨';
  };

  // ── Auto-generate style name from prompt (on blur) ───────────────
  const generateStyleNameFromPrompt = async (prompt: string) => {
    if (!prompt || prompt.length < 30) return;
    setNamingFromPrompt(true);
    try {
      const payload = {
        model: "openai",
        messages: [{
          role: "user",
          content: `Based on this art style description, suggest a concise 2-4 word creative style name (e.g. "Dark Academia", "Coastal Boho", "Rustic Farmhouse"). Description: "${prompt.slice(0, 300)}". Reply ONLY with the style name, no punctuation, no quotes.`
        }],
        seed: Date.now()
      };
      const res = await fetch("/api/pollinations/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const name = (data.choices?.[0]?.message?.content || "").trim().replace(/["'.]/g, '').slice(0, 40);
      if (name && name.length > 2) {
        setNewStyleForm(prev => ({
          ...prev,
          label: prev.label || name,
          emoji: prev.emoji === '✨' ? getEmojiForPrompt(prompt) : prev.emoji
        }));
      } else {
        // at minimum update emoji
        setNewStyleForm(prev => ({ ...prev, emoji: prev.emoji === '✨' ? getEmojiForPrompt(prompt) : prev.emoji }));
      }
    } catch {
      setNewStyleForm(prev => ({ ...prev, emoji: prev.emoji === '✨' ? getEmojiForPrompt(prompt) : prev.emoji }));
    } finally {
      setNamingFromPrompt(false);
    }
  };

  // ── Deep image style analysis ─────────────────────────────────────
  const handleAnalyzeImage = async (url: string) => {
    if (!url) return;
    setAnalyzing(true);
    setToastMessage("🔍 AI is deeply scanning your image style... this takes a few seconds!");
    try {
      const systemPrompt = `You are a world-class junk journal art director and visual style analyst. Study this image with extreme attention to detail and extract the following:

STYLE_NAME: A catchy 2-4 word name for this style (e.g. "Rustic Farmhouse", "Dark Fairytale").
EMOJI: The single most fitting emoji that represents this style visually.
DESCRIPTION: A rich 70-90 word style prompt covering: art medium, color palette, textures, mood, lighting, key objects/elements, characters or subjects, recurring patterns, and the overall aesthetic. Be evocative and specific.
INFO: One sentence describing what this style is best suited for and its unique selling point.
SUGGESTIONS: Exactly 6 comma-separated creative scene/topic ideas (mix of scenes, objects, AND characters/people/animals) that would look stunning in this style.

Format your response EXACTLY like this, with each key on its own line:
STYLE_NAME: [name]
EMOJI: [single emoji]
DESCRIPTION: [detailed prompt]
INFO: [one sentence]
SUGGESTIONS: [idea1, idea2, idea3, idea4, idea5, idea6]`;

      const payload = {
        model: "openai",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            { type: "image_url", image_url: { url } }
          ]
        }]
      };

      const res = await fetch("/api/pollinations/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`API returned ${res.status}`);

      const data = await res.json();
      const raw: string = data.choices?.[0]?.message?.content || '';
      console.log('[Analyze] Raw API response:', raw);

      // Robust extractor: matches KEY: ... until next ALL_CAPS_KEY: or end of string
      const extract = (key: string): string => {
        const match = raw.match(new RegExp(`(?:^|\\n)${key}:[\\t ]*((?:.|\\n)*?)(?=\\n[A-Z_]{2,}:|\\s*$)`, 'i'));
        return match ? match[1].trim() : '';
      };

      const styleName = extract('STYLE_NAME');
      const emojiRaw = extract('EMOJI');
      const description = extract('DESCRIPTION') || raw.trim(); // fallback: use entire response
      const info = extract('INFO');
      const suggestionsRaw = extract('SUGGESTIONS');

      const emoji = emojiRaw.replace(/[^\p{Emoji}]/gu, '').slice(0, 2) || getEmojiForPrompt(raw);

      const suggestions = suggestionsRaw
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .slice(0, 6);

      setAnalyzedSuggestions(suggestions);
      setNewStyleForm(prev => ({
        ...prev,
        label: styleName || prev.label,
        emoji: emoji || prev.emoji,
        prompt: description,
        info: info || 'Custom style extracted from your reference image.'
      }));

      setToastMessage(`✨ Style fully analyzed! Auto-filled name, emoji, description & ${suggestions.length} topic ideas.`);
      setImageLink('');
    } catch (error) {
      console.error("Vision API error:", error);
      setToastMessage("❌ Failed to analyze image. Make sure it's a public image URL and try again.");
    } finally {
      setAnalyzing(false);
    }
  };


  const handleCreateCustomStyle = () => {
    if (!newStyleForm.label || !newStyleForm.prompt) return;
    const capturedLabel = newStyleForm.label;
    const capturedPrompt = newStyleForm.prompt;
    const capturedSuggestions = analyzedSuggestions.length > 0
      ? analyzedSuggestions
      : ["My Custom Scene", "Character in this Style", "Detailed Object Study", "Atmospheric Landscape"];
    const newStyle: JournalStyle = {
      id: "custom-" + Date.now(),
      label: capturedLabel,
      emoji: newStyleForm.emoji || "🖌️",
      accentColor: "#a37c5b",
      info: newStyleForm.info || "A custom art style generated by you.",
      promptTemplate: (topic, seed) =>
        `Create a detailed image description for a junk journal page in a "${capturedLabel}" style.\nTheme: "${topic}".\nStyle: ${capturedPrompt}\nFormat: Full-page, A4 printable. Under 75 words. Seed:${seed}`,
      suggestions: capturedSuggestions
    };

    const updated = [...customStyles, newStyle];
    setCustomStyles(updated);
    localStorage.setItem('junk-journal-custom-styles', JSON.stringify(updated));
    setActiveStyleId(newStyle.id);
    setShowAddStyleModal(false);
    setNewStyleForm({ label: '', emoji: '✨', info: '', prompt: '' });
    setAnalyzedSuggestions([]);
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success") && query.get("session_id")) {
      fetch("/api/stripe/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: query.get("session_id") })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.credits && data.userId) {
            addCredits(data.credits, data.userId);
            setToastMessage(`Success! ✨ ${data.credits} credits have been magically added to your account.`);
            setTimeout(() => setToastMessage(null), 5000); // Hide after 5 seconds
          }
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((error) => {
          if (error.name === "AbortError") return;
          console.error("Verification error:", error);
        });
    }
    if (query.get("canceled")) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [addCredits]);

  const getResolution = () => ({
    width: format === "square" ? 1024 : 896,
    height: format === "square" ? 1024 : 1280,
  });

  const buildImageUrl = async (prompt: string): Promise<string> => {
    const seed = Math.floor((Date.now() + Math.random() * 1000000) % 9999999);
    const res = await fetch("/api/pollinations/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, seed })
    });
    const data = await res.json();
    return data.url;
  };

  // ── Fisher-Yates shuffle util ────────────────────────────────────
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Build a list of `n` topics: manual ones first, then fill from suggestions (no back-to-back duplicates)
  const buildTopicList = (manualTopics: string[], suggestions: string[], n: number): string[] => {
    const result = [...manualTopics];
    if (result.length >= n) return result.slice(0, n);

    const pool = suggestions.filter(s => !result.includes(s));
    let bag = shuffleArray(pool.length > 0 ? pool : suggestions);
    let bagIndex = 0;

    while (result.length < n) {
      if (bagIndex >= bag.length) {
        // Reshuffle when bag is exhausted, avoid last item repeat
        const lastItem = bag[bag.length - 1];
        bag = shuffleArray(suggestions);
        // Make sure first item isn't same as last
        if (bag[0] === lastItem && bag.length > 1) {
          const idx = bag.findIndex((s, i) => i > 0 && s !== lastItem);
          if (idx > 0) [bag[0], bag[idx]] = [bag[idx], bag[0]];
        }
        bagIndex = 0;
      }
      result.push(bag[bagIndex++]);
    }
    return result;
  };

  const handleGenerate = async () => {
    if (!topic) return;

    if (!user) {
      alert("Please sign in to generate images.");
      return;
    }

    // Manual topics from comma-separated input
    const manualTopics = topic.split(',').map(t => t.trim()).filter(Boolean);
    // Build final topic list up to `count`, auto-filling from suggestions
    const finalTopics = buildTopicList(manualTopics, activeStyle.suggestions, count);
    const totalCount = finalTopics.length;

    const hasEnough = await deductCredits(totalCount);
    if (!hasEnough) return;

    setLoading(true);
    setItems([]);
    setProgress({ current: 0, total: totalCount });
    const newItems: GeneratedItem[] = [];

    for (let i = 0; i < totalCount; i++) {
      try {
        const currentTopic = finalTopics[i];
        const textSeed = Math.floor(Math.random() * 1000000);
        const textPromptInput = activeStyle.promptTemplate(currentTopic, textSeed);
        const textPayload = {
          model: "openai",
          messages: [{ role: "user", content: textPromptInput }],
          seed: textSeed
        };
        const textResponse = await fetch("/api/pollinations/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(textPayload)
        });
        const textData = await textResponse.json();
        const detailedPrompt = textData.choices?.[0]?.message?.content || "";
        const imageUrl = await buildImageUrl(detailedPrompt);
        newItems.push({ id: i, prompt: detailedPrompt, imageUrl });
        setProgress(prev => ({ ...prev, current: i + 1 }));
      } catch (error) {
        console.error("Error generating item:", error);
      }
    }

    setItems(newItems);
    setLoading(false);
  };

  const updatePrompt = (id: number, newPrompt: string) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, prompt: newPrompt } : item)));
  };

  // Called by img's onLoad/onError to clear the loading state
  const onImageLoaded = (id: number) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, regenerating: false } : i)));
  };

  const regenerateSingle = async (id: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    if (!user) {
      alert("Please sign in to generate images.");
      return;
    }

    const hasEnough = await deductCredits(1);
    if (!hasEnough) return;
    const newUrl = await buildImageUrl(item.prompt);
    // Mark as regenerating; overlay will hide only when the new image fully loads
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, imageUrl: newUrl, regenerating: true } : i
    ));
  };

  const preloadImageAsBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleDownloadZip = async () => {
    if (items.length === 0) return;
    setDownloadingAll(true);
    setToastMessage("Packaging your magical pages into a ZIP... 📦");
    try {
      const zip = new JSZip();
      for (let i = 0; i < items.length; i++) {
        const response = await fetch(items[i].imageUrl);
        const blob = await response.blob();
        zip.file(`junk-journal-page-${i + 1}.jpg`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${activeStyle.id}-collection.zip`);
      setToastMessage("Your ZIP file is ready! 🎉");
    } catch (error) {
      console.error(error);
      alert("Failed to create ZIP.");
    }
    setDownloadingAll(false);
  };

  const handleDownloadPdf = async () => {
    if (items.length === 0) return;
    setDownloadingAll(true);
    setToastMessage("Binding your pages into a PDF book... 📖");
    try {
      // Create a PDF: A4 size is approx 210x297 mm. Square can be 210x210
      const isPortrait = format === 'a4';
      const pdf = new jsPDF({
        orientation: isPortrait ? 'portrait' : 'landscape',
        unit: 'mm',
        format: isPortrait ? 'a4' : [210, 210] // custom square size roughly a4 width
      });

      const width = isPortrait ? 210 : 210;
      const height = isPortrait ? 297 : 210;

      for (let i = 0; i < items.length; i++) {
        const base64Img = await preloadImageAsBase64(items[i].imageUrl);
        if (i > 0) pdf.addPage(isPortrait ? 'a4' : [210, 210], isPortrait ? 'p' : 'l');
        pdf.addImage(base64Img, 'JPEG', 0, 0, width, height);
      }
      pdf.save(`${activeStyle.id}-journal.pdf`);
      setToastMessage("Your magical PDF book is ready! 🎉");
    } catch (error) {
      console.error(error);
      alert("Failed to create PDF.");
    }
    setDownloadingAll(false);
  };

  return (
    <div>
      {toastMessage && (
        <div className="fade-in" style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-paper)', border: '2px solid var(--accent-sepia)',
          boxShadow: 'var(--shadow-md)', padding: '1rem 2rem', borderRadius: '50px',
          zIndex: 9999, display: 'flex', alignItems: 'center', gap: '1rem'
        }}>
          <span style={{ fontSize: '1.2rem' }}>💌</span>
          <p className="handwritten" style={{ fontSize: '1.4rem', color: 'var(--accent-ink)', margin: 0 }}>
            {toastMessage}
          </p>
          <button onClick={() => setToastMessage(null)} style={{
            background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-secondary)'
          }}>×</button>
        </div>
      )}

      <section className="hero fade-in">
        <h1>Whimsical <span className="handwritten" style={{ fontSize: '1.2em', verticalAlign: 'middle' }}>Watercolor</span> Gardens</h1>
        <p>Create dreamy, cottagecore-inspired junk journal pages perfect for Etsy digital kits.</p>
      </section>

      <div className="paper-card fade-in" style={{ maxWidth: '950px', margin: '0 auto', borderBottom: `4px solid ${activeStyle.accentColor}` }}>

        {/* Style Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Art Style
            </label>
            <button
              onClick={() => setShowStyleInfoModal(true)}
              style={{ background: 'var(--bg-paper)', border: `1px solid ${activeStyle.accentColor}`, borderRadius: '20px', padding: '2px 10px', cursor: 'pointer', fontSize: '0.8rem', color: activeStyle.accentColor, fontWeight: 600 }}
              title="Style Info"
            >
              ℹ️ Style Info
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {allStyles.map(style => (
              <button
                key={style.id}
                onClick={() => setActiveStyleId(style.id)}
                style={{
                  padding: '8px 16px',
                  border: `2px solid ${activeStyleId === style.id ? style.accentColor : 'var(--border-sepia)'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: activeStyleId === style.id ? style.accentColor + '22' : 'transparent',
                  fontWeight: activeStyleId === style.id ? 700 : 400,
                  color: activeStyleId === style.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  transition: '0.2s',
                }}
              >
                {style.emoji} {style.label}
              </button>
            ))}
            <button
              onClick={() => setShowAddStyleModal(true)}
              style={{
                padding: '8px 16px',
                border: `2px dashed var(--border-sepia)`,
                borderRadius: '6px',
                cursor: 'pointer',
                background: 'transparent',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                transition: '0.2s',
              }}
            >
              ➕ Add Style
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
            <label htmlFor="topic" style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Scene Topic</label>
            <div style={{ display: 'flex', gap: '0.5rem', background: '#f0ede4', padding: '4px', borderRadius: '6px' }}>
              {(["square", "a4"] as const).map(f => (
                <button key={f} onClick={() => setFormat(f)} style={{
                  padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer',
                  background: format === f ? 'var(--accent-sepia)' : 'transparent',
                  color: format === f ? 'white' : 'var(--text-secondary)',
                  fontSize: '0.8rem', fontWeight: 600, transition: '0.2s'
                }}>
                  {f === "square" ? "Square" : "A4 Printable"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <input
              id="topic"
              type="text"
              className="input-field"
              placeholder="e.g. Garden gate with roses, Stone bridge over stream..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleGenerate()}
            />

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Try:</span>
              {activeStyle.suggestions.map(tag => (
                <button key={tag} onClick={() => {
                  setTopic(prev => {
                    const trimmed = prev.trim();
                    if (!trimmed) return tag;
                    // Don't add if already in the list
                    const parts = trimmed.split(',').map(s => s.trim());
                    if (parts.includes(tag)) return prev;
                    return trimmed + ', ' + tag;
                  });
                }} style={{
                  background: 'none', border: 'none', color: 'var(--accent-sepia)',
                  fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', padding: 0
                }}>
                  {tag}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#fdfbf7', padding: '1rem', borderRadius: '4px', border: '1px dashed var(--border-sepia)' }}>
              <div style={{ flex: 1 }}>
                {(() => {
                  const manualTopics = topic.split(',').map(t => t.trim()).filter(Boolean);
                  const hasManual = manualTopics.length > 0;
                  const willAutoFill = hasManual && count > manualTopics.length;
                  return (
                    <>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                        {hasManual
                          ? willAutoFill
                            ? <>🎨 <strong>{manualTopics.length} selected</strong> + <strong>{count - manualTopics.length} random</strong> from suggestions = <strong>{count} images</strong></>
                            : <>🎨 <strong>{Math.min(manualTopics.length, count)} topics</strong> → <strong>{Math.min(manualTopics.length, count)} images</strong> (one per topic)</>
                          : <>📄 <strong>{count}</strong> pages, auto-picked randomly from suggestions</>
                        }
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input
                          type="range" min="1" max="50" value={count}
                          onChange={(e) => setCount(parseInt(e.target.value))}
                          style={{ flex: 1, accentColor: 'var(--accent-sepia)', cursor: 'pointer' }}
                        />
                        <input
                          type="number" min="1" max="50" value={count}
                          onChange={(e) => {
                            const v = Math.max(1, Math.min(50, parseInt(e.target.value) || 1));
                            setCount(v);
                          }}
                          style={{
                            width: '56px', textAlign: 'center', padding: '4px 6px',
                            border: '1px solid var(--border-sepia)', borderRadius: '4px',
                            background: 'white', fontSize: '0.9rem', fontWeight: 700,
                            color: 'var(--text-primary)', outline: 'none'
                          }}
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
              <button className="btn" onClick={handleGenerate} disabled={loading || !topic} style={{ minWidth: '180px', height: '50px' }}>
                {loading ? `Designing (${progress.current}/${progress.total})...` : "Generate Etsy Pack"}
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ width: '100%', height: '4px', background: '#eee', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{
                width: `${(progress.current / progress.total) * 100}%`,
                height: '100%', background: activeStyle.accentColor, transition: 'width 0.3s ease'
              }}></div>
            </div>
            <p className="handwritten" style={{ fontSize: '1.2rem' }}>Creating digital paper... each page is unique.</p>
          </div>
        )}

        {items.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h2 style={{ borderBottom: '1px solid var(--border-sepia)', paddingBottom: '0.5rem', margin: 0 }}>
                  Your Printable Collection
                </h2>
                <span style={{ fontSize: '0.8rem', background: activeStyle.accentColor, color: 'white', padding: '4px 10px', borderRadius: '20px' }}>
                  {activeStyle.emoji} {activeStyle.label} · {format.toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleDownloadZip}
                  disabled={downloadingAll}
                  className="btn-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '4px', cursor: downloadingAll ? 'wait' : 'pointer', background: 'white' }}
                >
                  {downloadingAll ? '...' : '📦 Download ZIP'}
                </button>
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingAll}
                  className="btn"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '4px', cursor: downloadingAll ? 'wait' : 'pointer' }}
                >
                  {downloadingAll ? '...' : '📖 Export PDF'}
                </button>
              </div>
            </div>
            <div className="grid-4">
              {items.map((item) => (
                <div key={item.id} className="fade-in" style={{
                  background: 'white', border: '1px solid var(--border-sepia)',
                  boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column'
                }}>
                  <div style={{
                    position: 'relative', overflow: 'hidden',
                    aspectRatio: format === 'a4' ? '8.5/11' : '1/1',
                  }}>
                    <img
                      src={item.imageUrl}
                      alt={item.prompt}
                      style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        opacity: item.regenerating ? 0.15 : 1,
                        transition: 'opacity 0.4s ease'
                      }}
                      loading="lazy"
                      onLoad={() => onImageLoaded(item.id)}
                      onError={() => onImageLoaded(item.id)}
                    />
                    {item.regenerating && (
                      <div style={{
                        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(253,251,247,0.85)', gap: '0.75rem'
                      }}>
                        {/* CSS spinner */}
                        <div style={{
                          width: '36px', height: '36px',
                          border: '3px solid var(--border-sepia)',
                          borderTop: '3px solid var(--accent-sepia)',
                          borderRadius: '50%',
                          animation: 'spin 0.9s linear infinite'
                        }} />
                        <p className="handwritten" style={{ fontSize: '1.1rem', color: 'var(--accent-sepia)' }}>
                          Painting...
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '0.8rem' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Edit Prompt
                    </label>
                    <textarea
                      value={item.prompt}
                      onChange={(e) => updatePrompt(item.id, e.target.value)}
                      rows={4}
                      style={{
                        width: '100%', fontSize: '0.75rem', color: 'var(--text-primary)',
                        fontStyle: 'italic', lineHeight: '1.5', padding: '8px',
                        border: '1px solid var(--border-sepia)', borderRadius: '3px',
                        background: '#fdfbf7', resize: 'vertical', fontFamily: 'inherit', outline: 'none'
                      }}
                    />
                    <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.5rem' }}>
                      <a
                        href={item.imageUrl} target="_blank" download
                        style={{
                          padding: '5px 10px', fontSize: '0.72rem', flex: 1, textAlign: 'center',
                          border: '1px solid var(--border-sepia)', borderRadius: '3px',
                          textDecoration: 'none', color: 'var(--accent-sepia)', background: 'transparent'
                        }}
                      >
                        HD Download
                      </a>
                      <button
                        onClick={() => regenerateSingle(item.id)}
                        disabled={item.regenerating}
                        className="btn"
                        style={{ padding: '5px 10px', fontSize: '0.72rem', flex: 1 }}
                      >
                        {item.regenerating ? "..." : "↺ Regenerate"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '6rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '4rem', fontSize: '2.5rem' }}>Etsy Success Tips</h2>
        <div className="grid">
          <div className="paper-card">
            <h3 className="handwritten" style={{ fontSize: '1.8rem' }}>Edit & Refine</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Each card has an editable prompt — tweak it and hit <strong>↺ Regenerate</strong> for a new variation.</p>
          </div>
          <div className="paper-card">
            <h3 className="handwritten" style={{ fontSize: '1.8rem' }}>Bundle Packs</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Use the batch slider to create 10–15 matching pages for a single themed collection.</p>
          </div>
          <div className="paper-card">
            <h3 className="handwritten" style={{ fontSize: '1.8rem' }}>File Format</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Download the HD images and convert to PDF or JPG before listing on Etsy.</p>
          </div>
        </div>
      </div>
      {showStyleInfoModal && (
        <div className="modal-overlay" onClick={() => setShowStyleInfoModal(false)}>
          <div className="modal fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', borderTop: `6px solid ${activeStyle.accentColor}` }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span>{activeStyle.emoji}</span> {activeStyle.label}
            </h2>
            <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border-sepia)', marginBottom: '1.5rem' }}>
              <p style={{ color: 'var(--text-primary)', lineHeight: '1.6', margin: 0, fontSize: '0.95rem' }}>
                {activeStyle.info}
              </p>
            </div>

            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', borderBottom: '1px dashed var(--border-sepia)', paddingBottom: '0.5rem' }}>Pro Tips for this style:</h3>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              <li>Keep the Scene Topic under 10 words.</li>
              <li>Let the AI do the heavy lifting for the aesthetic.</li>
              {activeStyle.suggestions.length > 0 && (
                <li>Try some suggested topics like: <em>{activeStyle.suggestions.slice(0, 2).join(", ")}</em>.</li>
              )}
            </ul>

            <button className="btn" onClick={() => setShowStyleInfoModal(false)} style={{ width: '100%', padding: '0.8rem' }}>
              Got it! ✨
            </button>
          </div>
        </div>
      )}
      {
        showAddStyleModal && (
          <div className="modal-overlay" onClick={() => setShowAddStyleModal(false)}>
            <div className="modal fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2>➕ Add Custom Style</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Create your own unique generation style by defining its core aesthetic and instructions. Your style is saved to this browser.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Style Name</label>
                  <input type="text" className="input-field" placeholder="e.g. Steampunk Diary" value={newStyleForm.label} onChange={e => setNewStyleForm(prev => ({ ...prev, label: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Emoji (Optional)</label>
                  <input type="text" className="input-field" placeholder="e.g. ⚙️" value={newStyleForm.emoji} onChange={e => setNewStyleForm(prev => ({ ...prev, emoji: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    Style Instructions (The Prompt)
                    {namingFromPrompt && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: 'var(--accent-sepia)' }}>✦ Auto-naming...</span>}
                  </label>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#888', marginBottom: '0.3rem' }}>
                    Describe the style in detail. When you finish typing and click away, AI will auto-fill the name & emoji.
                  </span>
                  <textarea
                    className="input-field"
                    rows={5}
                    placeholder="e.g. Soft watercolor illustration with cottagecore aesthetic, blush pink roses, lace textures, aged parchment, handwritten script overlay, warm sepia tones..."
                    value={newStyleForm.prompt}
                    onChange={e => setNewStyleForm(prev => ({ ...prev, prompt: e.target.value }))}
                    onBlur={e => generateStyleNameFromPrompt(e.target.value)}
                  />
                </div>
                {analyzedSuggestions.length > 0 && (
                  <div style={{ padding: '0.75rem', background: '#f5f0e8', borderRadius: '6px', border: '1px dashed var(--accent-sepia)' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>✨ Extracted Topic Ideas (will be saved as "Try:" suggestions)</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {analyzedSuggestions.map(s => (
                        <span key={s} style={{ fontSize: '0.72rem', background: 'white', border: '1px solid var(--border-sepia)', borderRadius: '20px', padding: '2px 10px', color: 'var(--accent-sepia)' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ padding: '1rem', border: '2px dashed var(--border-sepia)', borderRadius: '8px', textAlign: 'center', background: '#fffcf5' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    <strong>Or Add Image Link</strong><br />
                    AI will automatically extract the art style instructions.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Paste image URL here..."
                      value={imageLink}
                      onChange={(e) => setImageLink(e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                    />
                    <button
                      className="btn"
                      onClick={() => handleAnalyzeImage(imageLink)}
                      disabled={analyzing || !imageLink}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                    >
                      {analyzing ? "..." : "Analyze"}
                    </button>
                  </div>
                  {analyzing && (
                    <p className="handwritten" style={{ fontSize: '1rem', marginTop: '0.5rem' }}>Scanning aesthetics... 🕯️</p>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Info (Tips for users)</label>
                  <input type="text" className="input-field" placeholder="e.g. Works best with mechanical objects." value={newStyleForm.info} onChange={e => setNewStyleForm(prev => ({ ...prev, info: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-secondary" onClick={() => setShowAddStyleModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn" onClick={handleCreateCustomStyle} disabled={!newStyleForm.label || !newStyleForm.prompt} style={{ flex: 1 }}>✨ Save Style</button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
