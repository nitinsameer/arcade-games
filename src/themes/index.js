/**
 * Themes System - 19 complete theme definitions
 * Each theme exports all CSS custom properties as an object
 */

export const THEMES = {
  clay: {
    id: 'clay',
    name: 'Claymorphism',
    vars: {
      bg: '#ece8fb',
      bgc: '#ece8fb',
      card: '#f7f4ff',
      ink: '#2d2650',
      mute: '#7a72a8',
      accent: '#7c5cf0',
      accentg: 'linear-gradient(135deg,#8b6cf6,#6a4fe0)',
      onacc: '#fff',
      green: '#5cc46b',
      greeng: 'linear-gradient(135deg,#6fd37e,#4cb85c)',
      r: '26px',
      rs: '20px',
      bd: '0',
      bdt: '0',
      blur: 'none',
      well: '#ece8fb',
      barfill: '#ffd66b',
      sh: '9px 9px 20px rgba(124,100,200,.26),-7px -7px 16px rgba(255,255,255,.95),inset -4px -4px 9px rgba(110,90,190,.13),inset 4px 4px 9px rgba(255,255,255,.8)',
      shs: '5px 5px 11px rgba(124,100,200,.26),-3px -3px 8px rgba(255,255,255,.95),inset -3px -3px 7px rgba(110,90,190,.13),inset 3px 3px 7px rgba(255,255,255,.8)',
      sin: 'inset 3px 3px 7px rgba(110,90,190,.16),inset -3px -3px 7px rgba(255,255,255,.85)',
      sht: '7px 7px 15px rgba(124,100,200,.26),-5px -5px 11px rgba(255,255,255,.95),inset -5px -5px 10px rgba(0,0,0,.1),inset 5px 5px 10px rgba(255,255,255,.55)',
      shbtn: '7px 7px 15px rgba(124,100,200,.26),-5px -5px 11px rgba(255,255,255,.95),inset -5px -5px 10px rgba(0,0,0,.22),inset 5px 5px 10px rgba(255,255,255,.3)',
      font: "'Nunito',system-ui,sans-serif",
      fonth: "'Nunito',system-ui,sans-serif",
      tsh: 'none'
    }
  },
  claydark: {
    id: 'claydark',
    name: 'Clay Dark',
    vars: {
      bg: '#1e1a36',
      bgc: '#1e1a36',
      card: '#27224a',
      ink: '#f0ecff',
      mute: '#a69fd6',
      accent: '#9b82ff',
      well: '#1e1a36',
      sh: '9px 9px 20px rgba(0,0,0,.5),-6px -6px 14px rgba(255,255,255,.05),inset -4px -4px 9px rgba(0,0,0,.3),inset 4px 4px 9px rgba(255,255,255,.07)',
      shs: '5px 5px 11px rgba(0,0,0,.5),-3px -3px 8px rgba(255,255,255,.05),inset -3px -3px 7px rgba(0,0,0,.3),inset 3px 3px 7px rgba(255,255,255,.07)',
      sin: 'inset 3px 3px 7px rgba(0,0,0,.45),inset -3px -3px 7px rgba(255,255,255,.06)',
      sht: '7px 7px 15px rgba(0,0,0,.5),-5px -5px 11px rgba(255,255,255,.05),inset -5px -5px 10px rgba(0,0,0,.25),inset 5px 5px 10px rgba(255,255,255,.12)',
      shbtn: '7px 7px 15px rgba(0,0,0,.5),-5px -5px 11px rgba(255,255,255,.05),inset -5px -5px 10px rgba(0,0,0,.3),inset 5px 5px 10px rgba(255,255,255,.25)'
    }
  },
  glass: {
    id: 'glass',
    name: 'Glassmorphism',
    vars: {
      bg: 'radial-gradient(circle at 12% 15%,rgba(76,215,255,.75),transparent 42%),radial-gradient(circle at 88% 72%,rgba(255,95,163,.7),transparent 46%),linear-gradient(135deg,#5b4bff,#9b4fe0 55%,#ff8a5c)',
      bgc: '#6a4fe0',
      card: 'rgba(255,255,255,.18)',
      ink: '#fff',
      mute: 'rgba(255,255,255,.78)',
      accent: '#fff',
      accentg: 'linear-gradient(135deg,rgba(255,255,255,.42),rgba(255,255,255,.16))',
      onacc: '#fff',
      greeng: 'linear-gradient(135deg,rgba(90,230,150,.6),rgba(40,190,120,.4))',
      green: '#5ff0a0',
      r: '28px',
      rs: '20px',
      bd: '1px solid rgba(255,255,255,.4)',
      bdt: '1px solid rgba(255,255,255,.3)',
      blur: 'blur(18px) saturate(1.5)',
      well: 'rgba(0,0,0,.2)',
      barfill: '#ffe38a',
      sh: '0 8px 32px rgba(31,20,90,.35),inset 0 1px 0 rgba(255,255,255,.45)',
      shs: '0 4px 16px rgba(31,20,90,.28),inset 0 1px 0 rgba(255,255,255,.4)',
      sin: 'inset 0 2px 6px rgba(0,0,0,.25)',
      sht: '0 8px 24px rgba(31,20,90,.3),inset 0 1px 0 rgba(255,255,255,.45)',
      shbtn: '0 8px 24px rgba(31,20,90,.3),inset 0 1px 0 rgba(255,255,255,.5)',
      font: "'Nunito',system-ui,sans-serif"
    }
  },
  neu: {
    id: 'neu',
    name: 'Neumorphism',
    vars: {
      bg: '#e0e5ec',
      bgc: '#e0e5ec',
      card: '#e0e5ec',
      ink: '#3d4468',
      mute: '#7b83a3',
      accent: '#5b6cff',
      accentg: 'linear-gradient(145deg,#6d7dff,#4a5bf0)',
      greeng: 'linear-gradient(145deg,#4fd08a,#2fb56e)',
      well: '#e0e5ec',
      r: '24px',
      rs: '18px',
      sh: '9px 9px 18px #a3b1c6,-9px -9px 18px #fff',
      shs: '5px 5px 10px #a3b1c6,-5px -5px 10px #fff',
      sin: 'inset 4px 4px 8px #a3b1c6,inset -4px -4px 8px #fff',
      sht: '6px 6px 12px #a3b1c6,-6px -6px 12px #fff',
      shbtn: '6px 6px 12px #a3b1c6,-6px -6px 12px #fff'
    }
  },
  brutal: {
    id: 'brutal',
    name: 'Brutalism',
    vars: {
      bg: '#ffe66d',
      bgc: '#ffe66d',
      card: '#fff',
      ink: '#111',
      mute: '#444',
      accent: '#ff3d7f',
      accentg: '#ff5d8f',
      onacc: '#111',
      greeng: '#4ade80',
      green: '#2fbf71',
      ongr: '#111',
      r: '14px',
      rs: '10px',
      bd: '3px solid #111',
      bdt: '2px solid #111',
      well: '#fff',
      barfill: '#ffe66d',
      sh: '6px 6px 0 #111',
      shs: '3px 3px 0 #111',
      sin: 'none',
      sht: '4px 4px 0 #111',
      shbtn: '4px 4px 0 #111',
      font: "'Space Grotesk',system-ui,sans-serif",
      fonth: "'Space Grotesk',system-ui,sans-serif"
    }
  },
  cyber: {
    id: 'cyber',
    name: 'Cyberpunk',
    vars: {
      bg: 'radial-gradient(circle at 15% 0%,#3a1060,transparent 50%),radial-gradient(circle at 90% 90%,#07405a,transparent 45%),#07071a',
      bgc: '#07071a',
      card: '#12122e',
      ink: '#e8f0ff',
      mute: '#8fa0d0',
      accent: '#00f5d4',
      accentg: 'linear-gradient(135deg,#00f5d4,#00a8ff)',
      onacc: '#021018',
      greeng: 'linear-gradient(135deg,#00f5a0,#00c27a)',
      green: '#00f5a0',
      ongr: '#021018',
      r: '18px',
      rs: '14px',
      bd: '1px solid rgba(0,245,212,.55)',
      bdt: '1px solid rgba(0,245,212,.4)',
      well: '#0a0a22',
      barfill: '#ff2ec8',
      sh: '0 0 18px rgba(0,245,212,.22),inset 0 0 14px rgba(0,245,212,.07)',
      shs: '0 0 10px rgba(0,245,212,.25)',
      sin: 'inset 0 0 8px rgba(0,0,0,.7)',
      sht: '0 0 14px rgba(0,245,212,.3),inset 0 0 12px rgba(0,245,212,.08)',
      shbtn: '0 0 20px rgba(0,245,212,.55)',
      font: "'Space Grotesk',system-ui,sans-serif",
      fonth: "'Orbitron','Space Grotesk',system-ui,sans-serif",
      tsh: '0 0 12px rgba(0,245,212,.6)'
    }
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    vars: {
      bg: '#f5f5f7',
      bgc: '#f5f5f7',
      card: '#fff',
      ink: '#1d1d1f',
      mute: '#6e6e73',
      accent: '#0071e3',
      accentg: '#0071e3',
      greeng: '#30b857',
      r: '18px',
      rs: '12px',
      bd: '1px solid #e5e5ea',
      bdt: '1px solid #e5e5ea',
      well: '#ececf0',
      barfill: '#ffd60a',
      sh: '0 2px 12px rgba(0,0,0,.06)',
      shs: '0 1px 5px rgba(0,0,0,.08)',
      sin: 'inset 0 0 0 1px #e5e5ea',
      sht: '0 1px 6px rgba(0,0,0,.08)',
      shbtn: '0 4px 14px rgba(0,113,227,.3)',
      blur: 'blur(20px)'
    }
  },
  skeuo: {
    id: 'skeuo',
    name: 'Skeuomorphism',
    vars: {
      bg: "repeating-linear-gradient(45deg,rgba(0,0,0,.035) 0 2px,transparent 2px 4px),#d8d2c4",
      bgc: '#d8d2c4',
      card: 'linear-gradient(#fcfcfc,#d4d4d4)',
      ink: '#3b2a1e',
      mute: '#7a6652',
      accent: '#1f6fd6',
      accentg: 'linear-gradient(#7cc0ff,#1f7be0 50%,#1565c8 51%,#3e9bf0)',
      greeng: 'linear-gradient(#8be37f,#3bb44a 50%,#2f9d3d 51%,#58cf63)',
      r: '16px',
      rs: '12px',
      bd: '1px solid #8c8470',
      bdt: '1px solid #a39b88',
      well: '#c9c3b3',
      sh: '0 6px 12px rgba(0,0,0,.4),inset 0 1px 0 #fff,inset 0 -2px 4px rgba(0,0,0,.15)',
      shs: '0 3px 6px rgba(0,0,0,.4),inset 0 1px 0 #fff,inset 0 -2px 3px rgba(0,0,0,.15)',
      sin: 'inset 0 3px 6px rgba(0,0,0,.4)',
      sht: '0 4px 8px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.7),inset 0 -3px 5px rgba(0,0,0,.2)',
      shbtn: '0 4px 8px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.7),inset 0 -3px 5px rgba(0,0,0,.3)',
      font: "Georgia,'Nunito',serif",
      fonth: "Georgia,'Nunito',serif"
    }
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    vars: {
      bg: 'radial-gradient(circle at 20% 10%,rgba(0,255,170,.45),transparent 40%),radial-gradient(circle at 85% 30%,rgba(120,80,255,.55),transparent 45%),radial-gradient(circle at 50% 95%,rgba(0,170,255,.45),transparent 45%),#0b1020',
      bgc: '#0b1020',
      card: 'rgba(255,255,255,.08)',
      ink: '#f2f6ff',
      mute: '#a9b6d8',
      accent: '#5ef2c2',
      accentg: 'linear-gradient(135deg,#5ef2c2,#7a6cff)',
      onacc: '#08101f',
      r: '24px',
      rs: '16px',
      bd: '1px solid rgba(255,255,255,.14)',
      bdt: '1px solid rgba(255,255,255,.12)',
      blur: 'blur(16px)',
      well: 'rgba(255,255,255,.07)',
      sh: '0 10px 30px rgba(0,0,0,.35)',
      shs: '0 4px 14px rgba(0,0,0,.3)',
      sin: 'inset 0 2px 6px rgba(0,0,0,.4)',
      sht: '0 8px 22px rgba(0,0,0,.3)',
      shbtn: '0 8px 24px rgba(94,242,194,.35)'
    }
  },
  material: {
    id: 'material',
    name: 'Material Design 3',
    vars: {
      bg: '#fef7ff',
      bgc: '#fef7ff',
      card: '#f3edf7',
      ink: '#1d1b20',
      mute: '#49454f',
      accent: '#6750a4',
      accentg: '#6750a4',
      greeng: '#386a20',
      r: '28px',
      rs: '16px',
      well: '#e7e0ec',
      barfill: '#ffd8e4',
      sh: '0 1px 2px rgba(0,0,0,.2),0 2px 6px rgba(0,0,0,.1)',
      shs: '0 1px 2px rgba(0,0,0,.2)',
      sin: 'none',
      sht: '0 1px 3px rgba(0,0,0,.2)',
      shbtn: '0 2px 6px rgba(103,80,164,.35)',
      font: "Roboto,'Nunito',system-ui,sans-serif",
      fonth: "Roboto,'Nunito',system-ui,sans-serif"
    }
  },
  pixel: {
    id: 'pixel',
    name: 'Pixel Art',
    vars: {
      bg: '#1a1c2c',
      bgc: '#1a1c2c',
      card: '#29366f',
      ink: '#f4f4f4',
      mute: '#a7b4ff',
      accent: '#ffcd75',
      accentg: '#ef7d57',
      onacc: '#1a1c2c',
      greeng: '#38b764',
      green: '#38b764',
      r: '0',
      rs: '0',
      bd: '4px solid #f4f4f4',
      bdt: '3px solid #f4f4f4',
      well: '#1a1c2c',
      barfill: '#ffcd75',
      sh: '6px 6px 0 #000',
      shs: '3px 3px 0 #000',
      sin: 'none',
      sht: '5px 5px 0 #000',
      shbtn: '4px 4px 0 #000',
      font: "'VT323',monospace",
      fonth: "'Press Start 2P','VT323',monospace"
    }
  },
  synth: {
    id: 'synth',
    name: 'Synthwave',
    vars: {
      bg: "repeating-linear-gradient(0deg,rgba(255,255,255,.04) 0 2px,transparent 2px 40px),linear-gradient(180deg,#1a0536,#4a0a6b 50%,#c2186b)",
      bgc: '#1a0536',
      card: 'rgba(26,5,54,.72)',
      ink: '#ffe8ff',
      mute: '#d89cf0',
      accent: '#2ee6ff',
      accentg: 'linear-gradient(135deg,#ff2a8a,#ff9e2c)',
      onacc: '#1a0536',
      r: '14px',
      rs: '10px',
      bd: '2px solid #ff2a8a',
      bdt: '1px solid rgba(255,42,138,.7)',
      well: 'rgba(0,0,0,.35)',
      barfill: '#2ee6ff',
      sh: '0 0 18px rgba(255,42,138,.5)',
      shs: '0 0 10px rgba(255,42,138,.5)',
      sin: 'inset 0 0 8px rgba(0,0,0,.6)',
      sht: '0 0 14px rgba(255,42,138,.55)',
      shbtn: '0 0 22px rgba(255,158,44,.6)',
      fonth: "'Orbitron',system-ui,sans-serif",
      tsh: '0 0 10px rgba(255,42,138,.8)'
    }
  },
  paper: {
    id: 'paper',
    name: 'Paper',
    vars: {
      bg: "repeating-linear-gradient(transparent 0 31px,rgba(80,120,200,.2) 31px 32px),#f6efe0",
      bgc: '#f6efe0',
      card: '#fffdf6',
      ink: '#3a3a4a',
      mute: '#7a7566',
      accent: '#d9534f',
      accentg: '#e35d4f',
      greeng: '#58a55c',
      r: '10px',
      rs: '8px',
      bd: '2px solid #3a3a4a',
      bdt: '1.5px solid #3a3a4a',
      well: '#efe6d0',
      barfill: '#ffd966',
      sh: '3px 3px 0 rgba(58,58,74,.35)',
      shs: '2px 2px 0 rgba(58,58,74,.35)',
      sin: 'inset 1px 1px 0 rgba(58,58,74,.3)',
      sht: '3px 3px 0 rgba(58,58,74,.35)',
      shbtn: '3px 3px 0 #3a3a4a',
      font: "'Patrick Hand','Nunito',cursive",
      fonth: "'Caveat','Patrick Hand',cursive"
    }
  },
  oled: {
    id: 'oled',
    name: 'OLED',
    vars: {
      bg: '#000',
      bgc: '#000',
      card: '#0b0b0b',
      ink: '#f5f5f5',
      mute: '#8a8a8a',
      accent: '#4de1c1',
      accentg: '#4de1c1',
      onacc: '#000',
      greeng: '#3ddc84',
      r: '20px',
      rs: '14px',
      bd: '1px solid #2a2a2a',
      bdt: '1px solid #2a2a2a',
      well: '#141414',
      barfill: '#4de1c1',
      sh: 'none',
      shs: 'none',
      sin: 'none',
      sht: 'none',
      shbtn: 'none'
    }
  },
  bento: {
    id: 'bento',
    name: 'Bento',
    vars: {
      bg: '#f2f2f0',
      bgc: '#f2f2f0',
      card: '#fff',
      ink: '#111',
      mute: '#6b6b6b',
      accent: '#ff5a1f',
      accentg: '#ff5a1f',
      greeng: '#22b455',
      r: '30px',
      rs: '20px',
      bd: '1px solid #e6e6e2',
      bdt: '1px solid #e6e6e2',
      well: '#f0f0ec',
      barfill: '#ffd23f',
      sh: 'none',
      shs: 'none',
      sin: 'inset 0 0 0 1px #e6e6e2',
      sht: 'none',
      shbtn: 'none'
    }
  },
  pop: {
    id: 'pop',
    name: 'Pop',
    vars: {
      bg: 'radial-gradient(circle at 10% 5%,rgba(255,122,184,.25),transparent 40%),radial-gradient(circle at 95% 60%,rgba(18,194,233,.22),transparent 45%),#fff7fb',
      bgc: '#fff7fb',
      card: 'linear-gradient(135deg,#ffe3f1,#e3ebff)',
      ink: '#2a2140',
      mute: '#6b628a',
      accent: '#c471ed',
      accentg: 'linear-gradient(135deg,#12c2e9,#c471ed,#f64f59)',
      greeng: 'linear-gradient(135deg,#43e97b,#38f9d7)',
      ongr: '#06371f',
      r: '30px',
      rs: '22px',
      well: '#f1ecff',
      barfill: '#ffe66d',
      sh: '0 12px 28px rgba(120,60,200,.28)',
      shs: '0 6px 14px rgba(120,60,200,.25)',
      sin: 'inset 0 2px 6px rgba(120,60,200,.2)',
      sht: '0 8px 18px rgba(120,60,200,.3)',
      shbtn: '0 10px 22px rgba(196,113,237,.55)'
    }
  },
  aero: {
    id: 'aero',
    name: 'Aero',
    vars: {
      bg: 'radial-gradient(circle at 18% 28%,rgba(255,255,255,.85) 0 16px,transparent 17px),radial-gradient(circle at 82% 62%,rgba(255,255,255,.7) 0 26px,transparent 27px),linear-gradient(180deg,#5fc8ff,#bff0ff 45%,#e6ffd9)',
      bgc: '#bff0ff',
      card: 'linear-gradient(180deg,rgba(255,255,255,.9),rgba(255,255,255,.5))',
      ink: '#0b3a5a',
      mute: '#3b6b8a',
      accent: '#0b82d6',
      accentg: 'linear-gradient(180deg,#8ae0ff,#1a9be6 50%,#0b82d6 51%,#4cc2ff)',
      greeng: 'linear-gradient(180deg,#9cf08e,#3bb44a 50%,#2f9d3d 51%,#62d96d)',
      r: '22px',
      rs: '16px',
      bd: '1px solid rgba(255,255,255,.95)',
      bdt: '1px solid rgba(255,255,255,.9)',
      blur: 'blur(10px)',
      well: 'rgba(255,255,255,.55)',
      barfill: '#fff27a',
      sh: '0 8px 20px rgba(0,100,160,.3),inset 0 1px 0 #fff,inset 0 -8px 14px rgba(120,200,255,.35)',
      shs: '0 4px 10px rgba(0,100,160,.3),inset 0 1px 0 #fff,inset 0 -5px 8px rgba(120,200,255,.3)',
      sin: 'inset 0 2px 5px rgba(0,100,160,.3)',
      sht: '0 6px 14px rgba(0,100,160,.3),inset 0 1px 0 #fff,inset 0 -6px 10px rgba(120,200,255,.3)',
      shbtn: '0 4px 10px rgba(0,80,150,.45),inset 0 1px 0 rgba(255,255,255,.8)'
    }
  },
  term: {
    id: 'term',
    name: 'Terminal',
    vars: {
      bg: '#0a0f0a',
      bgc: '#0a0f0a',
      card: '#0d140d',
      ink: '#33ff66',
      mute: '#1fae45',
      accent: '#33ff66',
      accentg: '#33ff66',
      onacc: '#001a07',
      green: '#33ff66',
      greeng: '#33ff66',
      ongr: '#001a07',
      r: '4px',
      rs: '3px',
      bd: '1px solid #33ff66',
      bdt: '1px solid #1fae45',
      well: '#050a05',
      barfill: '#ffd33d',
      sh: '0 0 10px rgba(51,255,102,.25)',
      shs: '0 0 6px rgba(51,255,102,.25)',
      sin: 'none',
      sht: '0 0 8px rgba(51,255,102,.25)',
      shbtn: '0 0 14px rgba(51,255,102,.45)',
      font: "'Share Tech Mono',monospace",
      fonth: "'Share Tech Mono',monospace",
      tsh: '0 0 8px rgba(51,255,102,.6)'
    }
  },
  cartoon: {
    id: 'cartoon',
    name: 'Cartoon',
    vars: {
      bg: "radial-gradient(rgba(0,0,0,.13) 2px,transparent 2.5px) 0 0/18px 18px,#7ad7ff",
      bgc: '#7ad7ff',
      card: '#fff',
      ink: '#1b1b1b',
      mute: '#4a4a4a',
      accent: '#ff4757',
      accentg: '#ff4757',
      onacc: '#fff',
      greeng: '#2ecc71',
      green: '#2ecc71',
      r: '22px',
      rs: '16px',
      bd: '4px solid #1b1b1b',
      bdt: '3px solid #1b1b1b',
      well: '#fff',
      barfill: '#ffe14d',
      sh: '5px 5px 0 #1b1b1b',
      shs: '3px 3px 0 #1b1b1b',
      sin: 'none',
      sht: '4px 4px 0 #1b1b1b',
      shbtn: '4px 4px 0 #1b1b1b',
      font: "'Comic Neue','Nunito',cursive",
      fonth: "'Bangers','Comic Neue',cursive"
    }
  }
};

/**
 * Get theme by ID
 */
export function getTheme(id) {
  return THEMES[id] || THEMES.clay;
}

/**
 * Apply theme to document
 */
export function applyTheme(id) {
  const theme = getTheme(id);
  if (!theme || !theme.vars) return false;
  
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
  root.dataset.theme = id;
  return true;
}

export default { THEMES, getTheme, applyTheme };
