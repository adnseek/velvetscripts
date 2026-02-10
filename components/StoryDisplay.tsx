"use client";

import { BookOpen, Video } from "lucide-react";
import CamgirlCard from "./CamgirlCard";

interface StoryDisplayProps {
  story: string;
}

export default function StoryDisplay({ story }: StoryDisplayProps) {
  const paragraphs = story.split("\n\n").filter((p) => p.trim());
  
  const camgirls = [
    {
      name: "Luna",
      imageUrl: "https://via.placeholder.com/300x400/FF69B4/FFFFFF?text=Luna",
      category: "Romantic",
      affiliateLink: "#",
      online: true,
    },
    {
      name: "Scarlett",
      imageUrl: "https://via.placeholder.com/300x400/DC143C/FFFFFF?text=Scarlett",
      category: "Passionate",
      affiliateLink: "#",
      online: true,
    },
    {
      name: "Jade",
      imageUrl: "https://via.placeholder.com/300x400/FF1493/FFFFFF?text=Jade",
      category: "Seductive",
      affiliateLink: "#",
      online: false,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Your Story
          </h2>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {paragraphs.map((paragraph, index) => {
            const shouldShowCamgirls = index === Math.floor(paragraphs.length / 2);
            
            return (
              <div key={index}>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  {paragraph}
                </p>
                
                {shouldShowCamgirls && (
                  <div className="my-12 p-6 bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-950/20 dark:to-red-950/20 rounded-xl border-2 border-pink-200 dark:border-pink-800">
                    <div className="flex items-center gap-3 mb-6">
                      <Video className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        Matching Live Cams
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {camgirls.map((camgirl, idx) => (
                        <CamgirlCard key={idx} {...camgirl} />
                      ))}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
                      These models perfectly match the theme of your story
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Video className="w-6 h-6" />
          <h3 className="text-2xl font-bold">Want more live action?</h3>
        </div>
        <p className="mb-6 text-white/90">
          Discover more models that match your preferences
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {camgirls.map((camgirl, idx) => (
            <CamgirlCard key={idx} {...camgirl} variant="compact" />
          ))}
        </div>
      </div>
    </div>
  );
}
