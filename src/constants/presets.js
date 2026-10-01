// Sample high quality Unsplash photos for instant demo
export const SAMPLE_PHOTOS = [
  {
    id: 'sample-1',
    name: 'Vintage Sunset',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    category: 'Nature'
  },
  {
    id: 'sample-2',
    name: 'Retro Cafe',
    url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1000&q=80',
    category: 'Aesthetic'
  },
  {
    id: 'sample-3',
    name: 'Neon Tokyo',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80',
    category: 'Urban'
  },
  {
    id: 'sample-4',
    name: 'Summer Roadtrip',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80',
    category: 'Travel'
  },
  {
    id: 'sample-5',
    name: 'Aesthetic Flowers',
    url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=80',
    category: 'Minimal'
  }
];

// Frame Aspect Ratios
export const FRAME_RATIOS = [
  { id: 'classic', name: 'Classic Polaroid', width: 3.5, height: 4.25, photoRatio: '1:1', desc: 'Original 88x107mm ratio' },
  { id: 'instax-mini', name: 'Instax Mini', width: 2.1, height: 3.4, photoRatio: '3:4', desc: 'Tall portrait pocket frame' },
  { id: 'instax-wide', name: 'Instax Wide', width: 4.25, height: 3.4, photoRatio: '4:3', desc: 'Landscape wide format' },
  { id: 'square', name: 'Square Modern', width: 4, height: 4.5, photoRatio: '1:1', desc: 'Symmetrical square photo' },
  { id: 'vintage-postcard', name: 'Vintage Postcard', width: 4, height: 5.5, photoRatio: '3:2', desc: 'Postcard retro look' }
];

// Predefined Theme Styles (One-click presets)
export const THEME_PRESETS = [
  {
    id: 'classic-white',
    name: 'Classic 1970s',
    tagline: 'Timeless white polaroid with warm tones',
    frameColor: '#Fcfbf7',
    frameTexture: 'paper',
    filter: 'vintage',
    brightness: 5,
    contrast: 10,
    saturation: -15,
    warmth: 20,
    grain: 25,
    vignette: 20,
    lightLeak: 'top-right',
    font: 'caveat',
    caption: 'Summer memories ☀️',
    tapeStyle: 'masking',
    tapePosition: 'top-center',
    dateStampEnabled: true,
    finishStyle: 'matte'
  },
  {
    id: 'aged-yellow',
    name: 'Aged Attic Vintage',
    tagline: 'Yellowed aged paper with heavy grain & dust',
    frameColor: '#f4ebd0',
    frameTexture: 'distressed',
    filter: 'sepia',
    brightness: 0,
    contrast: 15,
    saturation: -30,
    warmth: 40,
    grain: 55,
    vignette: 45,
    lightLeak: 'burnt-edge',
    font: 'courier',
    caption: 'Found in an old chest ~ 1984',
    tapeStyle: 'vintage-tape',
    tapePosition: 'corners',
    dateStampEnabled: true,
    finishStyle: 'matte'
  },
  {
    id: 'cyber-dark',
    name: 'Noir Cyber',
    tagline: 'Matte black frame with neon pops',
    frameColor: '#121318',
    frameTexture: 'smooth',
    filter: 'cyberpunk',
    brightness: -5,
    contrast: 30,
    saturation: 25,
    warmth: -20,
    grain: 15,
    vignette: 35,
    lightLeak: 'cyan-pink',
    font: 'permanent',
    caption: 'MIDNIGHT IN TOKYO // 02:45',
    tapeStyle: 'black-duct',
    tapePosition: 'top-left',
    dateStampEnabled: true,
    finishStyle: 'glossy'
  },
  {
    id: 'pastel-dream',
    name: 'Pastel Sorbet',
    tagline: 'Dreamy soft gradient border & soft focus',
    frameColor: 'linear-gradient(135deg, #ffc3a0 0%, #ffafbd 100%)',
    frameTexture: 'smooth',
    filter: 'faded',
    brightness: 10,
    contrast: -10,
    saturation: 10,
    warmth: 10,
    grain: 10,
    vignette: 10,
    lightLeak: 'soft-rainbow',
    font: 'dancing',
    caption: 'Golden state of mind ✨',
    tapeStyle: 'washi-pink',
    tapePosition: 'top-right',
    dateStampEnabled: false,
    finishStyle: 'holographic'
  },
  {
    id: 'retro-kodak',
    name: 'Kodak Gold 90s',
    tagline: 'Rich golden shadows and classic orange date',
    frameColor: '#Fbf8f1',
    frameTexture: 'canvas',
    filter: 'kodak',
    brightness: 8,
    contrast: 12,
    saturation: 15,
    warmth: 25,
    grain: 30,
    vignette: 15,
    lightLeak: 'side-flare',
    font: 'indie',
    caption: 'Beach days with friends 🌊',
    tapeStyle: 'washi-grid',
    tapePosition: 'top-center',
    dateStampEnabled: true,
    finishStyle: 'glossy'
  }
];

