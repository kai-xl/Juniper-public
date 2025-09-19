import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion } from 'framer-motion';

// Placeholder functions (we'll implement these properly later)
const searchSamples = () => console.log('Search samples');
const showAllSamples = () => console.log('Show all samples');
const filterByCategory = (category) => console.log('Filter by category:', category);
const showRecent = () => console.log('Show recent');
const showFavorites = () => console.log('Show favorites');
const setView = (view) => console.log('Set view:', view);
const previousSample = () => console.log('Previous sample');
const togglePlayback = () => console.log('Toggle playback');
const nextSample = () => console.log('Next sample');
const seekTo = (e) => console.log('Seek to:', e);
const toggleMute = () => console.log('Toggle mute');
const setVolume = (value) => console.log('Set volume:', value);

// Modern SVG Icons for the app
const Settings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);

const User = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const Tag = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
    <circle cx="7" cy="7" r="1.5"/>
  </svg>
);

// New sidebar icons
const LibraryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>
);

const DrumsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M21 8c0 1.66-4.03 3-9 3s-9-1.34-9-3"/>
    <path d="M3 8v8c0 1.66 4.03 3 9 3s9-1.34 9-3V8"/>
  </svg>
);

const BassIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.5 15.5L10 18l4.5-4.5"/>
    <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"/>
    <path d="M8 12h8"/>
    <path d="M12 8v8"/>
  </svg>
);

const MelodyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18"/>
    <path d="M8 7h12"/>
    <path d="M8 11h12"/>
    <path d="M8 15h12"/>
    <path d="M4 7v10"/>
  </svg>
);

const VocalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3z"/>
    <path d="M19 10v2a7 7 0 01-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const RecentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const FavoritesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
);

