"use client";

import { Video, Circle, ExternalLink } from "lucide-react";

interface CamgirlCardProps {
  name: string;
  imageUrl: string;
  category: string;
  affiliateLink: string;
  online?: boolean;
  variant?: "default" | "compact";
}

export default function CamgirlCard({ 
  name, 
  imageUrl, 
  category, 
  affiliateLink,
  online = true,
  variant = "default" 
}: CamgirlCardProps) {
  return (
    <a
      href={affiliateLink}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 block"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
          <Circle
            className={`w-2 h-2 ${
              online ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400"
            }`}
          />
          <span className="text-xs text-white font-medium">
            {online ? "Online" : "Offline"}
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Video className="w-4 h-4" />
              Watch Live
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {variant === "default" && (
        <div className="p-4">
          <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
            {name}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{category}</p>
        </div>
      )}
    </a>
  );
}
