'use client';

import Link from 'next/link';

interface AssetCardProps {
  id: string;
  name: string;
  game: string;
  gameIcon: string;
  price: string;
  image: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical';
  attributes?: Record<string, string | number | boolean>;
  seller?: string;
  href?: string;
}

export function AssetCard({
  id,
  name,
  game,
  gameIcon,
  price,
  image,
  rarity,
  attributes,
  seller,
  href,
}: AssetCardProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common':
        return 'text-gray-400';
      case 'Rare':
        return 'text-blue-400';
      case 'Epic':
        return 'text-purple-400';
      case 'Legendary':
        return 'text-orange-400';
      case 'Mythical':
        return 'text-pink-400';
      default:
        return 'text-gray-400';
    }
  };

  const cardHref = href || `/asset/${id}`;

  return (
    <Link
      href={cardHref}
      className="group bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1"
    >
      {/* Asset Image */}
      <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-8xl relative">
        {image}
        <div className="absolute top-3 right-3">
          <div className="text-2xl">{gameIcon}</div>
        </div>
      </div>

      {/* Asset Info */}
      <div className="p-4">
        {/* Name and Rarity */}
        <div className="mb-3">
          <h3 className="text-white font-semibold mb-1 group-hover:text-purple-400 transition-colors line-clamp-1">
            {name}
          </h3>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{game}</span>
            <span className={`font-medium ${getRarityColor(rarity)}`}>
              {rarity}
            </span>
          </div>
        </div>

        {/* Attributes */}
        {attributes && Object.keys(attributes).length > 0 && (
          <div className="mb-3 flex gap-2 flex-wrap">
            {Object.entries(attributes).slice(0, 3).map(([key, value]) => (
              <div key={key} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                {key}: <span className="text-white">{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price and Seller */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div>
            <div className="text-gray-500 text-xs mb-1">Price</div>
            <div className="text-orange-400 font-bold">{price} BTC</div>
          </div>
          {seller && (
            <div className="text-right">
              <div className="text-gray-500 text-xs mb-1">Seller</div>
              <div className="text-gray-400 text-xs font-mono">{seller}</div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
