import React from 'react';

interface AnimatedStickerProps {
  type: 'cat' | 'dog' | 'star' | 'heart' | 'book' | 'rocket' | 'sparkle' | 'cloud' | 'sun' | 'moon' | 'music' | 'flower';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AnimatedSticker: React.FC<AnimatedStickerProps> = ({ type, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const getSticker = () => {
    switch (type) {
      case 'cat':
        return (
          <svg viewBox="0 0 100 100" className={`${sizeClasses[size]} ${className}`}>
            <defs>
              <linearGradient id="catGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFB6C1" />
                <stop offset="100%" stopColor="#FF69B4" />
              </linearGradient>
            </defs>
            <g className="animate-float">
              {/* Cat face */}
              <circle cx="50" cy="55" r="35" fill="url(#catGradient)" />
              {/* Ears */}
              <polygon points="20,30 30,55 10,50" fill="url(#catGradient)" />
              <polygon points="80,30 70,55 90,50" fill="url(#catGradient)" />
              <polygon points="22,32 28,50 14,47" fill="#FFE4E1" />
              <polygon points="78,32 72,50 86,47" fill="#FFE4E1" />
              {/* Eyes */}
              <ellipse cx="38" cy="50" rx="8" ry="10" fill="#333" className="animate-pulse" />
              <ellipse cx="62" cy="50" rx="8" ry="10" fill="#333" className="animate-pulse" />
              <circle cx="35" cy="47" r="3" fill="white" />
              <circle cx="59" cy="47" r="3" fill="white" />
              {/* Nose */}
              <polygon points="50,60 46,55 54,55" fill="#FF6B8A" />
              {/* Mouth */}
              <path d="M 43 65 Q 50 72 57 65" stroke="#333" strokeWidth="2" fill="none" />
              {/* Whiskers */}
              <line x1="20" y1="58" x2="35" y2="60" stroke="#333" strokeWidth="1.5" />
              <line x1="20" y1="65" x2="35" y2="65" stroke="#333" strokeWidth="1.5" />
              <line x1="65" y1="60" x2="80" y2="58" stroke="#333" strokeWidth="1.5" />
              <line x1="65" y1="65" x2="80" y2="65" stroke="#333" strokeWidth="1.5" />
              {/* Blush */}
              <ellipse cx="30" cy="65" rx="6" ry="4" fill="#FFB6C1" opacity="0.6" />
              <ellipse cx="70" cy="65" rx="6" ry="4" fill="#FFB6C1" opacity="0.6" />
            </g>
          </svg>
        );
      
      case 'star':
        return (
          <svg viewBox="0 0 100 100" className={`${sizeClasses[size]} ${className}`}>
            <defs>
              <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FFA500" />
              </linearGradient>
              <filter id="starGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <g className="animate-pulse" filter="url(#starGlow)">
              <polygon 
                points="50,10 61,40 95,40 68,60 79,90 50,72 21,90 32,60 5,40 39,40" 
                fill="url(#starGradient)"
              />
              {/* Kawaii face */}
              <circle cx="40" cy="45" r="4" fill="#333" />
              <circle cx="60" cy="45" r="4" fill="#333" />
              <circle cx="38" cy="43" r="1.5" fill="white" />
              <circle cx="58" cy="43" r="1.5" fill="white" />
              <path d="M 45 55 Q 50 60 55 55" stroke="#333" strokeWidth="2" fill="none" />
              <ellipse cx="35" cy="52" rx="4" ry="2" fill="#FFB6C1" opacity="0.5" />
              <ellipse cx="65" cy="52" rx="4" ry="2" fill="#FFB6C1" opacity="0.5" />
            </g>
          </svg>
        );
      
      case 'heart':
        return (
          <svg viewBox="0 0 100 100" className={`${sizeClasses[size]} ${className}`}>
            <defs>
              <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B8A" />
                <stop offset="100%" stopColor="#FF1493" />
              </linearGradient>
            </defs>
            <g className="animate-bounce">
              <path 
                d="M 50 85 C 20 60 10 40 25 25 C 40 10 50 25 50 35 C 50 25 60 10 75 25 C 90 40 80 60 50 85" 
                fill="url(#heartGradient)"
              />
              {/* Sparkles */}
              <circle cx="30" cy="35" r="2" fill="white" className="animate-ping" />
              <circle cx="70" cy="35" r="2" fill="white" className="animate-ping" style={{ animationDelay: '0.5s' }} />
            </g>
          </svg>
        );
      
      case 'book':
        return (
          <svg viewBox="0 0 100 100" className={`${sizeClasses[size]} ${className}`}>
            <defs>
              <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
            <g className="animate-float">
              {/* Book body */}
              <rect x="15" y="20" width="70" height="60" rx="3" fill="url(#bookGradient)" />
              <rect x="18" y="23" width="64" height="54" rx="2" fill="#F3E8FF" />
              {/* Spine */}
              <rect x="15" y="20" width="8" height="60" fill="#7C3AED" />
              {/* Pages */}
              <line x1="30" y1="35" x2="75" y2="35" stroke="#DDD6FE" strokeWidth="2" />
              <line x1="30" y1="45" x2="75" y2="45" stroke="#DDD6FE" strokeWidth="2" />
              <line x1="30" y1="55" x2="60" y2="55" stroke="#DDD6FE" strokeWidth="2" />
              {/* Kawaii face */}
              <circle cx="45" cy="50" r="3" fill="#333" />
              <circle cx="60" cy="50" r="3" fill="#333" />
              <path d="M 48 60 Q 52.5 65 57 60" stroke="#333" strokeWidth="1.5" fill="none" />
              {/* Sparkles */}
              <text x="70" y="30" fontSize="10" className="animate-pulse">✨</text>
            </g>
          </svg>
        );
      
      case 'rocket':
        return (
          <svg viewBox="0 0 100 100" className={`${sizeClasses[size]} ${className}`}>
            <defs>
              <linearGradient id="rocketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <linearGradient id="flameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FCD34D" />
                <stop offset="50%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
            <g className="animate-float">
              {/* Rocket body */}
              <ellipse cx="50" cy="45" rx="18" ry="35" fill="url(#rocketGradient)" />
              {/* Window */}
              <circle cx="50" cy="40" r="10" fill="#E0F2FE" stroke="#1E40AF" strokeWidth="2" />
              {/* Kawaii face in window */}
              <circle cx="46" cy="38" r="2" fill="#333" />
              <circle cx="54" cy="38" r="2" fill="#333" />
              <path d="M 47 44 Q 50 47 53 44" stroke="#333" strokeWidth="1.5" fill="none" />
              {/* Fins */}
              <polygon points="32,70 40,55 40,75" fill="#1E40AF" />
              <polygon points="68,70 60,55 60,75" fill="#1E40AF" />
              {/* Flame */}
              <ellipse cx="50" cy="85" rx="8" ry="12" fill="url(#flameGradient)" className="animate-pulse" />
              {/* Stars around */}
              <text x="15" y="25" fontSize="8" className="animate-pulse">⭐</text>
              <text x="75" y="35" fontSize="8" className="animate-pulse" style={{ animationDelay: '0.3s' }}>⭐</text>
            </g>
          </svg>
        );
      
      case 'cloud':
        return (
          <svg viewBox="0 0 100 100" className={`${sizeClasses[size]} ${className}`}>
            <defs>
              <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E0E7FF" />
              </linearGradient>
            </defs>
            <g className="animate-float">
              <circle cx="35" cy="55" r="20" fill="url(#cloudGradient)" />
              <circle cx="55" cy="50" r="25" fill="url(#cloudGradient)" />
              <circle cx="75" cy="55" r="18" fill="url(#cloudGradient)" />
              <circle cx="45" cy="60" r="18" fill="url(#cloudGradient)" />
              <circle cx="65" cy="58" r="20" fill="url(#cloudGradient)" />
              {/* Kawaii face */}
              <circle cx="48" cy="52" r="3" fill="#333" />
              <circle cx="62" cy="52" r="3" fill="#333" />
              <path d="M 52 60 Q 55 64 58 60" stroke="#333" strokeWidth="2" fill="none" />
              <ellipse cx="42" cy="58" rx="4" ry="2" fill="#FFB6C1" opacity="0.5" />
              <ellipse cx="68" cy="58" rx="4" ry="2" fill="#FFB6C1" opacity="0.5" />
            </g>
          </svg>
        );

      case 'sparkle':
        return (
          <svg viewBox="0 0 100 100" className={`${sizeClasses[size]} ${className}`}>
            <defs>
              <linearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="50%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            <g className="animate-pulse">
              <polygon points="50,5 55,40 90,50 55,60 50,95 45,60 10,50 45,40" fill="url(#sparkleGradient)" />
              <polygon points="50,20 52,45 75,50 52,55 50,80 48,55 25,50 48,45" fill="#FFFBEB" />
            </g>
          </svg>
        );

      case 'music':
        return (
          <svg viewBox="0 0 100 100" className={`${sizeClasses[size]} ${className}`}>
            <defs>
              <linearGradient id="musicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <g className="animate-float">
              {/* Note body */}
              <ellipse cx="30" cy="70" rx="15" ry="12" fill="url(#musicGradient)" />
              <ellipse cx="70" cy="60" rx="15" ry="12" fill="url(#musicGradient)" />
              {/* Stems */}
              <rect x="43" y="20" width="4" height="50" fill="url(#musicGradient)" />
              <rect x="83" y="15" width="4" height="45" fill="url(#musicGradient)" />
              {/* Beam */}
              <polygon points="43,20 87,15 87,22 43,27" fill="url(#musicGradient)" />
              {/* Sparkles */}
              <circle cx="55" cy="30" r="3" fill="#FDE68A" className="animate-ping" />
              <circle cx="75" cy="40" r="2" fill="#FDE68A" className="animate-ping" style={{ animationDelay: '0.3s' }} />
            </g>
          </svg>
        );

      case 'flower':
        return (
          <svg viewBox="0 0 100 100" className={`${sizeClasses[size]} ${className}`}>
            <defs>
              <linearGradient id="petalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDA4AF" />
                <stop offset="100%" stopColor="#FB7185" />
              </linearGradient>
            </defs>
            <g className="animate-float">
              {/* Petals */}
              <ellipse cx="50" cy="30" rx="12" ry="18" fill="url(#petalGradient)" />
              <ellipse cx="30" cy="45" rx="12" ry="18" fill="url(#petalGradient)" transform="rotate(-60 30 45)" />
              <ellipse cx="70" cy="45" rx="12" ry="18" fill="url(#petalGradient)" transform="rotate(60 70 45)" />
              <ellipse cx="35" cy="65" rx="12" ry="18" fill="url(#petalGradient)" transform="rotate(-120 35 65)" />
              <ellipse cx="65" cy="65" rx="12" ry="18" fill="url(#petalGradient)" transform="rotate(120 65 65)" />
              {/* Center */}
              <circle cx="50" cy="50" r="15" fill="#FBBF24" />
              {/* Kawaii face */}
              <circle cx="45" cy="48" r="2.5" fill="#333" />
              <circle cx="55" cy="48" r="2.5" fill="#333" />
              <path d="M 47 54 Q 50 57 53 54" stroke="#333" strokeWidth="1.5" fill="none" />
            </g>
          </svg>
        );

      default:
        return null;
    }
  };

  return getSticker();
};

export default AnimatedSticker;
