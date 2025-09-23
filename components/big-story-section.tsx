import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

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
    <section className="w-full mt-12">
      <div className="container mx-auto pt-6">
        {/* Black category banner and top line aligned */}
        <div className="flex items-center mb-6">
          <div className="text-xs font-bold tracking-widest uppercase bg-black text-white px-4 py-1 inline-block mr-4 rounded-md">
            {isArabic
              ? article.categoryLabel_ar || article.categoryLabel
              : article.categoryLabel}
          </div>
          <div
            className="border-t-2 border-black h-0 ml-0"
            style={{ flex: 1, maxWidth: "87%" }}
          ></div>
        </div>
        <div className="mb-0">
          <div className="flex flex-col md:flex-row gap-8 items-stretch">
            {/* Left: Image */}
            <div className="md:w-2/3 w-full">
              <Link href={article.href}>
                {article.image_url ? (
                  <Image
                    src={article.image_url}
                    alt={article.title}
                    width={900}
                    height={600}
                    className="w-full h-auto object-cover rounded"
                    priority
                  />
                ) : null}
              </Link>
            </div>
            {/* Right: Text */}
            <div className="md:w-1/3 w-full flex flex-col justify-start">
              {article.authors && (
                <div className="text-[11px] font-semibold tracking-widest uppercase text-gray-500 mb-3">
                  {article.authors}
                </div>
              )}
              <Link href={article.href}>
                <h2 className="text-4xl font-extrabold leading-tight mb-3 mt-1 hover:text-red-600 transition-colors duration-200 break-words max-w-md w-full">
                  {isArabic ? article.title_ar || article.title : article.title}
                </h2>
              </Link>
              {(article.excerpt || article.excerpt_ar) && (
                <div className="text-base text-black font-bold mt-3">
                  {isArabic
                    ? article.excerpt_ar || article.excerpt
                    : article.excerpt}
                </div>
              )}
              {/* Article content at the bottom (2 lines, suspense) */}
              {(article.content_en || article.content_ar) && (
                <div
                  className="mt-auto pt-8 text-gray-800 text-base line-clamp-2 overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {(isArabic
                    ? article.content_ar
                    : article.content_en
                  )?.replace(/\n/g, " ")}{" "}
                  ...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
