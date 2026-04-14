import { useState } from 'react';

interface ProductImageProps {
  src?: string;
  alt: string;
  emoji?: string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  backgroundColor?: string;
}

const DEFAULT_EMOJI = '🥬';

export const ProductImage = ({
  src,
  alt,
  emoji,
  className = '',
  imageClassName = 'h-full w-full object-cover',
  fallbackClassName = 'flex h-full w-full items-center justify-center text-5xl select-none',
  backgroundColor,
}: ProductImageProps) => {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(src) && !hasError;

  return (
    <div className={className} style={{ backgroundColor }}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className={imageClassName}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className={fallbackClassName}>{emoji || DEFAULT_EMOJI}</div>
      )}
    </div>
  );
};

