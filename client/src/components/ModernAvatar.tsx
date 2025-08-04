import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface ModernAvatarProps {
  src?: string | null;
  name?: string;
  email?: string;
  size?: number;
  className?: string;
  showOnlineStatus?: boolean;
}

enum AvatarStatus {
  Loading = 'loading',
  Success = 'success',
  Error = 'error',
  Fallback = 'fallback'
}

export function ModernAvatar({ 
  src, 
  name = "",
  email = "",
  size = 64,
  className = "",
  showOnlineStatus = false
}: ModernAvatarProps) {
  const [status, setStatus] = useState<AvatarStatus>(
    src ? AvatarStatus.Loading : AvatarStatus.Fallback
  );

  // Generate initials from name or email
  const initials = (() => {
    if (name) {
      return name
        .split(' ')
        .map(chunk => chunk.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  })();

  // Generate consistent background color from name/email
  const getBackgroundColor = (str: string = '') => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FECA57', '#FF9FF3', '#A8E6CF', '#FFD93D',
      '#6C5CE7', '#FD79A8', '#E17055', '#00B894'
    ];
    const hash = str.split('').reduce((acc, char) => char.charCodeAt(0) + acc, str.length);
    return colors[hash % colors.length];
  };

  // Test image loading
  useEffect(() => {
    console.log("ModernAvatar: src changed to:", src);
    if (src) {
      setStatus(AvatarStatus.Loading);
      
      const img = new Image();
      img.onload = () => {
        console.log("ModernAvatar: Image loaded successfully:", src);
        setStatus(AvatarStatus.Success);
      };
      img.onerror = (error) => {
        console.error("ModernAvatar: Image failed to load:", src, error);
        setStatus(AvatarStatus.Error);
      };
      
      // Add cache busting for immediate refreshes
      const cacheBustingSrc = src.includes('?') ? `${src}&t=${Date.now()}` : `${src}?t=${Date.now()}`;
      img.src = cacheBustingSrc;
      console.log("ModernAvatar: Testing image with cache busting:", cacheBustingSrc);
    } else {
      console.log("ModernAvatar: No src provided, using fallback");
      setStatus(AvatarStatus.Fallback);
    }
  }, [src]);

  const containerStyle = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
  };

  const baseClasses = `relative rounded-full overflow-hidden ${className}`;

  // Loading state with animated skeleton
  if (status === AvatarStatus.Loading) {
    return (
      <div 
        className={`${baseClasses} bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center`}
        style={containerStyle}
      >
        <div className="w-1/2 h-1/2 bg-gray-300 dark:bg-gray-600 rounded-full" />
        {showOnlineStatus && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white">
            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
          </div>
        )}
      </div>
    );
  }

  // Successfully loaded image
  if (status === AvatarStatus.Success && src) {
    return (
      <div className={baseClasses} style={containerStyle}>
        <img
          src={src}
          alt={name || email || 'User avatar'}
          className="w-full h-full object-cover"
          onError={() => {
            console.error('Avatar image failed to display:', src);
            setStatus(AvatarStatus.Error);
          }}
          onLoad={() => console.log('Avatar image displayed successfully:', src)}
        />
        {showOnlineStatus && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white">
            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
          </div>
        )}
      </div>
    );
  }

  // Fallback to initials or default icon
  return (
    <div
      className={`${baseClasses} flex items-center justify-center text-white font-semibold select-none`}
      style={{
        ...containerStyle,
        backgroundColor: initials !== 'U' ? getBackgroundColor(name || email) : '#6B7280',
        fontSize: size * 0.35,
      }}
    >
      {initials !== 'U' ? (
        initials
      ) : (
        <User size={size * 0.5} className="text-white opacity-80" />
      )}
      {showOnlineStatus && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white">
          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
        </div>
      )}
    </div>
  );
}

export default ModernAvatar;