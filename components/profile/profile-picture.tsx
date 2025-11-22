/**
 * Profile Picture Component
 * 
 * Displays user's profile picture or falls back to initials.
 * Supports displaying images from URLs or showing initials when no image is available.
 * 
 * Task: T050 [US1]
 */

import React from 'react';
import { View, Image, StyleSheet, ImageStyle, ViewStyle } from 'react-native';
import { Text } from '@/components/ui/text';

export interface ProfilePictureProps {
  /**
   * URL of the profile picture image
   */
  imageUrl?: string | null;
  /**
   * Initials to display when no image is available
   * Example: "JD" for "John Doe"
   */
  initials?: string | null;
  /**
   * Size of the profile picture in pixels
   * @default 64
   */
  size?: number;
  /**
   * Additional className for styling
   */
  className?: string;
}

/**
 * Profile Picture Component
 * 
 * Displays a circular profile picture with fallback to initials.
 * The component automatically handles image loading errors and falls back to initials.
 */
export function ProfilePicture({
  imageUrl,
  initials,
  size = 64,
  className,
}: ProfilePictureProps) {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb', // gray-200
    justifyContent: 'center',
    alignItems: 'center',
  };

  const imageStyle: ImageStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const textStyle = {
    fontSize: size * 0.4, // 40% of size
    fontWeight: '600' as const,
    color: '#6b7280', // gray-500
  };

  const showImage = imageUrl && !imageError;
  const showInitials = !showImage && initials;

  // Reset error state when imageUrl changes
  React.useEffect(() => {
    if (imageUrl) {
      setImageError(false);
      setImageLoading(true);
    }
  }, [imageUrl]);

  return (
    <View style={containerStyle} className={className}>
      {showImage && (
        <Image
          source={{ uri: imageUrl }}
          style={imageStyle}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
          resizeMode="cover"
        />
      )}
      {showInitials && (
        <Text style={textStyle} className="font-semibold text-gray-500">
          {initials.toUpperCase()}
        </Text>
      )}
      {!showImage && !showInitials && (
        <Text style={textStyle} className="font-semibold text-gray-400">
          ?
        </Text>
      )}
    </View>
  );
}

