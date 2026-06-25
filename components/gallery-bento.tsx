"use client";

import Link from "next/link";
import { BentoGrid, BentoItem } from "@/components/ui/bento-grid";
import { InteractiveCard } from "@/components/ui/interactive-card";
import { PosterImage } from "@/components/poster-image";
import type { Title } from "@/lib/data";

export function GalleryBento({ titles }: { titles: Title[] }) {
  return (
    <BentoGrid>
      {titles.slice(0, 7).map((title, index) => (
        <BentoItem
          key={title.id}
          colSpan={index === 0 ? 2 : 1}
          rowSpan={index === 0 ? 2 : 1}
        >
          <InteractiveCard tiltDegree={6} className="h-full">
            <Link href={`/watch/${title.slug}`} className="block h-full">
              <div className="relative h-full w-full">
                <PosterImage
                  src={title.poster}
                  alt={title.title}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="font-bold text-white">{title.title}</h3>
                  <p className="text-sm text-gray-300">
                    {title.year} &middot; {title.genres[0]}
                  </p>
                </div>
              </div>
            </Link>
          </InteractiveCard>
        </BentoItem>
      ))}
    </BentoGrid>
  );
}
