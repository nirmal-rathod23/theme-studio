'use client';

import { useRef, useState } from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import styles from './EditorSidebar.module.css';

export default function LogoExtractor() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const { tokens, updateColor } = useThemeStore();
  const activeMode = tokens.mode === 'dark' ? 'dark' : 'light';

  const extractColors = (imgElement: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let r = 0, g = 0, b = 0, count = 0;
    
    // Sample every 10th pixel
    for (let i = 0; i < data.length; i += 40) {
      if (data[i + 3] > 128) {
        if (!(data[i] > 240 && data[i+1] > 240 && data[i+2] > 240) && 
            !(data[i] < 15 && data[i+1] < 15 && data[i+2] < 15)) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
      }
    }

    if (count > 0) {
      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);
      
      const hex = '#' + [r, g, b].map(x => {
        const h = x.toString(16);
        return h.length === 1 ? '0' + h : h;
      }).join('');
      
      updateColor(activeMode, 'primary', hex);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        setLogoSrc(src);
        
        const img = new Image();
        img.onload = () => extractColors(img);
        img.src = src;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.section}>
      <h3>Logo Color Extraction</h3>
      <div className={styles.controlGroup}>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileUpload} 
        />
        <button 
          className={styles.exportBtn} 
          onClick={() => fileInputRef.current?.click()}
        >
          Upload Logo
        </button>
      </div>
      {logoSrc && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <img src={logoSrc} alt="Logo" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: 'var(--radius-global)' }} />
        </div>
      )}
    </div>
  );
}
