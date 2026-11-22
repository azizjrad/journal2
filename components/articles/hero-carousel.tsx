"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/context/language-context";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Calendar } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import type { EmblaPluginType } from "embla-carousel";

// Type declaration for embla-carousel-wheel-gestures
declare module "embla-carousel-wheel-gestures" {
  export default function WheelGesturesPlugin(): EmblaPluginType;
}

import WheelGesturesPlugin from "embla-carousel-wheel-gestures";

interface Article {
  id: number | string;
  title_en: string;
  title_ar: string;
  excerpt_en: string;
  excerpt_ar: string;
  image_url: string;
  published_at: string;
  category_name_en?: string;
  category_name_ar?: string;
  category_slug?: string;
}

interface HeroCarouselProps {
  articles: Article[];
}

export function HeroCarousel({ articles }: HeroCarouselProps) {
  const { language } = useLanguage();
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );
  const wheelGestures = React.useRef(WheelGesturesPlugin());

  // Enable drag for touchpad/trackpad users
  const carouselOpts = { dragFree: false };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      plugin.current.reset();
    }, 100);
    return () => clearTimeout(timer);
  }, [language]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return language === "ar"
      ? date.toLocaleDateString("ar-SA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  return (
    <div className="relative w-full">
      <Carousel
        key={language}
        plugins={[plugin.current, wheelGestures.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        opts={carouselOpts}
      >
        <CarouselContent>
          {articles.map((article, index) => {
            const title = language === "ar" ? article.title_ar : article.title_en;
            const excerpt = language === "ar" ? article.excerpt_ar : article.excerpt_en;
            const categoryName =
              language === "ar" ? article.category_name_ar : article.category_name_en;
            return (
              <CarouselItem key={`carousel-article-${article.id || index}`}>
                <Card className="border border-stone-200 shadow-none overflow-hidden rounded-none bg-white">
                  <Link href={`/article/${article.id}`} className="block">
                    <div className="relative aspect-[16/10] md:aspect-[16/11] bg-stone-200">
                      <Image
                        src={article.image_url || "/placeholder.svg"}
                        alt={title}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                    </div>
                    <div className="p-5 md:p-7">
                      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                        {categoryName && (
                          <span className="font-semibold text-slate-700 border border-stone-300 px-2 py-0.5 bg-[#f8f7f4]">
                            {categoryName}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(article.published_at)}
                        </div>
                      </div>
                      <h1 className="text-2xl md:text-4xl font-semibold mb-3 leading-tight text-slate-900 tracking-tight">
                        {title}
                      </h1>
                      <p className="text-base md:text-lg text-slate-600 leading-relaxed line-clamp-3 max-w-3xl">
                        {excerpt}
                      </p>
                    </div>
                  </Link>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-3 top-[28%] md:top-[30%] h-9 w-9 rounded-md border border-stone-300 bg-white/90 text-slate-700 hover:bg-white hover:text-slate-900 shadow-none" />
        <CarouselNext className="right-3 top-[28%] md:top-[30%] h-9 w-9 rounded-md border border-stone-300 bg-white/90 text-slate-700 hover:bg-white hover:text-slate-900 shadow-none" />
      </Carousel>
    </div>
  );
}
