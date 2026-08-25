import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  Sparkles, 
  RotateCw, 
  Sliders, 
  Check, 
  Trash2, 
  Play, 
  Layers, 
  Image as ImageIcon,
  Zap,
  Eye,
  RefreshCw,
  Maximize2
} from 'lucide-react';
import { CharacterAvatarConfig } from '../../types';
import { CHARACTER_PRESETS, CharacterPreset, DEFAULT_CHARACTER_CONFIG } from '../../data/characterPresets';

interface CharacterCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterConfig: CharacterAvatarConfig;
  onSaveCharacterConfig: (config: CharacterAvatarConfig) => void;
  darkMode: boolean;
}

export const CharacterCustomizerModal: React.FC<CharacterCustomizerModalProps> = ({
  isOpen,
  onClose,
  characterConfig,
  onSaveCharacterConfig,
  darkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url' | 'settings'>('upload');
  const [presetCategory, setPresetCategory] = useState<string>('all');
  
  // Staging state
  const [currentUrl, setCurrentUrl] = useState<string>(characterConfig.url || DEFAULT_CHARACTER_CONFIG.url);
  const [presetId, setPresetId] = useState<string>(characterConfig.presetId || DEFAULT_CHARACTER_CONFIG.presetId);
  const [charName, setCharName] = useState<string>(characterConfig.name || DEFAULT_CHARACTER_CONFIG.name);
  const [isTransparent, setIsTransparent] = useState<boolean>(characterConfig.isTransparent ?? true);
  const [isGif, setIsGif] = useState<boolean>(characterConfig.isGif ?? false);
  const [scale, setScale] = useState<number>(characterConfig.scale ?? 1.08);
  const [flipHorizontal, setFlipHorizontal] = useState<boolean>(characterConfig.flipHorizontal ?? false);
  const [showPodium, setShowPodium] = useState<boolean>(characterConfig.showPodium ?? true);
  const [animationStyle, setAnimationStyle] = useState<'float' | 'bounce' | 'pulse' | 'gentle' | 'none'>(
    characterConfig.animationStyle || 'float'
  );
  const [glowColor, setGlowColor] = useState<'orange' | 'emerald' | 'cyan' | 'purple' | 'amber' | 'none'>(
    characterConfig.glowColor || 'orange'
  );
  const [mode, setMode] = useState<'transparent_cutout' | 'studio_frame'>(
    characterConfig.mode || 'transparent_cutout'
  );

  // Custom URL input state
  const [inputUrl, setInputUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [previewBg, setPreviewBg] = useState<'checker' | 'dark' | 'light'>('checker');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle local file upload (GIF, PNG, WebP, SVG)
  const handleFileUpload = (file: File) => {
    if (!file) return;

    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    const isFileGif = fileType.includes('gif') || fileName.endsWith('.gif');
    const isFilePng = fileType.includes('png') || fileName.endsWith('.png') || fileType.includes('webp') || fileType.includes('svg');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setCurrentUrl(result);
        setPresetId('custom_upload');
        setCharName(file.name.replace(/\.[^/.]+$/, ''));
        setIsGif(isFileGif);
        setIsTransparent(isFilePng || isFileGif);
        setMode('transparent_cutout');
        setUrlError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setUrlError('Silakan masukkan link URL gambar atau animasi GIF');
      return;
    }

    try {
      new URL(trimmed);
      const isUrlGif = trimmed.toLowerCase().includes('.gif') || trimmed.toLowerCase().includes('giphy') || trimmed.toLowerCase().includes('tenor');
      setCurrentUrl(trimmed);
      setPresetId('custom_url');
      setCharName('Karakter Kustom Web');
      setIsGif(isUrlGif);
      setIsTransparent(true);
      setMode('transparent_cutout');
      setUrlError('');
      setInputUrl('');
    } catch {
      setUrlError('URL tidak valid. Pastikan diawali dengan https://');
    }
  };

  const handleSelectPreset = (preset: CharacterPreset) => {
    setCurrentUrl(preset.url);
    setPresetId(preset.id);
    setCharName(preset.name);
    setIsTransparent(preset.isTransparent);
    setIsGif(preset.isGif);
    setScale(preset.defaultScale);
    if (!preset.isTransparent) {
      setMode('studio_frame');
    } else {
      setMode('transparent_cutout');
    }
  };

  const handleResetToDefault = () => {
    setCurrentUrl(DEFAULT_CHARACTER_CONFIG.url);
    setPresetId(DEFAULT_CHARACTER_CONFIG.presetId);
    setCharName(DEFAULT_CHARACTER_CONFIG.name);
    setIsTransparent(DEFAULT_CHARACTER_CONFIG.isTransparent);
    setIsGif(DEFAULT_CHARACTER_CONFIG.isGif);
    setScale(DEFAULT_CHARACTER_CONFIG.scale);
    setFlipHorizontal(DEFAULT_CHARACTER_CONFIG.flipHorizontal);
    setShowPodium(DEFAULT_CHARACTER_CONFIG.showPodium);
    setAnimationStyle(DEFAULT_CHARACTER_CONFIG.animationStyle);
    setGlowColor(DEFAULT_CHARACTER_CONFIG.glowColor);
    setMode(DEFAULT_CHARACTER_CONFIG.mode);
  };

  const handleSave = () => {
    const newConfig: CharacterAvatarConfig = {
      url: currentUrl,
      presetId,
      name: charName,
      isTransparent,
      isGif,
      scale,
      flipHorizontal,
      showPodium,
      animationStyle,
      glowColor,
      mode,
    };
    onSaveCharacterConfig(newConfig);
    onClose();
  };

  // Filter presets
  const filteredPresets = CHARACTER_PRESETS.filter(p => {
    if (presetCategory === 'all') return true;
    if (presetCategory === 'gif') return p.isGif;
    if (presetCategory === '3d') return p.category === '3d_clay';
    if (presetCategory === 'retro') return p.category === 'pixel_retro' || p.category === 'anime_chibi';
    return true;
  });

  // Glow color styles
  const glowStyles = {
    orange: 'bg-orange-500/25',
    emerald: 'bg-emerald-500/25',
    cyan: 'bg-cyan-500/25',
    purple: 'bg-purple-500/25',
    amber: 'bg-amber-500/25',
    none: 'hidden',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl clay-modal flex flex-col max-h-[92vh] sm:max-h-[88vh] rounded-[24px] sm:rounded-[36px] overflow-hidden my-auto shadow-2xl transition-all border border-white/40 dark:border-white/10">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E8DACB] dark:border-white/10 flex items-center justify-between flex-shrink-0 bg-[#FAF3EC]/80 dark:bg-[#1E1A17]/80 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(234,88,12,0.3)] border border-white/60 flex-shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-extrabold text-[#3E2F26] dark:text-[#FAF4EE]">
                  Kustomisasi Karakter & Foto Pendamping
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider border border-orange-300 dark:border-orange-800">
                  GIF & No Background
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#8A796E] dark:text-[#BDB0A4] font-medium line-clamp-1">
                Ganti karakter dengan foto transparan (PNG), animasi bergerak (GIF), atau upload karyamu sendiri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="clay-button p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-[#8A796E] dark:text-[#D4C7BC] flex-shrink-0 active:scale-95"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Main Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6">
          
          {/* LEFT COLUMN: LIVE 3D PREVIEW STAGE (Col span 5) */}
          <div className="lg:col-span-5 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A796E] dark:text-[#A8988D] flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-orange-500" />
                <span>Live Preview 3D</span>
              </span>

              {/* Preview Background Switcher */}
              <div className="flex items-center space-x-1 bg-black/5 dark:bg-white/5 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewBg('checker')}
                  className={`px-2 py-0.5 rounded transition ${previewBg === 'checker' ? 'bg-white dark:bg-zinc-800 shadow-sm text-orange-600 font-extrabold' : 'text-[#8A796E]'}`}
                  title="Pola Kotak Transparan"
                >
                  Transparan
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg('dark')}
                  className={`px-2 py-0.5 rounded transition ${previewBg === 'dark' ? 'bg-white dark:bg-zinc-800 shadow-sm text-orange-600 font-extrabold' : 'text-[#8A796E]'}`}
                  title="Latar Gelap"
                >
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg('light')}
                  className={`px-2 py-0.5 rounded transition ${previewBg === 'light' ? 'bg-white dark:bg-zinc-800 shadow-sm text-orange-600 font-extrabold' : 'text-[#8A796E]'}`}
                  title="Latar Terang"
                >
                  Light
                </button>
              </div>
            </div>

            {/* Stage Box */}
            <div className={`relative w-full aspect-square rounded-3xl overflow-hidden border-2 border-dashed border-[#DAC9BA] dark:border-white/20 flex items-center justify-center p-4 shadow-inner transition-colors duration-300 ${
              previewBg === 'checker'
                ? 'bg-[repeating-conic-gradient(#E8DCCD_0%_25%,#FDF7F2_0%_50%)] dark:bg-[repeating-conic-gradient(#1A1614_0%_25%,#26201C_0%_50%)] [background-size:24px_24px]'
                : previewBg === 'dark'
                ? 'bg-[#151210]'
                : 'bg-[#FBF4ED]'
            }`}>
              
              {/* Soft Ambient Aura Behind Character */}
              {glowColor !== 'none' && (
                <div className={`absolute w-44 h-44 rounded-full blur-2xl pointer-events-none transition-all ${glowStyles[glowColor]}`}></div>
              )}

              {/* 3D Clay Podium Base */}
              {showPodium && mode === 'transparent_cutout' && (
                <div className={`absolute bottom-3 w-[78%] h-12 rounded-[28px] border-2 transition-all ${
                  darkMode 
                    ? 'bg-gradient-to-b from-[#352B25] to-[#1F1916] border-white/10 shadow-[0_12px_24px_rgba(0,0,0,0.6)]' 
                    : 'bg-gradient-to-b from-[#F2E0D0] to-[#E5CCA8] border-white/90 shadow-[0_10px_20px_rgba(180,140,110,0.3)]'
                }`}>
                  <div className="absolute inset-x-3 top-1 h-1 rounded-full bg-white/40 blur-xs"></div>
                </div>
              )}

              {/* Character Visual */}
              <div 
                className={`relative z-10 w-full h-full flex items-center justify-center transition-transform duration-300 ${
                  animationStyle === 'float' ? 'animate-float' :
                  animationStyle === 'bounce' ? 'animate-bounce [animation-duration:2.5s]' :
                  animationStyle === 'pulse' ? 'animate-pulse' :
                  animationStyle === 'gentle' ? 'animate-float [animation-duration:6s]' : ''
                }`}
                style={{
                  transform: `${flipHorizontal ? 'scaleX(-1)' : 'scaleX(1)'}`,
                }}
              >
                {mode === 'transparent_cutout' ? (
                  <img
                    src={currentUrl}
                    alt="Character Preview"
                    referrerPolicy="no-referrer"
                    className="max-w-[90%] max-h-[90%] object-contain object-bottom filter drop-shadow-[0_16px_20px_rgba(0,0,0,0.32)] transition-all"
                    style={{
                      transform: `scale(${scale})`,
                    }}
                  />
                ) : (
                  <div className="w-[85%] h-[85%] rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-zinc-900">
                    <img
                      src={currentUrl}
                      alt="Character Framed Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Format Badge Overlay */}
              <div className="absolute top-3 left-3 flex items-center space-x-1.5 z-20">
                <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[9.5px] font-black uppercase tracking-wider border border-white/20 shadow-md flex items-center space-x-1">
                  <span>{isGif ? '🎬 GIF Animasi' : '🖼️ PNG Transparan'}</span>
                </span>
              </div>

              <div className="absolute top-3 right-3 z-20">
                <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[9.5px] font-extrabold shadow-sm">
                  {Math.round(scale * 100)}%
                </span>
              </div>
            </div>

            {/* Character Info Pill */}
            <div className="p-3 rounded-2xl clay-card-sm flex items-center justify-between text-xs font-semibold">
              <div className="min-w-0">
                <span className="text-[10px] text-[#8A796E] dark:text-[#A8988D] uppercase font-bold block">Karakter Terpilih</span>
                <span className="font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] truncate block">{charName}</span>
              </div>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-[10px] text-orange-600 dark:text-orange-400 font-extrabold hover:underline flex items-center space-x-1 flex-shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: TABS & INPUT CONTROLS (Col span 7) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            
            {/* Top Navigation Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#E8DACB] dark:border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`py-2 px-1 text-xs font-extrabold rounded-xl transition flex flex-col sm:flex-row items-center justify-center sm:space-x-1.5 ${
                  activeTab === 'upload'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'text-[#8A796E] dark:text-[#BDB0A4] hover:text-[#3E2F26] dark:hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Upload File</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`py-2 px-1 text-xs font-extrabold rounded-xl transition flex flex-col sm:flex-row items-center justify-center sm:space-x-1.5 ${
                  activeTab === 'presets'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'text-[#8A796E] dark:text-[#BDB0A4] hover:text-[#3E2F26] dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Galeri Preset</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`py-2 px-1 text-xs font-extrabold rounded-xl transition flex flex-col sm:flex-row items-center justify-center sm:space-x-1.5 ${
                  activeTab === 'url'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'text-[#8A796E] dark:text-[#BDB0A4] hover:text-[#3E2F26] dark:hover:text-white'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Link URL / GIF</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 text-xs font-extrabold rounded-xl transition flex flex-col sm:flex-row items-center justify-center sm:space-x-1.5 ${
                  activeTab === 'settings'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'text-[#8A796E] dark:text-[#BDB0A4] hover:text-[#3E2F26] dark:hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Atur Efek 3D</span>
              </button>
            </div>

            {/* TAB 1: UPLOAD LOCAL FILE (GIF, PNG, SVG) */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                
                {/* Drag and drop upload box */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative p-6 sm:p-8 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-orange-500 bg-orange-500/10 scale-[1.01]'
                      : 'border-[#D6C4B4] dark:border-white/20 hover:border-orange-500 bg-[#FBF3EB]/70 dark:bg-[#1E1A17]/70'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/gif, image/png, image/webp, image/jpeg, image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-lg border border-white/60 mb-3">
                    <Upload className="w-7 h-7" />
                  </div>

                  <h4 className="text-sm font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] mb-1">
                    Klik untuk Pilih File atau Tarik ke Sini
                  </h4>
                  <p className="text-xs text-[#8A796E] dark:text-[#BDB0A4] max-w-sm font-medium">
                    Mendukung format <strong>GIF Animasi Bergerak</strong>, <strong>PNG Transparan (Tanpa Background)</strong>, WebP, dan SVG.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-[10px] font-black">
                      🎬 .GIF Animasi
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                      ✨ .PNG No-Background
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-black">
                      ⚡ Instan Offline
                    </span>
                  </div>
                </div>

                {/* Helpful tips box */}
                <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-xs text-[#5A453A] dark:text-[#D4C7BC] font-medium flex items-start space-x-2.5">
                  <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-extrabold">Tips Foto Transparan:</strong> Gunakan gambar PNG yang sudah dihapus latarnya (cutout) atau GIF animasi dengan alpha-channel agar karakter dapat mengapung bebas di atas podium 3D.
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: PRESET GALLERY */}
            {activeTab === 'presets' && (
              <div className="space-y-3">
                
                {/* Filter tags */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
                  {[
                    { id: 'all', label: 'Semua Preset' },
                    { id: 'gif', label: '🎬 Animasi GIF' },
                    { id: '3d', label: '✨ 3D Clay Transparan' },
                    { id: 'retro', label: '👾 Pixel & Chibi' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setPresetCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition ${
                        presetCategory === cat.id
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'bg-black/5 dark:bg-white/5 text-[#8A796E] dark:text-[#A8988D] hover:bg-black/10'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Presets Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 sm:max-h-72 overflow-y-auto pr-1">
                  {filteredPresets.map((preset) => {
                    const isSelected = presetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-2.5 rounded-2xl text-left flex flex-col justify-between transition-all relative overflow-hidden border-2 ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500/10 shadow-md ring-2 ring-orange-500/30'
                            : 'border-transparent clay-card-sm hover:border-orange-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md z-20">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}

                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-[repeating-conic-gradient(#E8DCCD_0%_25%,#FDF7F2_0%_50%)] dark:bg-[repeating-conic-gradient(#1A1614_0%_25%,#26201C_0%_50%)] [background-size:12px_12px] p-1.5 flex items-center justify-center mb-2">
                          <img
                            src={preset.previewUrl}
                            alt={preset.name}
                            referrerPolicy="no-referrer"
                            className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                          />
                        </div>

                        <div>
                          <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider block truncate">
                            {preset.badge}
                          </span>
                          <h5 className="text-xs font-black text-[#3E2F26] dark:text-[#FAF4EE] truncate">
                            {preset.name}
                          </h5>
                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>
            )}

            {/* TAB 3: CUSTOM URL INPUT */}
            {activeTab === 'url' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] block">
                    Tempel Link URL Gambar atau GIF dari Internet
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <LinkIcon className="w-4 h-4 absolute left-3.5 text-[#8A796E] pointer-events-none" />
                      <input
                        type="url"
                        value={inputUrl}
                        onChange={(e) => {
                          setInputUrl(e.target.value);
                          setUrlError('');
                        }}
                        placeholder="https://media.giphy.com/media/.../giphy.gif"
                        className="clay-input w-full pl-10 pr-3 py-2.5 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="clay-button-primary px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap active:scale-95 shadow-md"
                    >
                      Terapkan
                    </button>
                  </div>
                  {urlError && (
                    <p className="text-[11px] font-bold text-rose-500">{urlError}</p>
                  )}
                </div>

                <div className="p-4 rounded-2xl clay-card-sm space-y-2">
                  <h5 className="text-xs font-extrabold text-[#3E2F26] dark:text-[#FAF4EE]">
                    Contoh Sumber GIF & Foto Transparan:
                  </h5>
                  <ul className="text-xs text-[#8A796E] dark:text-[#BDB0A4] space-y-1 list-disc list-inside font-medium">
                    <li><strong>Giphy / Tenor:</strong> Klik kanan pada GIF transparan → Copy Image Address.</li>
                    <li><strong>Pinterest / Imgur / Discord CDN:</strong> Gunakan link langsung berakhiran <code>.gif</code> atau <code>.png</code>.</li>
                    <li><strong>Google Image:</strong> Filter gambar dengan tipe "Transparan" (Transparent PNG).</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 4: 3D EFFECTS & DISPLAY SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                
                {/* Mode Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A796E] dark:text-[#A8988D] block">
                    Mode Tampilan Karakter
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMode('transparent_cutout')}
                      className={`p-2.5 rounded-2xl text-left flex items-center space-x-2.5 transition border-2 ${
                        mode === 'transparent_cutout'
                          ? 'border-orange-500 bg-orange-500/10 text-orange-600 font-black shadow-sm'
                          : 'border-transparent clay-card-sm text-[#8A796E]'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-extrabold">3D Cutout Melayang</div>
                        <div className="text-[10px] font-medium opacity-80">Tanpa background kotak</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode('studio_frame')}
                      className={`p-2.5 rounded-2xl text-left flex items-center space-x-2.5 transition border-2 ${
                        mode === 'studio_frame'
                          ? 'border-orange-500 bg-orange-500/10 text-orange-600 font-black shadow-sm'
                          : 'border-transparent clay-card-sm text-[#8A796E]'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-extrabold">Studio Frame</div>
                        <div className="text-[10px] font-medium opacity-80">Bingkai neomorfik studio</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Scale Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-[#3E2F26] dark:text-[#FAF4EE]">Ukuran Karakter (Scale)</span>
                    <span className="font-black text-orange-600 dark:text-orange-400">{Math.round(scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.5"
                    step="0.02"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>

                {/* Animation Style */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A796E] dark:text-[#A8988D] block">
                    Gaya Animasi Melayang
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                    {[
                      { id: 'float', label: '🌊 Float 3D' },
                      { id: 'bounce', label: '🏀 Bouncing' },
                      { id: 'pulse', label: '💓 Pulse' },
                      { id: 'gentle', label: '🍃 Lembut' },
                      { id: 'none', label: '🛑 Statis' },
                    ].map((anim) => (
                      <button
                        key={anim.id}
                        type="button"
                        onClick={() => setAnimationStyle(anim.id as any)}
                        className={`p-2 rounded-xl transition text-center ${
                          animationStyle === anim.id
                            ? 'bg-orange-500 text-white font-extrabold shadow-sm'
                            : 'clay-card-sm text-[#8A796E] hover:bg-black/10'
                        }`}
                      >
                        {anim.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles: Flip & Show Podium */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setFlipHorizontal(!flipHorizontal)}
                    className={`p-2.5 rounded-2xl flex items-center justify-between text-xs font-extrabold transition border ${
                      flipHorizontal ? 'border-orange-500 bg-orange-500/10 text-orange-600' : 'clay-card-sm text-[#8A796E]'
                    }`}
                  >
                    <span>Cermin (Hadap Balik)</span>
                    <RotateCw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPodium(!showPodium)}
                    className={`p-2.5 rounded-2xl flex items-center justify-between text-xs font-extrabold transition border ${
                      showPodium ? 'border-orange-500 bg-orange-500/10 text-orange-600' : 'clay-card-sm text-[#8A796E]'
                    }`}
                  >
                    <span>Meja Panggung 3D</span>
                    <Layers className="w-4 h-4" />
                  </button>
                </div>

                {/* Glow Aura Colors */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A796E] dark:text-[#A8988D] block">
                    Aura Cahaya Latar (Glow)
                  </label>
                  <div className="flex items-center space-x-2">
                    {[
                      { id: 'orange', color: 'bg-orange-500' },
                      { id: 'emerald', color: 'bg-emerald-500' },
                      { id: 'cyan', color: 'bg-cyan-400' },
                      { id: 'purple', color: 'bg-purple-500' },
                      { id: 'amber', color: 'bg-amber-400' },
                      { id: 'none', color: 'bg-zinc-400' },
                    ].map((glow) => (
                      <button
                        key={glow.id}
                        type="button"
                        onClick={() => setGlowColor(glow.id as any)}
                        className={`w-7 h-7 rounded-full ${glow.color} transition-all flex items-center justify-center shadow-sm ${
                          glowColor === glow.id ? 'ring-4 ring-orange-500/40 scale-110' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={`Glow: ${glow.id}`}
                      >
                        {glowColor === glow.id && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-[#E8DACB] dark:border-white/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#FAF3EC]/80 dark:bg-[#1E1A17]/80 backdrop-blur-md flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-[#8A796E] hover:text-[#3E2F26] dark:hover:text-white bg-black/5 dark:bg-white/5 transition active:scale-95 text-center"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="clay-button-primary px-6 py-2.5 rounded-2xl text-xs font-extrabold text-white flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition"
          >
            <Check className="w-4 h-4" />
            <span>Terapkan Karakter Baru</span>
          </button>
        </div>

      </div>
    </div>
  );
};
