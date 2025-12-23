// src/components/common/RecommendationSection.tsx
"use client";

import { Recommendation } from "@/types";
import { SongCard } from "./SongCard";
import { Star } from "lucide-react";

interface RecommendationSectionProps {
  title: string;
  subtitle?: string;
  recommendations: Recommendation[];
}

export function RecommendationSection({
  title,
  subtitle,
  recommendations,
}: RecommendationSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
        {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {recommendations.map((rec) => (
          <div key={rec.song.id} className="relative">
            <SongCard song={rec.song} />
            <div className="absolute top-2 left-2 flex items-center space-x-1 bg-black/60 rounded px-2 py-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-white font-medium">
                {(rec.similarityScore * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
