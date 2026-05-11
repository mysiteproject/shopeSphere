'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

interface RatingStarsProps {
  rating: number;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (rating: number) => void;
}

const sizeMap = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };

export default function RatingStars({ rating, interactive = false, size = 'md', onChange }: RatingStarsProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            className={`${sizeMap[size]} transition-colors ${
              star <= (hover || rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-slate-300 dark:text-slate-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
