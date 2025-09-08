import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Article, Category, Tag } from "@/lib/models/Article";
import { User } from "@/lib/models/User";
import bcrypt from "bcryptjs";

// Direct database connection function
async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI!;

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  if ((global as any).mongoose?.conn) {
    return (global as any).mongoose.conn;
  }

  if (!(global as any).mongoose) {
    (global as any).mongoose = { conn: null, promise: null };
  }

  if (!(global as any).mongoose.promise) {
    (global as any).mongoose.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  (global as any).mongoose.conn = await (global as any).mongoose.promise;
  return (global as any).mongoose.conn;
}

export async function POST() {
  try {
    await connectDB();

    console.log("📂 Creating sample categories...");

    // Check if categories already exist
    const existingCategories = await Category.find({});

    let categories;
    if (existingCategories.length === 0) {
      // Create categories if they don't exist
      categories = await Category.insertMany([
        {
          name_en: "Technology",
          name_ar: "التكنولوجيا",
          slug: "technology",
          meta_description_en: "Latest technology news and innovations",
          meta_description_ar: "أحدث أخبار التكنولوجيا والابتكارات",
        },
        {
          name_en: "Sports",
          name_ar: "الرياضة",
          slug: "sports",
          meta_description_en: "Sports news and updates",
          meta_description_ar: "أخبار ومستجدات الرياضة",
        },
        {
          name_en: "Politics",
          name_ar: "السياسة",
          slug: "politics",
          meta_description_en: "Political news and analysis",
          meta_description_ar: "الأخبار والتحليلات السياسية",
        },
      ]);
    } else {
      categories = existingCategories;
    }

    console.log("✅ Categories available:", categories.length);

    // Create sample tags
    console.log("🏷️ Creating sample tags...");
    const existingTags = await Tag.find({});

    let tags;
    if (existingTags.length === 0) {
      tags = await Tag.insertMany([
        {
          name_en: "Breaking News",
          name_ar: "أخبار عاجلة",
          slug: "breaking-news",
          description_en: "Latest breaking news and urgent updates",
          description_ar: "آخر الأخبار العاجلة والتحديثات العاجلة",
        },
        {
          name_en: "Innovation",
          name_ar: "الابتكار",
          slug: "innovation",
          description_en: "Innovative technologies and discoveries",
          description_ar: "التقنيات والاكتشافات المبتكرة",
        },
        {
          name_en: "Global",
          name_ar: "عالمي",
          slug: "global",
          description_en: "International and global news",
          description_ar: "الأخبار الدولية والعالمية",
        },
        {
          name_en: "Analysis",
          name_ar: "تحليل",
          slug: "analysis",
          description_en: "In-depth analysis and commentary",
          description_ar: "تحليل معمق وتعليقات",
        },
        {
          name_en: "Featured",
          name_ar: "مميز",
          slug: "featured",
          description_en: "Featured and highlighted content",
          description_ar: "المحتوى المميز والمسلط عليه الضوء",
        },
      ]);
    } else {
      tags = existingTags;
    }

    console.log("✅ Tags available:", tags.length);

    // Check if articles already exist
    const existingArticles = await Article.find({});

    if (existingArticles.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Sample data already exists",
        stats: {
          categories: categories.length,
          articles: existingArticles.length,
          tags: tags.length,
        },
      });
    }

    console.log("📰 Creating sample articles...");

    // Create sample articles
    const articles = await Article.insertMany([
      {
        title_en: "Revolutionary AI Technology Announced",
        title_ar: "الإعلان عن تقنية ذكاء اصطناعي ثورية",
        content_en:
          "A groundbreaking artificial intelligence technology has been announced that promises to revolutionize the way we interact with computers. This new AI system demonstrates unprecedented capabilities in natural language processing and machine learning, opening up new possibilities for automation and human-computer interaction.",
        content_ar:
          "تم الإعلان عن تقنية ذكاء اصطناعي رائدة تعد بثورة في طريقة تفاعلنا مع أجهزة الكمبيوتر. يُظهر نظام الذكاء الاصطناعي الجديد قدرات غير مسبوقة في معالجة اللغة الطبيعية والتعلم الآلي، مما يفتح إمكانيات جديدة للأتمتة والتفاعل بين الإنسان والحاسوب.",
        excerpt_en:
          "New AI technology promises revolutionary changes in computing",
        excerpt_ar: "تقنية ذكاء اصطناعي جديدة تعد بتغييرات ثورية في الحاسوب",
        category_id: categories[0]._id,
        image_url: "/uploads/ai-technology.jpg",
        is_published: true,
        is_featured: true,
        published_at: new Date(),
        meta_title_en: "Revolutionary AI Technology - Latest News",
        meta_title_ar: "تقنية الذكاء الاصطناعي الثورية - آخر الأخبار",
        meta_description_en:
          "Latest announcement about revolutionary AI technology that will change computing forever",
        meta_description_ar:
          "آخر إعلان عن تقنية الذكاء الاصطناعي الثورية التي ستغير الحاسوب إلى الأبد",
      },
      {
        title_en: "World Cup Finals Draw Record Audience",
        title_ar: "نهائي كأس العالم يحقق رقماً قياسياً في المشاهدة",
        content_en:
          "The World Cup finals attracted a record-breaking global audience, with millions of viewers tuning in from around the world. The match was praised for its exceptional quality and thrilling moments that kept fans on the edge of their seats throughout the entire game.",
        content_ar:
          "جذب نهائي كأس العالم جمهوراً عالمياً قياسياً، حيث تابع ملايين المشاهدين من جميع أنحاء العالم. تم الإشادة بالمباراة لجودتها الاستثنائية واللحظات المثيرة التي أبقت المشجعين في حالة ترقب طوال المباراة بأكملها.",
        excerpt_en: "World Cup finals break global viewership records",
        excerpt_ar: "نهائي كأس العالم يكسر أرقام المشاهدة العالمية",
        category_id: categories[1]._id,
        image_url: "/uploads/world-cup.jpg",
        is_published: true,
        is_featured: true,
        published_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        meta_title_en: "World Cup Finals Record Audience - Sports News",
        meta_title_ar: "نهائي كأس العالم رقم قياسي - أخبار الرياضة",
        meta_description_en:
          "World Cup finals achieve record-breaking global viewership numbers",
        meta_description_ar:
          "نهائي كأس العالم يحقق أرقاماً قياسية في المشاهدة العالمية",
      },
      {
        title_en: "Economic Summit Addresses Global Challenges",
        title_ar: "القمة الاقتصادية تتناول التحديات العالمية",
        content_en:
          "World leaders gathered at the annual economic summit to discuss pressing global challenges including climate change, trade policies, and economic recovery. The summit aimed to foster international cooperation and develop sustainable solutions for the worlds most urgent issues.",
        content_ar:
          "اجتمع قادة العالم في القمة الاقتصادية السنوية لمناقشة التحديات العالمية الملحة بما في ذلك التغير المناخي وسياسات التجارة والتعافي الاقتصادي. هدفت القمة إلى تعزيز التعاون الدولي وتطوير حلول مستدامة لأكثر القضايا إلحاحاً في العالم.",
        excerpt_en: "Global leaders unite to tackle economic challenges",
        excerpt_ar: "قادة العالم يتحدون لمواجهة التحديات الاقتصادية",
        category_id: categories[2]._id,
        image_url: "/uploads/economic-summit.jpg",
        is_published: true,
        is_featured: false,
        published_at: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
        meta_title_en: "Economic Summit Global Challenges - Political News",
        meta_title_ar: "القمة الاقتصادية التحديات العالمية - الأخبار السياسية",
        meta_description_en:
          "Economic summit brings together world leaders to address global challenges",
        meta_description_ar:
          "القمة الاقتصادية تجمع قادة العالم لمواجهة التحديات العالمية",
      },
    ]);

    // Create test users with different roles
    console.log("👥 Creating test users...");
    const existingTestUsers = await User.find({
      email: {
        $in: [
          "writer1@journal.com",
          "writer2@journal.com",
          "editor1@journal.com",
        ],
      },
    });

    let testUsersCreated = 0;
    if (existingTestUsers.length === 0) {
      const testUsers = await User.insertMany([
        {
          username: "writer1",
          email: "writer1@journal.com",
          password_hash: await bcrypt.hash("writer123", 10),
          first_name: "John",
          last_name: "Writer",
          role: "writer",
          is_active: true,
          is_verified: true,
          bio: "Senior journalist specializing in technology and science.",
        },
        {
          username: "writer2",
          email: "writer2@journal.com",
          password_hash: await bcrypt.hash("writer123", 10),
          first_name: "Sarah",
          last_name: "Ahmed",
          role: "writer",
          is_active: true,
          is_verified: true,
          bio: "Political correspondent and investigative journalist.",
        },
        {
          username: "editor1",
          email: "editor1@journal.com",
          password_hash: await bcrypt.hash("editor123", 10),
          first_name: "Michael",
          last_name: "Editor",
          role: "user",
          is_active: true,
          is_verified: true,
          bio: "Former editor, now regular contributor.",
        },
        {
          username: "banned_user",
          email: "banned@journal.com",
          password_hash: await bcrypt.hash("banned123", 10),
          first_name: "Banned",
          last_name: "User",
          role: "user",
          is_active: false,
          is_verified: false,
          bio: "This user has been banned for violations.",
        },
        {
          username: "contributor1",
          email: "contributor1@journal.com",
          password_hash: await bcrypt.hash("contributor123", 10),
          first_name: "Alex",
          last_name: "Contributor",
          role: "user",
          is_active: true,
          is_verified: true,
          bio: "Freelance contributor focusing on sports and entertainment.",
        },
      ]);
      testUsersCreated = testUsers.length;
      console.log("✅ Test users created:", testUsersCreated);
    } else {
      console.log("⚠️  Test users already exist");
    }

    return NextResponse.json({
      success: true,
      message: "Sample data created successfully",
      stats: {
        categories: categories.length,
        articles: articles.length,
        tags: tags.length,
        testUsers: testUsersCreated || existingTestUsers.length,
      },
      data: {
        categories: categories.map((cat) => ({
          name_en: cat.name_en,
          name_ar: cat.name_ar,
          slug: cat.slug,
        })),
        articles: articles.map((art) => ({
          title_en: art.title_en,
          title_ar: art.title_ar,
          is_featured: art.is_featured,
        })),
        tags: tags.map((tag) => ({
          name_en: tag.name_en,
          name_ar: tag.name_ar,
          slug: tag.slug,
        })),
      },
    });
  } catch (error: any) {
    console.error("❌ Error seeding database:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create sample data",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