// Menu Bar Component (converted from your animated menu)
const MenuBar = ({ onNavigate }) => {
  const [isHomeHovered, setIsHomeHovered] = useState(false);
  const [isTagsHovered, setIsTagsHovered] = useState(false);
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);

  const itemVariants = {
    initial: { rotateX: 0, opacity: 1 },
    hover: { rotateX: -90, opacity: 0 },
  };

  const backVariants = {
    initial: { rotateX: 90, opacity: 0 },
    hover: { rotateX: 0, opacity: 1 },
  };

  const glowVariants = {
    initial: { opacity: 0, scale: 0.8 },
    hover: {
      opacity: 1,
      scale: 2,
      transition: {
        opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
        scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
      },
    },
  };

  const navGlowVariants = {
    initial: { opacity: 0 },
    hover: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const sharedTransition = {
    type: "spring",
    stiffness: 100,
    damping: 20,
    duration: 0.5,
  };

  const updatedMenuItems = [
    {
      icon: (
        <motion.div
          className="relative"
          animate={
            isHomeHovered
              ? {
                  y: [-1, -3, -2, -3, -1],
                  rotate: [-1, 2, -1, 3, -2, 1, 0],
                  scale: [1, 1.03, 1.02, 1.04, 1.01, 1],
                  transition: {
                    duration: 3.0,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                  },
                }
              : {
                  y: 0,
                  rotate: 0,
                  scale: 1,
                  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
                }
          }
        >
          <img
            src={isHomeHovered ? "../assets/juniperopen.png" : "../assets/juniper.png"}
            alt="Home"
            width="40"
            height="40"
            style={{ objectFit: 'contain' }}
          />
        </motion.div>
      ),
      label: "",
      page: "home",
      gradient: "radial-gradient(circle, rgba(67,56,202,0.15) 0%, rgba(55,48,163,0.06) 50%, rgba(49,46,129,0) 100%)",
      iconColor: "text-indigo-600",
    },
    {
      icon: (
        <motion.div
          animate={
            isTagsHovered
              ? {
                  rotate: [0, -20, 15, -25, 20, -15, 10, -8, 0],
                  scale: [1, 1.1, 0.95, 1.2, 0.9, 1.15, 1.05, 1.1, 1],
                  x: [0, -2, 3, -1, 2, -3, 1, 0],
                  y: [0, 1, -2, 2, -1, 3, -1, 0],
                  transition: {
                    duration: 2.5,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                  },
                }
              : {
                  rotate: 0,
                  scale: 1,
                  x: 0,
                  y: 0,
                  transition: { duration: 0.4, ease: "easeOut" },
                }
          }
        >
          <Tag />
        </motion.div>
      ),
      label: "Tags",
      page: "tags",
      gradient: "radial-gradient(circle, rgba(192,38,211,0.15) 0%, rgba(162,28,175,0.06) 50%, rgba(134,25,143,0) 100%)",
      iconColor: "text-fuchsia-600",
    },
    {
      icon: (
        <motion.div
          animate={
            isSettingsHovered
              ? {
                  rotate: 360,
                  transition: {
                    duration: 2.0,
                    ease: "linear",
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                  },
                }
              : {
                  rotate: 0,
                  transition: { duration: 0.4, ease: "easeOut" },
                }
          }
        >
          <Settings />
        </motion.div>
      ),
      label: "Settings",
      page: "settings",
      gradient: "radial-gradient(circle, rgba(109,40,217,0.15) 0%, rgba(91,33,182,0.06) 50%, rgba(76,29,149,0) 100%)",
      iconColor: "text-violet-600",
    },
    {
      icon: (
        <motion.div
          animate={
            isProfileHovered
              ? {
                  scale: [1, 1.15, 1.05, 1.2, 1.08, 1],
                  y: [-1, -4, -2, -5, -1, 0],
                  transition: {
                    duration: 1.6,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                  },
                }
              : {
                  scale: 1,
                  y: 0,
                  transition: { duration: 0.3, ease: "easeOut" },
                }
          }
        >
          <User />
        </motion.div>
      ),
      label: "Profile",
      page: "profile",
      gradient: "radial-gradient(circle, rgba(147,51,234,0.15) 0%, rgba(126,34,206,0.06) 50%, rgba(107,33,168,0) 100%)",
      iconColor: "text-purple-700",
    },
  ];

  return (
    <motion.nav
      style={{
        padding: '6px',
        borderRadius: '12px',
        background: 'transparent',
        position: 'relative',
        overflow: 'hidden'
      }}
      initial="initial"
    >
      <ul style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 10 }}>
        {updatedMenuItems.map((item, index) => (
          <motion.li key={item.label || "home"} style={{ position: 'relative' }}>
            <motion.div
              style={{
                display: 'block',
                borderRadius: '12px',
                overflow: 'visible',
                position: 'relative',
                perspective: '600px'
              }}
              whileHover="hover"
              initial="initial"
              onHoverStart={() => {
                if (index === 0) setIsHomeHovered(true);
                if (index === 1) setIsTagsHovered(true);
                if (index === 2) setIsSettingsHovered(true);
                if (index === 3) setIsProfileHovered(true);
              }}
              onHoverEnd={() => {
                if (index === 0) setIsHomeHovered(false);
                if (index === 1) setIsTagsHovered(false);
                if (index === 2) setIsSettingsHovered(false);
                if (index === 3) setIsProfileHovered(false);
              }}
            >
              <motion.div
                style={{
                  position: 'absolute',
                  inset: '-8px',
                  zIndex: 0,
                  pointerEvents: 'none',
                  background: item.gradient,
                  opacity: 0,
                  borderRadius: '16px',
                }}
                variants={glowVariants}
              />
              <motion.div
                onClick={() => onNavigate && onNavigate(item.page)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  position: 'relative',
                  zIndex: 10,
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.8)',
                  borderRadius: '12px',
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center bottom',
                  cursor: 'pointer'
                }}
                variants={itemVariants}
                transition={sharedTransition}
              >
                <span style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {item.icon}
                </span>
                {item.label && <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.label}</span>}
              </motion.div>
              <motion.div
                onClick={() => onNavigate && onNavigate(item.page)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  position: 'absolute',
                  inset: 0,
                  zIndex: 10,
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.8)',
                  borderRadius: '12px',
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center top',
                  rotateX: 90,
                  cursor: 'pointer'
                }}
                variants={backVariants}
                transition={sharedTransition}
              >
                <span style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {item.icon}
                </span>
                {item.label && <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.label}</span>}
              </motion.div>
            </motion.div>
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  );
};

