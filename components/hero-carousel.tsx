"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Calendar } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
// @ts-ignore
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
            const title =
              language === "ar" ? article.title_ar : article.title_en;
            const excerpt =
              language === "ar" ? article.excerpt_ar : article.excerpt_en;
            const categoryName =
              language === "ar"
                ? article.category_name_ar
                : article.category_name_en;
            return (
              <CarouselItem key={`carousel-article-${article.id || index}`}>
                <Card className="border-0 shadow-2xl overflow-hidden">
                  <Link href={`/article/${article.id}`} className="block">
                    <div className="relative h-96 md:h-[500px]">
                      <Image
                        src={article.image_url || "/placeholder.svg"}
                        alt={title}
                        fill
                        className="object-cover"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                        <div className="mb-4 flex flex-wrap items-center gap-3">
                          {categoryName && (
                            <Badge
                              variant="destructive"
                              className="bg-red-600 hover:bg-red-700 text-sm font-medium"
                            >
                              {categoryName}
                            </Badge>
                          )}
                          <div className="flex items-center text-sm text-gray-200">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(article.published_at)}
                          </div>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-bold mb-4 leading-tight line-clamp-2">
                          {title}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 line-clamp-2 max-w-4xl">
                          {excerpt}
                        </p>
                      </div>
                    </div>
                  </Link>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="w-16 h-16 md:w-20 md:h-20 text-red-600 bg-transparent border-0 shadow-none hover:bg-transparent hover:border-0 hover:text-red-600" />
        <CarouselNext className="w-16 h-16 md:w-20 md:h-20 text-red-600 bg-transparent border-0 shadow-none hover:bg-transparent hover:border-0 hover:text-red-600" />
      </Carousel>
    </div>
  );
}
