"use client";

import { useLanguage } from "@/lib/context/language-context";
import { NewsletterSection } from "@/components/home/newsletter-section";

export function AboutContent() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const pillars = isAr
    ? [
        {
          title: "المناطق الحدودية والاقتصادات غير الرسمية",
          body: "تتبّع نبض التجارة العابرة للحدود، وسياسات الجمارك، وديناميكيات التهريب، والترابط الاقتصادي الذي يربط ليبيا بتونس والجزائر ومصر والساحل.",
        },
        {
          title: "الهجرة والتنقل البشري",
          body: "تجاوز الأرقام الرئيسية لدراسة ممرات العبور، وقدرات الاستقبال البلدية، والأطر القانونية، وهجرة اليد العاملة الدائرية.",
        },
        {
          title: "الحوكمة المحلية والخدمات العامة",
          body: "رصد اللامركزية، والانتخابات البلدية، والبنية التحتية للكهرباء والمياه، والوصول إلى الرعاية الصحية، والوساطة في النزاعات المحلية.",
        },
        {
          title: "أسواق العمل وسبل العيش",
          body: "تحليل صرف الأجور، وتشغيل الشباب، وتنظيمات العمالة الأجنبية، والتضخم، والأثر الواقعي لإصلاحات الدعم على الأسر.",
        },
        {
          title: "التجارة والمؤشرات الكلية",
          body: "تقديم تتبّع شفاف وسهل القراءة لأسعار الصرف الموازية مقابل الرسمية، ونشاط الموانئ، وأسعار الوقود، وسلال السلع الأساسية.",
        },
      ]
    : [
        {
          title: "Borderlands & Informal Economies",
          body: "Tracking the pulse of cross-border commerce, customs policies, smuggling dynamics, and the economic interdependence linking Libya with Tunisia, Algeria, Egypt, and the Sahel.",
        },
        {
          title: "Migration & Human Mobility",
          body: "Moving beyond headline numbers to examine transit corridors, municipal reception capacities, legal frameworks, and circular labor migration.",
        },
        {
          title: "Local Governance & Public Services",
          body: "Monitoring decentralization, municipal elections, electricity and water infrastructure, healthcare access, and local conflict mediation.",
        },
        {
          title: "Labor Markets & Livelihoods",
          body: "Analyzing wage disbursements, youth employment, foreign labor regulations, inflation, and the real-world impact of subsidy reforms on households.",
        },
        {
          title: "Trade & Macro Indicators",
          body: "Providing transparent, easy-to-read tracking of parallel vs. official exchange rates, port activity, fuel prices, and basic commodity baskets.",
        },
      ];

  const methodology = isAr
    ? [
        {
          title: "رصد محلي معمّق",
          body: "يراقب مكتبنا التحريري عشرات الصفحات البلدية على فيسبوك، والبث الإذاعي المحلي، والوكالات الإخبارية الإقليمية، ونشرات النقابات، وتقارير المجتمع المدني باللغات العربية والفرنسية والإنجليزية.",
        },
        {
          title: "إسناد شفاف وتصنيف للمصادر",
          body: "لا ننسب تقارير الآخرين إلى أنفسنا أبدًا. كل مادة مجمّعة ترتبط مباشرة بمصدرها الأولي وتحمل شارة تحقق واضحة (مرسوم رسمي، إعلام محلي، بيانات أممية/منظمات غير حكومية، أو توليف ميداني من مدار المغرب).",
        },
        {
          title: "السياق قبل الإثارة",
          body: "بدلًا من مجرد إعادة نشر العناوين، تتضمن كل مادة خلاصة موجزة بعنوان «لماذا يهم؟» تشرح الأهمية التاريخية أو الاقتصادية أو الجيوسياسية وراء الخبر.",
        },
      ]
    : [
        {
          title: "Hyper-Local Monitoring",
          body: "Our editorial desk monitors dozens of municipal Facebook pages, local radio broadcasts, regional news agencies, trade union bulletins, and civil society reports in Arabic, French, and English.",
        },
        {
          title: "Transparent Attribution & Tiering",
          body: "We never claim others' reporting as our own. Every aggregated item links directly to its primary source and carries a clear verification badge (Official Decree, Local Media, UN/NGO Data, or Orbit Field Synthesis).",
        },
        {
          title: "Context Over Clickbait",
          body: "Rather than simply reposting headlines, every entry includes a concise “Why It Matters” takeaway—explaining the historical, economic, or geopolitical significance behind the news.",
        },
      ];

  const audience = isAr
    ? [
        "محللو السياسات والدبلوماسيون والمنظمات غير الحكومية الذين يتابعون الوصول الإنساني والحوكمة واتجاهات التنقل.",
        "الاقتصاديون ومستشارو المخاطر والشركات الإقليمية الذين يرصدون سلاسل الإمداد وتحولات العملات وظروف العمل.",
        "الأكاديميون والصحفيون الباحثون عن مصادر محلية موثقة وبيانات إقليمية قابلة للاستشهاد.",
        "المواطنون ومجتمعات الشتات الباحثون عن تغطية موثوقة وغير منحازة للخدمات العامة والحياة الاقتصادية في أوطانهم.",
      ]
    : [
        "Policy Analysts, Diplomats & NGOs tracking humanitarian access, governance, and mobility trends.",
        "Economists, Risk Consultants & Regional Businesses monitoring supply chains, currency shifts, and labor conditions.",
        "Academics & Journalists seeking verified local sources and citable regional data.",
        "Citizens & Diaspora Communities looking for non-partisan, reliable reporting on public services and economic life back home.",
      ];

  const facts = isAr
    ? [
        { label: "الإيقاع", value: "إحاطة ثلاثية أسبوعيًا" },
        { label: "الجدول", value: "الإثنين • الأربعاء • الجمعة" },
        { label: "التركيز", value: "ليبيا والمغرب العربي الأوسع" },
      ]
    : [
        { label: "Cadence", value: "Tri-weekly briefing" },
        { label: "Schedule", value: "Monday • Wednesday • Friday" },
        { label: "Focus", value: "Libya & the wider Maghreb" },
      ];

  return (
    <div className="space-y-10 md:space-y-14">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-7">
          <p className="text-[11px] md:text-xs tracking-[0.18em] uppercase text-[#7a3030] font-semibold mb-3">
            {isAr ? "من نحن: مدار المغرب" : "About Us: The Maghreb Orbit"}
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-950 mb-5 leading-tight">
            {isAr
              ? "سدّ فجوة المعلومات عبر ليبيا والمغرب العربي"
              : "Bridging the Information Gap Across Libya and the Maghreb."}
          </h1>
          <p className="text-slate-600 leading-relaxed text-base md:text-lg">
            {isAr ? (
              <>
                <strong className="font-semibold text-slate-900">ممر المغرب</strong> منصة مستقلة لاستخبارات الأخبار وتجميعها، تصدر ثلاث مرات أسبوعيًا، ومكرسة لفكّ الديناميكيات السياسية والاقتصادية والإنسانية التي تشكّل ليبيا والمغرب العربي الأوسع.
              </>
            ) : (
              <>
                <strong className="font-semibold text-slate-900">The Maghreb corridor</strong> is an independent, tri-weekly intelligence and news aggregation platform dedicated to decoding the political, economic, and human dynamics shaping Libya and the wider Maghreb.
              </>
            )}
          </p>
          <p className="text-slate-600 leading-relaxed text-base md:text-lg mt-4">
            {isAr
              ? "بينما تختزل التغطية الدولية السائدة لشمال أفريقيا غالبًا في أزمات متقطعة أو قمم دبلوماسية رفيعة المستوى، فإن المحركات الحقيقية للاستقرار الإقليمي تحدث على الأرض — عند المعابر الحدودية النائية، وداخل المجالس البلدية، وعلى طول ممرات التجارة غير الرسمية، وضمن أسواق العمل المحلية. في كل يوم إثنين وأربعاء وجمعة، نقوم بتنظيم التقارير المحلية المتناثرة والتحقق منها وتوليفها في استخبارات واضحة وقابلة للتنفيذ."
              : "While mainstream international coverage often reduces North Africa to episodic crises or high-level diplomatic summits, the true drivers of regional stability happen on the ground—at remote border crossings, inside municipal councils, along informal trade corridors, and within local labor markets. Every Monday, Wednesday, and Friday, we curate, verify, and synthesize fragmented local reporting into clear, actionable intelligence."}
          </p>
        </div>

        <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="border border-stone-200 bg-white/80 rounded-md p-5 md:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7a3030] mb-4">
              {isAr ? "لمحة سريعة" : "At a glance"}
            </h2>
            <dl className="space-y-4">
              {facts.map((fact) => (
                <div key={fact.label} className="border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                  <dt className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-1">{fact.label}</dt>
                  <dd className="text-sm md:text-base font-medium text-slate-900">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="border border-[#7a3030]/15 bg-[#7a3030]/[0.03] rounded-md p-5">
            <p className="text-sm md:text-[15px] leading-relaxed text-slate-700">
              <strong className="font-semibold text-slate-900">
                {isAr ? "مدار المغرب يقطع الضجيج." : "The Maghreb Orbit cuts through the noise."}
              </strong>{" "}
              {isAr
                ? "نربط الوقائع المحلية المفرطة بالتفصيل بالاتجاهات الكلية الإقليمية."
                : "We connect hyper-local realities to regional macro-trends."}
            </p>
          </div>
        </aside>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 border-t border-stone-200 pt-8 md:pt-10">
        <div className="lg:col-span-5">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-950 mb-4">
            {isAr ? "لماذا وُجدنا (المشكلة التي نعالجها)" : "Why We Exist (The Problem We Solve)"}
          </h2>
          <p className="text-slate-600 leading-relaxed">
            {isAr
              ? "المعلومات عبر المغرب العربي مجزأة بعمق عبر اللغات والجغرافيات والمنصات. مهمتنا هي تحويل هذا التشتت إلى فهم واضح وقابل للاستخدام."
              : "Information across the Maghreb is deeply fragmented across languages, geographies, and platforms. Our role is to turn that fragmentation into clear, usable understanding."}
          </p>
        </div>
        <div className="lg:col-span-7">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3 gap-4">
            <li className="border border-stone-200 bg-white/70 rounded-md p-4 md:p-5">
              <h3 className="font-semibold text-slate-900 mb-2">{isAr ? "عزلة لغوية" : "Linguistic Silos"}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {isAr
                  ? "تُبلَّغ قرارات بلدية حيوية في جنوب ليبيا أو احتجاجات عمالية في تونس باللهجات العربية المحلية، وتُنشر أوراق السياسات بالفرنسية، وتظهر تقارير المانحين الدولية بالإنجليزية."
                  : "Vital municipal decisions in southern Libya or labor protests in Tunisia are reported in local Arabic dialects, policy papers are published in French, and international donor reports appear in English."}
              </p>
            </li>
            <li className="border border-stone-200 bg-white/70 rounded-md p-4 md:p-5">
              <h3 className="font-semibold text-slate-900 mb-2">{isAr ? "نقطة العمى «المتمركزة حول العواصم»" : 'The "Capital-Centric" Blind Spot'}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {isAr
                  ? "تركّز التغطية بشكل غير متناسب على العواصم الساحلية (طرابلس، تونس، الجزائر، الرباط)، متجاهلةً الأطراف الحدودية ومحاور العبور الصحراوية حيث تتقاطع التجارة والهجرة والحوكمة فعليًا."
                  : "Coverage disproportionately focuses on coastal capitals (Tripoli, Tunis, Algiers, Rabat), overlooking the peripheral borderlands and Saharan transit hubs where trade, migration, and governance truly intersect."}
              </p>
            </li>
            <li className="border border-stone-200 bg-white/70 rounded-md p-4 md:p-5 sm:col-span-2 xl:col-span-1">
              <h3 className="font-semibold text-slate-900 mb-2">{isAr ? "الضجيج مقابل الإشارة" : "Noise vs. Signal"}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {isAr
                  ? "يقضي الباحثون وصنّاع السياسات والشركات والمواطنون ساعات في غربلة ادعاءات غير موثقة على وسائل التواصل الاجتماعي ومنافذ منحازة لفهم الوقائع الاقتصادية والخدمية الأساسية."
                  : "Researchers, policymakers, businesses, and citizens spend hours sifting through unverified social media claims and partisan outlets to understand basic economic and service realities."}
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section className="border-t border-stone-200 pt-8 md:pt-10">
        <div className="max-w-3xl mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-950 mb-3">
            {isAr ? "ركائزنا التحريرية الخمس" : "Our Five Editorial Pillars"}
          </h2>
          <p className="text-slate-600 leading-relaxed">
            {isAr
              ? "كل ما نجمعه ونتتبعه ونحلله يقع ضمن خمس عدسات مترابطة:"
              : "Everything we aggregate, track, and analyze falls under five interconnected lenses:"}
          </p>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pillars.map((pillar, index) => (
            <li
              key={pillar.title}
              className={`border border-stone-200 bg-white/70 rounded-md p-5 ${index === 4 ? "md:col-span-2 xl:col-span-1" : ""}`}
            >
              <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#7a3030] mb-2">
                {isAr ? `الركيزة ${index + 1}` : `Pillar ${index + 1}`}
              </p>
              <h3 className="text-base md:text-lg font-semibold text-slate-950 mb-2">{pillar.title}</h3>
              <p className="text-sm md:text-[15px] text-slate-600 leading-relaxed">{pillar.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 border-t border-stone-200 pt-8 md:pt-10">
        <div className="lg:col-span-4">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-950 mb-4">
            {isAr ? "منهجيتنا: كيف نجمع المعلومات ونتحقق منها" : "Our Methodology: How We Curate & Verify"}
          </h2>
          <p className="text-slate-600 leading-relaxed">
            {isAr
              ? "بصفتنا منصة متخصصة لتجميع الأخبار والتوليف التحليلي، فإن المصداقية هي عملتنا. تلتزم كل إحاطة تصدر ثلاث مرات أسبوعيًا وكل نقطة بيانات بمعيار تحريري صارم من ثلاث خطوات."
              : "As a specialized news aggregator and analytical synthesis platform, credibility is our currency. Every tri-weekly briefing and data point adheres to a strict three-step editorial standard."}
          </p>
        </div>
        <div className="lg:col-span-8">
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {methodology.map((item, idx) => (
              <li key={item.title} className="border border-stone-200 bg-white/70 rounded-md p-5">
                <div className="text-xs font-semibold tracking-[0.14em] uppercase text-[#7a3030] mb-2">
                  {isAr ? `خطوة ${idx + 1}` : `Step ${idx + 1}`}
                </div>
                <h3 className="text-base font-semibold text-slate-950 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 border-t border-stone-200 pt-8 md:pt-10">
        <div className="lg:col-span-7 border border-stone-200 bg-white/70 rounded-md p-5 md:p-6">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-950 mb-4">
            {isAr ? "من يقرأ مدار المغرب؟" : "Who Reads The Maghreb Orbit?"}
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            {isAr
              ? "صُممت إحاطاتنا التي تصدر ثلاث مرات أسبوعيًا ولوحات المؤشرات للمهنيين والمواطنين المهتمين الذين يحتاجون إلى وضوح مستند إلى الواقع دون حشو:"
              : "Our tri-weekly briefings and indicator dashboards are built for professionals and engaged citizens who require ground-truth clarity without the fluff:"}
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 leading-relaxed">
            {audience.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#7a3030] flex-shrink-0" aria-hidden="true" />
                <span className="text-sm md:text-[15px]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5 border border-stone-200 bg-white/70 rounded-md p-5 md:p-6">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-950 mb-4">
            {isAr ? "الاستقلالية التحريرية والتواصل" : "Editorial Independence & Contact"}
          </h2>
          <p className="text-slate-600 leading-relaxed mb-5 text-sm md:text-[15px]">
            {isAr ? (
              <>
                يلتزم <strong className="font-semibold text-slate-900">مدار المغرب</strong> بالاستقلالية التحريرية الصارمة، وعدم الانحياز، وشفافية البيانات. لا نقبل تمويلًا يهدد نزاهتنا التحريرية أو يفرض توجهاتنا في تغطية الفاعلين الإقليميين.
              </>
            ) : (
              <>
                <strong className="font-semibold text-slate-900">The Maghreb Orbit</strong> is committed to strict editorial independence, non-partisanship, and data transparency. We do not accept funding that compromises our editorial integrity or dictates our coverage of regional actors.
              </>
            )}
          </p>
          <ul className="space-y-4 text-slate-600 leading-relaxed text-sm md:text-[15px]">
            <li>
              <div className="font-semibold text-slate-900 mb-1">{isAr ? "المكتب التحريري والاستفسارات الصحفية" : "Editorial Desk & Press Inquiries"}</div>
              <a href="mailto:desk@maghreborbit.com" className="text-[#7a3030] hover:text-[#632626] underline underline-offset-2">desk@maghreborbit.com</a>
            </li>
            <li>
              <div className="font-semibold text-slate-900 mb-1">{isAr ? "البيانات والشراكات" : "Data & Partnerships"}</div>
              <a href="mailto:data@maghreborbit.com" className="text-[#7a3030] hover:text-[#632626] underline underline-offset-2">data@maghreborbit.com</a>
            </li>
            <li>
              <div className="font-semibold text-slate-900 mb-1">{isAr ? "خط إبلاغ آمن (مشفّر)" : "Secure Tip Line (Encrypted)"}</div>
              <div>
                {isAr
                  ? "متاح عبر WhatsApp وSignal وProtonMail للباحثين المحليين والمراسلين الميدانيين والمبلّغين."
                  : "Available via WhatsApp, Signal and ProtonMail for local researchers, stringers, and whistleblowers."}
              </div>
            </li>
          </ul>
          <div className="mt-5 pt-4 border-t border-stone-200">
            <a href="/contact" className="inline-flex items-center text-sm font-medium text-[#7a3030] hover:text-[#632626] underline underline-offset-2">
              {isAr ? "تواصل معنا" : "Contact Us"}
            </a>
          </div>
        </div>
      </section>

      <NewsletterSection />
    </div>
  );
}