// Halftone Waves Component (containerized version)
const HalftoneWaves = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let time = 0;
    
    // Mouse tracking for container parallax
    const handleMouseMove = (e) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      
      // Calculate parallax offset for the entire container
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const offsetX = (e.clientX - centerX) / centerX; // -1 to 1
      const offsetY = (e.clientY - centerY) / centerY; // -1 to 1
      
      const parallaxStrength = 40; // Adjust this value to control movement intensity
      const moveX = offsetX * parallaxStrength;
      const moveY = offsetY * parallaxStrength;
      
      // Apply transform to the entire container
      container.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const resizeCanvas = () => {
      // Use viewport dimensions for fixed background
      const centerPanel = document.querySelector('.center-panel');
      if (centerPanel) {
        canvas.width = centerPanel.clientWidth;
        canvas.height = centerPanel.clientHeight;
      } else {
        // Fallback to window dimensions
        canvas.width = window.innerWidth * 0.75; // Approximate center panel width
        canvas.height = window.innerHeight - 120; // Subtract header/toolbar height
      }
    };

    const drawHalftoneWave = () => {
      const gridSize = 30;
      const rows = Math.ceil(canvas.height / gridSize);
      const cols = Math.ceil(canvas.width / gridSize);

      const circleRadius = Math.min(canvas.width, canvas.height) * 0.25;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const centerX = x * gridSize;
          const centerY = y * gridSize;
          
          const distanceFromCenter = Math.sqrt(
            Math.pow(centerX - canvas.width / 2, 2) + Math.pow(centerY - canvas.height / 2, 2),
          );

          if (distanceFromCenter > circleRadius) continue;

          const maxDistance = circleRadius;
          const normalizedDistance = distanceFromCenter / maxDistance;

          const waveOffset = Math.sin(normalizedDistance * 8 - time) * 0.3 + 0.5;
          const size = gridSize * waveOffset * 0.5;

          const purpleAmount = normalizedDistance * 1.0;
          const baseWhite = 250;
          const red = Math.floor(baseWhite * (1 - purpleAmount) + 160 * purpleAmount);
          const green = Math.floor(baseWhite * (1 - purpleAmount) + 40 * purpleAmount);
          const blue = Math.floor(baseWhite * (1 - purpleAmount) + 180 * purpleAmount);

          const edgeFade = 1 - (distanceFromCenter / circleRadius) * 0.3;
          const opacity = waveOffset * 0.06 * edgeFade;

          ctx.beginPath();
          ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
          ctx.fill();
        }
      }
    };

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawHalftoneWave();

      time += 0.03;
      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        top: '0', // Cover full screen
        left: '0',
        width: '100%',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        transition: 'transform 0.1s ease-out' // Smooth parallax movement
      }}
    >
      <canvas 
        ref={canvasRef} 
        className="halftone-canvas"
        style={{
          width: '100%',
          height: '100%',
          background: '#000000',
          display: 'block'
        }}
      />
    </div>
  );
};

// Window Control Components - Simplified version matching working startup screen
const WindowControls = () => {
  return (
    <div className="window-controls">
      <button 
        className="window-btn minimize" 
        onClick={() => window.electronAPI?.windowMinimize?.()}
      />
      <button 
        className="window-btn maximize" 
        onClick={() => window.electronAPI?.windowMaximize?.()}
      />
      <button 
        className="window-btn close" 
        onClick={() => window.electronAPI?.windowClose?.()}
      />
    </div>
  );
};

// Center Content Component
const CenterContent = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      top: '55%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      zIndex: 10,
      pointerEvents: 'auto'
    }}>
      <motion.img
        src={isHovered ? "../assets/juniperopen.png" : "../assets/juniper.png"}
        alt="Juniper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={
          isHovered
            ? {
                y: [-2, -8, -6, -10, -4, -8, -2],
                rotate: [-0.5, 1, -0.8, 1.2, -0.6, 0.8, 0],
                scale: [1, 1.02, 1.01, 1.03, 1.01, 1.02, 1],
                transition: {
                  duration: 2.0,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                },
              }
            : {
                y: 0,
                rotate: 0,
                scale: 1,
                transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
              }
        }
        style={{
          width: '120px',
          height: '120px',
          objectFit: 'contain',
          marginBottom: '8px',
          cursor: 'pointer',
          filter: 'brightness(1.1)'
        }}
      />
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: '24px',
        fontFamily: "'Space Grotesk', sans-serif",
        letterSpacing: '0.02em'
      }}>
        Scan your library with Juniper
      </h2>
      <motion.button
        className="scan-samples-btn"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.98 }}
        style={{
          padding: '14px 28px',
          background: 'linear-gradient(135deg, rgba(168, 139, 250, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)',
          border: '1px solid rgba(168, 139, 250, 0.3)',
          borderRadius: '12px',
          color: 'rgba(255, 255, 255, 0.95)',
          fontSize: '1rem',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: '0.01em',
          boxShadow: '0 8px 25px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)'
        }}
        onClick={() => console.log('Scan samples clicked')}
      >
        Scan Samples
      </motion.button>
    </div>
  );
};

