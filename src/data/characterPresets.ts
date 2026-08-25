import clayAvatarCutout from '../assets/images/clay_avatar_cutout_1787581662245.jpg';
import clayAvatarBg from '../assets/images/clay_avatar_bg_1787581636772.jpg';
import { CharacterAvatarConfig } from '../types';

export interface CharacterPreset {
  id: string;
  name: string;
  category: '3d_clay' | 'animated_gif' | 'anime_chibi' | 'pixel_retro' | 'cyber_bot';
  format: 'gif' | 'png' | 'svg' | 'webp';
  url: string;
  previewUrl: string;
  isTransparent: boolean;
  isGif: boolean;
  description: string;
  badge: string;
  defaultScale: number;
}

// Built-in presets with transparent backgrounds and animated GIFs
export const CHARACTER_PRESETS: CharacterPreset[] = [
  {
    id: 'ipan_clay_3d',
    name: 'Ipan 3D Clay (Transparan)',
    category: '3d_clay',
    format: 'png',
    url: clayAvatarCutout,
    previewUrl: clayAvatarCutout,
    isTransparent: true,
    isGif: false,
    description: 'Karakter 3D Clay Ipan dengan efek timbul melayang 3D tanpa latar.',
    badge: '✨ 3D Clay Original',
    defaultScale: 1.08,
  },
  {
    id: 'cyber_bot_animated',
    name: 'Cyber Companion Bot',
    category: 'cyber_bot',
    format: 'gif',
    // High-quality transparent animated cute AI companion
    url: 'https://media.giphy.com/media/l41lI4bYmcsPJX9Go/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/l41lI4bYmcsPJX9Go/giphy.gif',
    isTransparent: true,
    isGif: true,
    description: 'Robot AI cerdas animasi melayang yang selalu menyemangati fokusmu.',
    badge: '🤖 Animasi GIF AI',
    defaultScale: 1.12,
  },
  {
    id: 'focus_cat_animated',
    name: 'Neko Focus & Kopi',
    category: 'animated_gif',
    format: 'gif',
    url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
    isTransparent: true,
    isGif: true,
    description: 'Kucing lucu animasi yang menemani waktu kerja dan produktivitas.',
    badge: '🐱 Animasi GIF',
    defaultScale: 1.05,
  },
  {
    id: 'pixel_coder_animated',
    name: 'Pixel Dev & Hacker',
    category: 'pixel_retro',
    format: 'gif',
    url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
    isTransparent: true,
    isGif: true,
    description: 'Karakter programmer pixel art retro yang mengetik tanpa lelah.',
    badge: '👾 Pixel Retro GIF',
    defaultScale: 1.15,
  },
  {
    id: 'chibi_ninja_animated',
    name: 'Ninja Produktif Cilik',
    category: 'anime_chibi',
    format: 'gif',
    url: 'https://media.giphy.com/media/ule4akeXnY9FbVSpu8/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/ule4akeXnY9FbVSpu8/giphy.gif',
    isTransparent: true,
    isGif: true,
    description: 'Ninja gesit yang siap membantumu menuntaskan setiap target tugas.',
    badge: '🥷 Chibi GIF',
    defaultScale: 1.1,
  },
  {
    id: 'dancing_bot_animated',
    name: 'Dancing Astro Bot',
    category: 'cyber_bot',
    format: 'gif',
    url: 'https://media.giphy.com/media/mIZ9rPe2a23rq/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/mIZ9rPe2a23rq/giphy.gif',
    isTransparent: true,
    isGif: true,
    description: 'Robot astronot animasi berjoget merayakan target harian yang tercapai.',
    badge: '🚀 Space GIF',
    defaultScale: 1.1,
  },
  {
    id: 'studio_clay_framed',
    name: 'Ipan Studio Frame',
    category: '3d_clay',
    format: 'png',
    url: clayAvatarBg,
    previewUrl: clayAvatarBg,
    isTransparent: false,
    isGif: false,
    description: 'Foto Studio 3D Clay dalam bingkai neomorfik hangat.',
    badge: '🖼️ Studio Framed',
    defaultScale: 1.0,
  },
];

export const DEFAULT_CHARACTER_CONFIG: CharacterAvatarConfig = {
  url: clayAvatarCutout,
  presetId: 'ipan_clay_3d',
  name: 'Ipan 3D Clay (Transparan)',
  isTransparent: true,
  isGif: false,
  scale: 1.08,
  flipHorizontal: false,
  showPodium: true,
  animationStyle: 'float',
  glowColor: 'orange',
  mode: 'transparent_cutout',
};
