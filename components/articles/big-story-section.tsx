import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/context/language-context";

export interface BigStoryArticle {
  id: string;
  title: string;
  title_ar?: string;
  image_url: string;
  category: string;
  categoryLabel: string;
  categoryLabel_ar?: string;
  href: string;
  authors?: string;
  excerpt?: string;
  excerpt_ar?: string;
  content_en?: string;
  content_ar?: string;
}

interface Props {
  article: BigStoryArticle;
}

export default function BigStorySection({ article }: Props) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  return (
    <section className="w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#7a3030]">
          {isArabic ? article.categoryLabel_ar || article.categoryLabel : article.categoryLabel}
        </div>
        <div className="h-px bg-stone-300 flex-1" />
      </div>
      <Link
        href={article.href}
        className="group grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start"
      >
        <div className="md:col-span-5 lg:col-span-4">
          {article.image_url ? (
            <div className="relative aspect-[4/3] bg-stone-200 border border-stone-200 overflow-hidden">
              <Image
                src={article.image_url}
                alt={isArabic ? article.title_ar || article.title : article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 360px"
              />
            </div>
          ) : null}
        </div>
        <div className="md:col-span-7 lg:col-span-8">
          {article.authors && (
            <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-500 mb-2">
              {article.authors}
            </div>
          )}
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-tight tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
            {isArabic ? article.title_ar || article.title : article.title}
          </h2>
          {(article.excerpt || article.excerpt_ar) && (
            <p className="text-sm md:text-base text-slate-600 leading-relaxed mt-2.5 line-clamp-3">
              {isArabic ? article.excerpt_ar || article.excerpt : article.excerpt}
            </p>
          )}
        </div>
      </Link>
    </section>
  );
}