// Color Filters definition for CSS/Canvas processing
export const PHOTO_FILTERS = [
  { id: 'normal', name: 'Original', desc: 'No filter applied' },
  { id: 'vintage', name: '70s Vintage', desc: 'Warm yellowed nostalgic look' },
  { id: 'kodak', name: 'Kodak Gold', desc: 'Vibrant golden hour hues' },
  { id: 'sepia', name: 'Classic Sepia', desc: 'Timeless dark brown tones' },
  { id: 'bw', name: 'Noir B&W', desc: 'High contrast monochrome' },
  { id: 'faded', name: 'Faded Memories', desc: 'Soft pastel matte finish' },
  { id: 'cyberpunk', name: 'Neon Cyber', desc: 'Cool blues & hot magenta' },
  { id: 'cool-drift', name: 'Cool Drift', desc: 'Crisp cinematic blue tint' },
  { id: 'warm-sunset', name: 'Golden Sunset', desc: 'Deep warm amber tones' }
];

// Available Fonts
export const CAPTION_FONTS = [
  { id: 'caveat', name: 'Caveat (Handwritten)', family: "'Caveat', cursive" },
  { id: 'permanent', name: 'Permanent Marker', family: "'Permanent Marker', cursive" },
  { id: 'indie', name: 'Indie Flower', family: "'Indie Flower', cursive" },
  { id: 'courier', name: 'Typewriter Vintage', family: "'Courier Prime', monospace" },
  { id: 'dancing', name: 'Dancing Script', family: "'Dancing Script', cursive" },
  { id: 'shadows', name: 'Shadows Light', family: "'Shadows Into Light', cursive" },
  { id: 'reenie', name: 'Reenie Beanie', family: "'Reenie Beanie', cursive" },
  { id: 'kalam', name: 'Kalam Casual', family: "'Kalam', cursive" },
  { id: 'vt323', name: 'Digital LED Retro', family: "'VT323', monospace" }
];

// Tape Overlay Styles
export const TAPE_STYLES = [
  { id: 'none', name: 'No Tape' },
  { id: 'masking', name: 'Classic Masking Tape' },
  { id: 'vintage-tape', name: 'Aged Yellow Tape' },
  { id: 'washi-pink', name: 'Pastel Pink Washi' },
  { id: 'washi-grid', name: 'Minimal Grid Washi' },
  { id: 'black-duct', name: 'Black Electrical Tape' },
  { id: 'holo-tape', name: 'Holographic Silver' }
];

// Tape Placement Positions
export const TAPE_POSITIONS = [
  { id: 'top-center', name: 'Top Center' },
  { id: 'top-left', name: 'Top Left Angle' },
  { id: 'top-right', name: 'Top Right Angle' },
  { id: 'corners', name: 'Both Top Corners' },
  { id: 'diagonal-cross', name: 'Cross Center' }
];

// Light Leaks
export const LIGHT_LEAKS = [
  { id: 'none', name: 'None' },
  { id: 'top-right', name: 'Warm Corner Sunburst' },
  { id: 'side-flare', name: 'Retro Anamorphic Flare' },
  { id: 'bottom-warm', name: 'Bottom Film Burn' },
  { id: 'soft-rainbow', name: 'Prism Rainbow Glow' },
  { id: 'cyan-pink', name: 'Dual Neon Leak' },
  { id: 'burnt-edge', name: 'Vintage Edge Burn' }
];

// Frame Textures
export const FRAME_TEXTURES = [
  { id: 'smooth', name: 'Smooth Satin' },
  { id: 'paper', name: 'Heavy Cotton Paper' },
  { id: 'canvas', name: 'Woven Canvas' },
  { id: 'distressed', name: 'Scratched & Distressed' }
];

// Stickers & Stamps
export const STICKERS = [
  { id: 'heart', emoji: '❤️', label: 'Heart' },
  { id: 'sparkles', emoji: '✨', label: 'Sparkles' },
  { id: 'sun', emoji: '☀️', label: 'Sun' },
  { id: 'camera', emoji: '📸', label: 'Camera' },
  { id: 'pin', emoji: '📍', label: 'Pin' },
  { id: 'coffee', emoji: '☕', label: 'Coffee' },
  { id: 'plane', emoji: '✈️', label: 'Travel' },
  { id: 'clover', emoji: '🍀', label: 'Clover' },
  { id: 'stamp-passed', emoji: '💮', label: 'Stamp' },
  { id: 'music', emoji: '🎵', label: 'Music' }
];
