"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { Card, CardContent } from "@/components/ui/card";
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

interface Article {
  id: number;
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

  // Force carousel reinitialization when language changes
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
        key={language} // Force re-render when language changes
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
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

                      {/* Content overlay */}
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
        <CarouselPrevious className="w-10 h-10 md:w-12 md:h-12 bg-red-600 border-0 text-white hover:bg-red-700 transition-colors duration-200" />
        <CarouselNext className="w-10 h-10 md:w-12 md:h-12 bg-red-600 border-0 text-white hover:bg-red-700 transition-colors duration-200" />
      </Carousel>
    </div>
  );
}