// Tag Creation Modal Component
const TagCreationModal = ({ isOpen, onClose, onCreateTag }) => {
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#8B5CF6');
  const [tagIcon, setTagIcon] = useState('tag');
  const [colorMode, setColorMode] = useState('presets'); // 'presets' or 'wheel'
  
  const colorOptions = [
    '#8B5CF6', // Purple
    '#EF4444', // Red
    '#10B981', // Green
    '#3B82F6', // Blue
    '#F59E0B', // Yellow
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#84CC16', // Lime
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#8B5A2B', // Brown
    '#6B7280'  // Gray
  ];

  const defaultIcons = [
    { id: 'tag', name: 'Tag', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
        <circle cx="7" cy="7" r="1.5"/>
      </svg>
    )},
    { id: 'music', name: 'Music', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
    )},
    { id: 'drum', name: 'Drums', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 8c0 1.66-4.03 3-9 3s-9-1.34-9-3"/>
        <path d="M3 8v8c0 1.66 4.03 3 9 3s9-1.34 9-3V8"/>
      </svg>
    )},
    { id: 'wave', name: 'Wave', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12c.5-1.5 1.5-3 3-3s2.5 1.5 3 3 1.5 3 3 3 2.5-1.5 3-3 1.5-3 3-3 2.5 1.5 3 3"/>
      </svg>
    )},
    { id: 'mic', name: 'Microphone', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3z"/>
        <path d="M19 10v2a7 7 0 01-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
    )},
    { id: 'headphones', name: 'Headphones', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
      </svg>
    )},
    { id: 'star', name: 'Star', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
      </svg>
    )},
    { id: 'heart', name: 'Heart', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    )},
    { id: 'zap', name: 'Lightning', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
      </svg>
    )},
    { id: 'folder', name: 'Folder', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
    )},
    { id: 'circle', name: 'Circle', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
      </svg>
    )},
    { id: 'square', name: 'Square', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      </svg>
    )}
  ];

  const handleCreate = () => {
    if (tagName.trim() && tagName.trim().length <= 35) {
      onCreateTag({ name: tagName.trim(), color: tagColor, icon: tagIcon });
      setTagName('');
      setTagColor('#8B5CF6');
      setTagIcon('tag');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(5px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          background: '#1A1A1A',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
          color: 'white',
          fontFamily: "'Space Grotesk', sans-serif"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', textAlign: 'center', fontWeight: '300' }}>
          Create New Tag
        </h2>

        {/* Tag Preview */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-block',
              background: `${tagColor}20`,
              border: `1px solid ${tagColor}50`,
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              minWidth: '150px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <div style={{ width: '16px', height: '16px', color: tagColor }}>
                {defaultIcons.find(icon => icon.id === tagIcon)?.svg}
              </div>
              <h3 style={{ fontSize: '1.1rem', margin: 0, color: tagColor }}>
                {tagName || 'Tag Name'}
              </h3>
            </div>
            <p style={{ opacity: 0.7, fontSize: '0.8rem', margin: 0 }}>0 samples</p>
          </div>
        </div>

        {/* Tag Name Input */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              Tag Name
            </label>
            <span style={{ 
              fontSize: '0.8rem', 
              opacity: 0.6,
              color: tagName.length > 35 ? '#EF4444' : 'inherit'
            }}>
              {tagName.length}/35
            </span>
          </div>
          <input
            type="text"
            value={tagName}
            onChange={(e) => {
              // Strictly enforce character limit
              const newValue = e.target.value.slice(0, 35);
              setTagName(newValue);
            }}
            placeholder="Enter tag name..."
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${tagName.length > 35 ? '#EF4444' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '8px',
              color: 'white',
              fontSize: '1rem',
              fontFamily: "'Space Grotesk', sans-serif"
            }}
            autoFocus
            maxLength={35}
          />
        </div>

        {/* Icon Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
            Tag Icon
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '0.8rem',
            maxHeight: '150px',
            overflowY: 'auto',
            padding: '0.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px'
          }}>
            {defaultIcons.map((icon) => (
              <motion.div
                key={icon.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: tagIcon === icon.id ? `${tagColor}30` : 'rgba(255, 255, 255, 0.05)',
                  border: tagIcon === icon.id ? `2px solid ${tagColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: tagIcon === icon.id ? tagColor : 'rgba(255, 255, 255, 0.7)'
                }}
                onClick={() => setTagIcon(icon.id)}
                title={icon.name}
              >
                <div style={{ width: '20px', height: '20px' }}>
                  {icon.svg}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              Tag Color
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setColorMode('presets')}
                style={{
                  padding: '4px 8px',
                  background: colorMode === 'presets' ? tagColor : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Presets
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setColorMode('wheel')}
                style={{
                  padding: '4px 8px',
                  background: colorMode === 'wheel' ? tagColor : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Wheel
              </motion.button>
            </div>
          </div>

          {colorMode === 'presets' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '0.8rem'
            }}>
              {colorOptions.map((color) => (
                <motion.div
                  key={color}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: color,
                    cursor: 'pointer',
                    border: tagColor === color ? '3px solid white' : '2px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => setTagColor(color)}
                >
                  {tagColor === color && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <input
                type="color"
                value={tagColor}
                onChange={(e) => setTagColor(e.target.value)}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'none'
                }}
              />
              <input
                type="text"
                value={tagColor}
                onChange={(e) => {
                  const color = e.target.value;
                  if (/^#[0-9A-F]{6}$/i.test(color)) {
                    setTagColor(color);
                  }
                }}
                placeholder="#8B5CF6"
                style={{
                  width: '120px',
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  fontFamily: "'JetBrains Mono', monospace"
                }}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif"
            }}
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreate}
            disabled={!tagName.trim() || tagName.trim().length > 35}
            style={{
              padding: '12px 24px',
              background: tagColor,
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: (tagName.trim() && tagName.trim().length <= 35) ? 'pointer' : 'not-allowed',
              opacity: (tagName.trim() && tagName.trim().length <= 35) ? 1 : 0.5,
              fontFamily: "'Space Grotesk', sans-serif"
            }}
          >
            Create Tag
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Tags Page Component
const TagsPage = ({ onNavigate }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tags, setTags] = useState([
    { name: 'Drums', color: '#EF4444', icon: 'drum' },
    { name: 'Bass', color: '#10B981', icon: 'wave' },
    { name: 'Melody', color: '#3B82F6', icon: 'music' },
    { name: 'Vocals', color: '#EC4899', icon: 'mic' },
    { name: 'FX', color: '#6366F1', icon: 'zap' },
    { name: 'Loops', color: '#F59E0B', icon: 'circle' },
    { name: 'Chords', color: '#8B5CF6', icon: 'music' },
    { name: 'Arps', color: '#06B6D4', icon: 'wave' },
    { name: 'Leads', color: '#F97316', icon: 'star' },
    { name: 'Pads', color: '#84CC16', icon: 'headphones' },
    { name: 'Percussion', color: '#8B5A2B', icon: 'drum' },
    { name: 'Ambient', color: '#6B7280', icon: 'heart' }
  ]);

  // Default icons for reference (same as in modal)
  const defaultIcons = [
    { id: 'tag', name: 'Tag', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
        <circle cx="7" cy="7" r="1.5"/>
      </svg>
    )},
    { id: 'music', name: 'Music', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
    )},
    { id: 'drum', name: 'Drums', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 8c0 1.66-4.03 3-9 3s-9-1.34-9-3"/>
        <path d="M3 8v8c0 1.66 4.03 3 9 3s9-1.34 9-3V8"/>
      </svg>
    )},
    { id: 'wave', name: 'Wave', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12c.5-1.5 1.5-3 3-3s2.5 1.5 3 3 1.5 3 3 3 2.5-1.5 3-3 1.5-3 3-3 2.5 1.5 3 3"/>
      </svg>
    )},
    { id: 'mic', name: 'Microphone', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3z"/>
        <path d="M19 10v2a7 7 0 01-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
    )},
    { id: 'headphones', name: 'Headphones', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
      </svg>
    )},
    { id: 'star', name: 'Star', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
      </svg>
    )},
    { id: 'heart', name: 'Heart', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    )},
    { id: 'zap', name: 'Lightning', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
      </svg>
    )},
    { id: 'folder', name: 'Folder', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
    )},
    { id: 'circle', name: 'Circle', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
      </svg>
    )},
    { id: 'square', name: 'Square', svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      </svg>
    )}
  ];

  const handleCreateTag = (newTag) => {
    setTags([...tags, newTag]);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100vh',
      background: '#000000',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      color: 'white',
      fontFamily: "'Space Grotesk', sans-serif"
    }}>
      {/* Top Toolbar */}
      <div className="top-toolbar">
        <div className="toolbar-left">
          <MenuBar onNavigate={onNavigate} />
        </div>
        
        <div className="toolbar-center">
          <div className="search-container">
            <input 
              type="text" 
              id="searchInput" 
              placeholder="Search tags..." 
              className="search-input" 
            />
            <button className="search-btn" onClick={() => searchSamples()}>🔍</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem',
        paddingTop: '3rem',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '300' }}>Tags</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '0' }}>Manage your sample tags and categories</p>
        </motion.div>

        {/* Tags List Container */}
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          justifyContent: 'center',
          padding: '0 2rem'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            justifyContent: 'center',
            alignItems: 'flex-start',
            width: '100%'
          }}>
            {tags.map((tag, index) => {
              // Calculate dynamic width based on tag name length, ensuring no overflow
              const baseWidth = 140; // Minimum width
              const charWidth = 8; // Approximate width per character
              const maxContainerWidth = 1200 - 64; // Container max width minus padding
              const maxTagWidth = Math.min(280, Math.floor(maxContainerWidth / 3) - 24); // Ensure at least 3 fit per row
              const dynamicWidth = Math.max(baseWidth, Math.min(baseWidth + (tag.name.length * charWidth), maxTagWidth));
              
              return (
                <motion.div
                  key={tag.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  style={{
                    background: `${tag.color}20`,
                    border: `1px solid ${tag.color}50`,
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    minHeight: '120px',
                    width: `${dynamicWidth}px`,
                    maxWidth: `${maxTagWidth}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    backgroundColor: `${tag.color}30`,
                    transition: { duration: 0.15 }
                  }}
                  transition={{ duration: 0.1 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '20px', height: '20px', color: tag.color }}>
                      {defaultIcons.find(icon => icon.id === tag.icon)?.svg}
                    </div>
                    <h3 style={{ 
                      fontSize: '1.2rem', 
                      margin: 0,
                      color: tag.color,
                      wordBreak: 'break-word',
                      hyphens: 'auto',
                      lineHeight: '1.3'
                    }}>
                      {tag.name}
                    </h3>
                  </div>
                  <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>0 samples</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        display: 'flex',
        gap: '1rem',
        zIndex: 20
      }}>
        {/* Settings Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: '48px',
            height: '48px',
            background: 'rgba(42, 42, 42, 0.9)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            color: 'rgba(139, 92, 246, 0.8)'
          }}
          onClick={() => console.log('Tag settings clicked')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </motion.button>

        {/* Add Tag Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.9))',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            color: 'white',
            boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)'
          }}
          onClick={() => setShowCreateModal(true)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </motion.button>
      </div>

      {/* Tag Creation Modal */}
      <TagCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateTag={handleCreateTag}
      />
    </div>
  );
};

// Settings Page Component
const SettingsPage = ({ onNavigate }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100vh',
      background: '#000000',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      color: 'white',
      fontFamily: "'Space Grotesk', sans-serif"
    }}>
      {/* Top Toolbar */}
      <div className="top-toolbar">
        <div className="toolbar-left">
          <MenuBar onNavigate={onNavigate} />
        </div>
        
        <div className="toolbar-center">
          <div className="search-container">
            <input 
              type="text" 
              id="searchInput" 
              placeholder="Search settings..." 
              className="search-input" 
            />
            <button className="search-btn" onClick={() => searchSamples()}>🔍</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', maxWidth: '600px' }}
        >
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '300' }}>Settings</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '3rem' }}>Configure your Juniper experience</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left' }}>
            {[
              { title: 'Audio Settings', desc: 'Configure audio output and quality' },
              { title: 'Library Location', desc: 'Change your sample library folder' },
              { title: 'AI Analysis', desc: 'Enable or disable AI-powered categorization' },
              { title: 'Theme', desc: 'Choose your preferred color scheme' },
              { title: 'Shortcuts', desc: 'Customize keyboard shortcuts' }
            ].map((setting, index) => (
              <motion.div
                key={setting.title}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  cursor: 'pointer'
                }}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
              >
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{setting.title}</h3>
                <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>{setting.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Profile Page Component
const ProfilePage = ({ onNavigate }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100vh',
      background: '#000000',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      color: 'white',
      fontFamily: "'Space Grotesk', sans-serif"
    }}>
      {/* Top Toolbar */}
      <div className="top-toolbar">
        <div className="toolbar-left">
          <MenuBar onNavigate={onNavigate} />
        </div>
        
        <div className="toolbar-center">
          <div className="search-container">
            <input 
              type="text" 
              id="searchInput" 
              placeholder="Search profile..." 
              className="search-input" 
            />
            <button className="search-btn" onClick={() => searchSamples()}>🔍</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(168, 139, 250, 0.3))',
              border: '3px solid rgba(139, 92, 246, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              fontSize: '3rem'
            }}
            whileHover={{ scale: 1.05 }}
          >
            👤
          </motion.div>
          
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: '300' }}>User Profile</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '3rem' }}>Manage your account and preferences</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>
            {[
              { label: 'Username', value: 'Producer123' },
              { label: 'Email', value: 'user@example.com' },
              { label: 'Samples Organized', value: '0' },
              { label: 'Tags Created', value: '0' },
              { label: 'Member Since', value: new Date().toLocaleDateString() }
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <span style={{ opacity: 0.8 }}>{item.label}</span>
                <span style={{ fontWeight: '500' }}>{item.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [samples, setSamples] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'tags':
        return <TagsPage onNavigate={setCurrentPage} />;
      case 'settings':
        return <SettingsPage onNavigate={setCurrentPage} />;
      case 'profile':
        return <ProfilePage onNavigate={setCurrentPage} />;
      case 'home':
      default:
        return (
          <>
            <HalftoneWaves />
            <CenterContent />
            
            <div className="app-container">
              {/* Top Toolbar */}
              <div className="top-toolbar">
                <div className="toolbar-left">
                  <MenuBar onNavigate={setCurrentPage} />
                </div>
                
                <div className="toolbar-center">
                  <div className="search-container">
                    <input 
                      type="text" 
                      id="searchInput" 
                      placeholder="Search your samples..." 
                      className="search-input" 
                    />
                    <button className="search-btn" onClick={() => searchSamples()}>🔍</button>
                  </div>
                </div>
                
              </div>

              {/* Main Content Area */}
              <div className="main-content">
                {/* Left Panel */}
                <div className="left-panel">
                  <div className="sidebar-section">
                    <h3>Library</h3>
                    <div className="sidebar-item active" onClick={() => showAllSamples()} data-tooltip="All Samples">
                      <span className="icon"><LibraryIcon /></span>
                      <span>All Samples</span>
                      <span className="count" id="totalCount">0</span>
                    </div>
                  </div>

                  <div className="sidebar-section">
                    <h3>Categories</h3>
                    <div className="sidebar-item" onClick={() => filterByCategory('drums')} data-tooltip="Drums">
                      <span className="icon"><DrumsIcon /></span>
                      <span>Drums</span>
                      <span className="count">0</span>
                    </div>
                    <div className="sidebar-item" onClick={() => filterByCategory('bass')} data-tooltip="Bass">
                      <span className="icon"><BassIcon /></span>
                      <span>Bass</span>
                      <span className="count">0</span>
                    </div>
                    <div className="sidebar-item" onClick={() => filterByCategory('melody')} data-tooltip="Melody">
                      <span className="icon"><MelodyIcon /></span>
                      <span>Melody</span>
                      <span className="count">0</span>
                    </div>
                    <div className="sidebar-item" onClick={() => filterByCategory('vocal')} data-tooltip="Vocals">
                      <span className="icon"><VocalIcon /></span>
                      <span>Vocals</span>
                      <span className="count">0</span>
                    </div>
                  </div>

                  <div className="sidebar-section">
                    <h3>Recent</h3>
                    <div className="sidebar-item" onClick={() => showRecent()} data-tooltip="Recently Added">
                      <span className="icon"><RecentIcon /></span>
                      <span>Recently Added</span>
                    </div>
                    <div className="sidebar-item" onClick={() => showFavorites()} data-tooltip="Favorites">
                      <span className="icon"><FavoritesIcon /></span>
                      <span>Favorites</span>
                    </div>
                  </div>
                </div>

                {/* Center Panel */}
                <div className="center-panel">
                  <div className="content-header">
                    <h2 id="contentTitle">All Samples</h2>
                    <div className="view-controls">
                      <button className="view-btn active" onClick={() => setView('grid')} title="Grid View">⊞</button>
                      <button className="view-btn" onClick={() => setView('list')} title="List View">☰</button>
                    </div>
                  </div>

                  <div className="sample-container">
                    <div className="sample-grid" id="sampleGrid">
                      {/* Sample content will appear here */}
                    </div>
                  </div>
                </div>
              </div>

              {/* Audio Player Bar */}
              <div className="player-bar" id="playerBar" style={{ display: 'none' }}>
                <div className="player-info">
                  <div className="player-artwork">
                    <div className="waveform-mini"></div>
                  </div>
                  <div className="player-details">
                    <div className="player-title" id="playerTitle">Sample Name</div>
                    <div className="player-meta" id="playerMeta">Artist • 120 BPM • 4/4</div>
                  </div>
                </div>

                <div className="player-controls">
                  <button className="player-btn" onClick={() => previousSample()}>⏮</button>
                  <button className="player-btn play-btn" id="playBtn" onClick={() => togglePlayback()}>▶</button>
                  <button className="player-btn" onClick={() => nextSample()}>⏭</button>
                </div>

                <div className="player-progress">
                  <span className="time" id="currentTime">0:00</span>
                  <div className="progress-bar" onClick={(e) => seekTo(e)}>
                    <div className="progress-fill" id="progressFill"></div>
                  </div>
                  <span className="time" id="totalTime">0:00</span>
                </div>

                <div className="player-volume">
                  <button className="player-btn" onClick={() => toggleMute()}>🔊</button>
                  <input type="range" className="volume-slider" id="volumeSlider" min="0" max="100" defaultValue="50" onInput={(e) => setVolume(e.target.value)} />
                </div>
              </div>

              {/* Loading Overlay */}
              <div className="loading-overlay" id="loadingOverlay" style={{ display: 'none' }}>
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  <div className="loading-text">Processing samples...</div>
                  <div className="loading-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" id="loadingProgress"></div>
                    </div>
                    <div className="progress-text" id="progressText">0 / 0 files</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="dark-theme">
      <WindowControls />
      {renderCurrentPage()}
    </div>
  );
};

// Initialize React App
console.log('Renderer.jsx loaded!');

// Debug available APIs
console.log('🔍 Checking electronAPI...');
console.log('window.electronAPI exists:', !!window.electronAPI);
if (window.electronAPI) {
  console.log('Available electronAPI methods:', Object.keys(window.electronAPI));
  console.log('Window control methods available:', {
    windowMinimize: typeof window.electronAPI.windowMinimize,
    windowMaximize: typeof window.electronAPI.windowMaximize,
    windowClose: typeof window.electronAPI.windowClose
  });
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing React...');
  const rootElement = document.getElementById('root');
  console.log('Root element found:', rootElement);
  
  if (rootElement) {
    console.log('Creating React root...');
    const root = createRoot(rootElement);
    console.log('Rendering App...');
    root.render(<App />);
    console.log('React app rendered!');
  } else {
    console.error('Root element not found! Make sure your HTML has a div with id="root"');
  }
});

// Also try immediate initialization if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('DOM already ready, initializing React immediately...');
  setTimeout(() => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      const root = createRoot(rootElement);
      root.render(<App />);
    }
  }, 100);
}