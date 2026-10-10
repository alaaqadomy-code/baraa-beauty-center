// Static site generator (no deps): node build.mjs  ->  ./docs
import { mkdirSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { minify } from './minify.mjs';

const SITE = (process.env.SITE_URL || 'https://idresalalaree-debug.github.io/baraa-beauty-center').replace(/\/$/, '');
const OUT = 'docs';
const BASE = new URL(SITE).pathname.replace(/\/$/, ''); // '' on custom domain, '/repo' on GitHub project pages
const rebase = h => h.replace(/(href|src)="\/(?!\/)/g, `$1="${BASE}/`);
const TODAY = new Date().toISOString().slice(0, 10);

const B = {
  name: 'براءة بيوتي سنتر', nameEn: 'Baraa Beauty Center',
  city: 'الزرقاء', cityEn: 'Zarqa',
  phone: '+962796892705', phoneLocal: '0796 892 705',
  wa: 'https://wa.me/962796892705?text=' + encodeURIComponent('مرحباً براءة بيوتي سنتر، بدي أحجز موعد 🌸'),
  fb: 'https://www.facebook.com/Baraabeautycenter/',
  ig: 'https://www.instagram.com/baraa_beauty_center/',
  snap: 'https://www.snapchat.com/@makeup.bybaraa',
  maps: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('براءة بيوتي سنتر الزرقاء'),
};

// ---------- images (Unsplash CDN, auto AVIF/WebP) ----------
const U = (id, w, h) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ''}&q=70`;
const img = (id, alt, { ratio = 1.25, sizes = '(max-width:900px) 100vw, 50vw', eager = false, cls = '', widths = [480, 800, 1200] } = {}) => {
  const set = widths.map(w => `${U(id, w, Math.round(w * ratio))} ${w}w`).join(', ');
  const w = widths[1], h = Math.round(w * ratio);
  return `<img src="${U(id, w, h)}" srcset="${set}" sizes="${sizes}" width="${w}" height="${h}" alt="${alt}"${cls ? ` class="${cls}"` : ''} ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
};
const P = {
  heroMakeup: 'photo-1636023730877-233b9237d4ec', bride: 'photo-1549416878-b9ca95e26903', blow: 'photo-1580618672591-eb180b1a973f',
  bride2: 'photo-1596092882833-4a5417bc7ac7', bride3: 'photo-1645827042168-4fb0cdd0bf7e',
  mua: 'photo-1709477542149-f4e0e21d590b', mua2: 'photo-1638959882708-9503b1cd595f', brushes: 'photo-1583784561105-a674080f391e', cosmetics: 'photo-1512496015851-a90fb38ba796',
  curl: 'photo-1629397685944-7073f5589754', hair2: 'photo-1634449571017-5fecfd26ad76',
  nails: 'photo-1632345031435-8727f6897d53', nails2: 'photo-1610992015762-45dca7fa3a85',
  facial: 'photo-1570172619644-dfd03ed5d881', lashes: 'photo-1589710751893-f9a6770ad71b',
  salon: 'photo-1637777277435-3c44f82fd0c9', lips: 'photo-1630084775816-7abb7383ded5', palette: 'photo-1596704017254-9b121068fb31',
};

// ---------- icons ----------
const I = {
  wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 2.5 1 3 .8 3.6.7.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  fb: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8V6.5c0-.7.2-1.2 1.3-1.2H17V2.2C16.7 2.1 15.6 2 14.4 2 11.9 2 10.2 3.5 10.2 6.3V8H7.5v3.4h2.7V22H14V11.4h2.7l.4-3.4H14z"/></svg>',
  snap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 2.5c3 0 5.2 2.3 5.2 5.3v2.4c.5.2 1.2 0 1.7-.2.6-.2 1.1.6.5 1-.6.5-1.8.8-2 1.4.6 1.7 2 3.4 3.8 3.9.4.1.4.6 0 .8-.7.3-1.6.4-2 .7-.2.3-.1 1-.5 1.2-.6.2-1.6-.3-2.8.1-1 .4-1.9 1.6-3.9 1.6s-2.9-1.2-3.9-1.6c-1.2-.4-2.2.1-2.8-.1-.4-.2-.3-.9-.5-1.2-.4-.3-1.3-.4-2-.7-.4-.2-.4-.7 0-.8 1.8-.5 3.2-2.2 3.8-3.9-.2-.6-1.4-.9-2-1.4-.6-.4-.1-1.2.5-1 .5.2 1.2.4 1.7.2V7.8c0-3 2.2-5.3 5.2-5.3z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 20s-7.5-4.6-9.3-9.2C1.4 7.4 3.7 4 7.2 4c2 0 3.5 1.1 4.8 2.8C13.3 5.1 14.8 4 16.8 4c3.5 0 5.8 3.4 4.5 6.8C19.5 15.4 12 20 12 20z"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  crown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/></svg>',
};

// ---------- services ----------
const services = [
  { t: 'مكياج العرائس', d: 'إطلالة ليلة العمر بثبات يدوم طوال الحفل، مع جلسة تجربة واختيار الستايل اللي يشبهك.', img: P.bride2, href: '/bridal-makeup/', alt: 'عروس بفستان أبيض بعد مكياج العرائس' },
  { t: 'مكياج السهرات والمناسبات', d: 'سموكي، سوفت جلام أو ناعم ونهاري، حسب المناسبة ولون الفستان وشكل الوجه.', img: P.mua, href: '/makeup-artist/', alt: 'خبيرة مكياج تضع المكياج لعميلة' },
  { t: 'تسريحات الشعر والسشوار', d: 'تسريحات عرائس وسهرات، ويفي وكيرلي وسشوار ناعم يلمع.', img: P.curl, href: '/#services', alt: 'تصفيف الشعر بالمكواة في الصالون' },
  { t: 'العناية بالبشرة', d: 'جلسات تنظيف وترطيب تحضّر بشرتك لمكياج أنعم وإشراقة طبيعية.', img: P.facial, href: '/#services', alt: 'جلسة عناية بالبشرة وماسك للوجه' },
  { t: 'المناكير والبديكير', d: 'أظافر مرتبة بألوان وتصاميم تكمّل إطلالتك.', img: P.nails, href: '/#services', alt: 'مناكير في صالون الأظافر' },
  { t: 'الرموش والحواجب', d: 'تركيب رموش وتحديد حواجب يبرز ملامح العيون.', img: P.lashes, href: '/#services', alt: 'تركيب رموش لعميلة في الصالون' },
  { t: 'الخدمة المنزلية', d: 'نجيكِ لبيتك أو قاعة التجهيز بكامل المعدات، وإنتِ مرتاحة بين أهلك.', img: P.mua2, href: '/home-service/', alt: 'مكياج في المنزل قبل المناسبة' },
  { t: 'تجهيز العروس والمرافقات', d: 'باقة متكاملة للعروس وأهلها وصديقاتها في يوم واحد ومكان واحد.', img: P.bride3, href: '/bridal-makeup/', alt: 'عروس تحمل باقة ورد' },
];

// ---------- FAQ banks ----------
const faqHome = [
  ['وين موقع براءة بيوتي سنتر؟', `براءة بيوتي سنتر صالون تجميل نسائي في ${B.city}، الأردن. للوصول والحجز تواصلي معنا على واتساب أو اتصلي على ${B.phoneLocal}.`],
  ['كيف بحجز موعد؟', 'أسرع طريقة هي رسالة واتساب: اكتبي الخدمة والتاريخ المطلوب، ونأكد لك الموعد المتاح. وتقدري تتواصلي معنا عبر إنستغرام وفيسبوك.'],
  ['هل في خدمة منزلية؟', 'نعم، نقدّم خدمة المكياج والتسريحات في المنزل حسب التوفّر والمنطقة. احجزي مبكراً خصوصاً بمواسم الأعراس.'],
  ['شو الخدمات اللي بتقدموها؟', 'مكياج عرائس وسهرات، تسريحات وسشوار، عناية بالبشرة، مناكير وبديكير، رموش وحواجب، وخدمة منزلية.'],
  ['هل في جلسة تجربة مكياج للعروس؟', 'نعم، ننصح كل عروس بجلسة تجربة قبل العرس لنختار الستايل والألوان ونضمن النتيجة اللي بتحلمي فيها.'],
];
const faqBridal = [
  ['متى لازم أحجز مكياج العرس؟', 'ننصح بالحجز قبل العرس بأسابيع، وبمواسم الصيف والأعياد أبكر لأن المواعيد تنحجز بسرعة.'],
  ['هل المكياج بيثبت طول العرس؟', 'نستخدم تحضير بشرة وتثبيت احترافي ومنتجات مقاومة للتعرّق والدموع ليبقى المكياج ثابت لآخر الليل.'],
  ['هل بتجوا عالبيت يوم العرس؟', 'نعم، نقدّم تجهيز العروس في المنزل أو مكان التجهيز حسب التوفّر.'],
  ['هل بتجهزوا أهل العروس وصاحباتها؟', 'أكيد، تقدري تحجزي باقة للعروس والمرافقات بنفس اليوم.'],
];
const faqMua = [
  ['شو أنواع المكياج اللي بتعملوها؟', 'سوفت جلام، سموكي، مكياج ناعم ونهاري، مكياج سهرات وخطوبة وتخرج وعرائس.'],
  ['كم بياخد وقت المكياج؟', 'المدة تختلف حسب الستايل والخدمات المرافقة؛ عند الحجز نعطيكِ الوقت المتوقع وموعد الوصول المناسب.'],
  ['هل بتستخدموا منتجات أصلية؟', 'نعم، نعتمد منتجات احترافية أصلية ونعقّم الأدوات والفراشي لكل عميلة.'],
  ['هل بقدر أبعت صورة للستايل اللي بدي إياه؟', 'أكيد، ابعتي الصورة ولون الفستان على واتساب ونقترح عليكِ اللي بيناسب ملامحك.'],
];
const faqHomeSvc = [
  ['وين بتغطّوا بالخدمة المنزلية؟', `نخدم ${B.city} والمناطق القريبة حسب التوفّر. ابعتي موقعك على واتساب ونأكد لك.`],
  ['شو الخدمات المتوفرة بالبيت؟', 'مكياج السهرات والعرائس، التسريحات والسشوار، وتجهيز المرافقات.'],
  ['هل في رسوم إضافية للخدمة المنزلية؟', 'تختلف حسب المنطقة وعدد الأشخاص، ونوضّحها لك بالتفصيل قبل تأكيد الحجز.'],
  ['شو لازم أجهّز بالبيت؟', 'مكان فيه إضاءة جيدة وكرسي ومرآة إن أمكن، والباقي علينا: نجيب كل الأدوات والمعدات.'],
];

// ---------- partials ----------
const nav = cur => {
  const items = [['/', 'الرئيسية'], ['/bridal-makeup/', 'مكياج العرائس'], ['/makeup-artist/', 'ميك أب آرتست'], ['/home-service/', 'خدمة منزلية']];
  return items.map(([h, t]) => `<a href="${h}"${h === cur ? ' aria-current="page"' : ''}>${t}</a>`).join('');
};
const header = cur => `<a class="skip" href="#main">انتقلي إلى المحتوى</a>
<header class="hdr"><div class="wrap hdr__in">
  <a class="logo" href="/" aria-label="${B.name} – الصفحة الرئيسية"><b>براءة</b><span>بيوتي سنتر<small>BEAUTY CENTER</small></span></a>
  <button class="burger" aria-label="القائمة" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span></button>
  <nav class="nav" id="nav" aria-label="القائمة الرئيسية">${nav(cur)}<a class="btn" href="${B.wa}" target="_blank" rel="noopener">${I.wa}احجزي الآن</a></nav>
</div></header>`;

const footer = () => `<footer class="ftr"><div class="wrap">
  <div class="ftr__grid">
    <div>
      <a class="logo" href="/"><b>براءة</b><span>بيوتي سنتر<small>BEAUTY CENTER</small></span></a>
      <p class="muted" style="margin-top:16px;max-width:38ch">صالون تجميل نسائي في ${B.city}، الأردن. مكياج عرائس وسهرات، تسريحات، عناية بالبشرة وخدمة منزلية.</p>
      <div class="socials">
        <a href="${B.ig}" target="_blank" rel="noopener" aria-label="إنستغرام">${I.ig}</a>
        <a href="${B.fb}" target="_blank" rel="noopener" aria-label="فيسبوك">${I.fb}</a>
        <a href="${B.snap}" target="_blank" rel="noopener" aria-label="سناب شات">${I.snap}</a>
        <a href="${B.wa}" target="_blank" rel="noopener" aria-label="واتساب">${I.wa}</a>
      </div>
    </div>
    <div><h3>خدماتنا</h3><ul>
      <li><a href="/bridal-makeup/">مكياج العرائس في ${B.city}</a></li>
      <li><a href="/makeup-artist/">ميك أب آرتست في ${B.city}</a></li>
      <li><a href="/home-service/">خدمة تجميل منزلية</a></li>
      <li><a href="/#services">تسريحات وعناية بالبشرة</a></li>
    </ul></div>
    <div><h3>تواصلي معنا</h3><ul>
      <li><a href="tel:${B.phone}" dir="ltr">${B.phoneLocal}</a></li>
      <li><a href="${B.wa}" target="_blank" rel="noopener">واتساب للحجز</a></li>
      <li><a href="${B.maps}" target="_blank" rel="noopener">${B.city}، الأردن</a></li>
    </ul></div>
  </div>
  <div class="ftr__bottom"><span>© <span id="y">${new Date().getFullYear()}</span> ${B.name} · ${B.nameEn}</span><span>صُنع بحب في الأردن</span></div>
</div></footer>
<a class="fab" href="${B.wa}" target="_blank" rel="noopener" aria-label="احجزي عبر واتساب">${I.wa}</a>`;

const ctas = (light = false) => `<div class="hero__cta">
  <a class="btn" href="${B.wa}" target="_blank" rel="noopener">${I.wa}احجزي عبر واتساب</a>
  <a class="btn btn--ghost" href="tel:${B.phone}">${I.phone}<span dir="ltr">${B.phoneLocal}</span></a>
</div>`;

const words = (txt, shineFrom = 99) => txt.split(' ').map((w, i) => `<span class="word"><span style="--i:${i}"${i >= shineFrom ? ' class="shine"' : ''}>${w}</span></span>`).join(' ');

const faqBlock = (items, title = 'أسئلة شائعة') => `<section class="sec sec--light" id="faq" aria-labelledby="faq-h">
  <div class="wrap">
    <div class="sec__head center" data-reveal><span class="eyebrow">إجابات سريعة</span><h2 id="faq-h">${title}</h2></div>
    <div class="faq">${items.map(([q, a], i) => `<details data-reveal style="--d:${i}"${i === 0 ? ' open' : ''}><summary>${q}</summary><div class="ans"><p>${a}</p></div></details>`).join('')}</div>
  </div></section>`;

const ctaBlock = (h = 'جاهزة لإطلالتك الجاية؟', p = 'احجزي موعدك الآن، وخلّي الباقي علينا.') => `<section class="sec"><div class="wrap">
  <div class="cta" data-reveal="clip">${img(P.cosmetics, '', { ratio: .5, sizes: '100vw', widths: [800, 1400, 2000] })}
    <span class="eyebrow">${B.name}</span><h2>${h}</h2><p class="muted" style="max-width:46ch;margin-inline:auto">${p}</p>${ctas()}
  </div></div></section>`;

// ---------- schema ----------
const salonId = `${SITE}/#salon`;
const salonLD = {
  '@type': 'BeautySalon', '@id': salonId,
  name: B.name, alternateName: B.nameEn, url: SITE + '/',
  image: U(P.salon, 1200, 630), logo: `${SITE}/favicon.svg`,
  telephone: B.phone, priceRange: '$$',
  address: { '@type': 'PostalAddress', addressLocality: B.city, addressRegion: 'محافظة الزرقاء', addressCountry: 'JO' },
  areaServed: [{ '@type': 'City', name: B.city }, { '@type': 'Country', name: 'الأردن' }],
  sameAs: [B.fb, B.ig, B.snap],
  knowsLanguage: ['ar'],
  hasOfferCatalog: { '@type': 'OfferCatalog', name: 'خدمات التجميل', itemListElement: services.map(s => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.t, description: s.d } })) },
};
const ld = (path, extra = []) => {
  const graph = [
    { '@type': 'WebSite', '@id': `${SITE}/#website`, url: SITE + '/', name: B.name, inLanguage: 'ar-JO', publisher: { '@id': salonId } },
    salonLD, ...extra,
  ];
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>`;
};
const faqLD = items => ({ '@type': 'FAQPage', mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const crumbLD = list => ({ '@type': 'BreadcrumbList', itemListElement: list.map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: SITE + u })) });
const serviceLD = (name, desc, path) => ({ '@type': 'Service', name, description: desc, serviceType: name, provider: { '@id': salonId }, areaServed: { '@type': 'City', name: B.city }, url: SITE + path });

// ---------- page shell ----------
const page = ({ path, title, desc, ogImg, lcp, body, schema = [] }) => `<!doctype html>
<html lang="ar-JO" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${SITE}${path}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#120a0f">
<meta name="geo.region" content="JO-AZ"><meta name="geo.placename" content="${B.city}">
<meta property="og:type" content="website"><meta property="og:locale" content="ar_JO"><meta property="og:site_name" content="${B.name}">
<meta property="og:title" content="${title}"><meta property="og:description" content="${desc}">
<meta property="og:url" content="${SITE}${path}"><meta property="og:image" content="${U(ogImg, 1200, 630)}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://images.unsplash.com" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${lcp ? `<link rel="preload" as="image" media="(max-width:900px)" imagesrcset="${U(lcp, 640, 1024)} 640w, ${U(lcp, 1080, 1728)} 1080w" imagesizes="100vw" fetchpriority="high">
<link rel="preload" as="image" media="(min-width:901px)" imagesrcset="${U(lcp, 1600, 992)} 1600w, ${U(lcp, 2200, 1364)} 2200w" imagesizes="100vw" fetchpriority="high">` : ''}
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@500;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@700&text=${encodeURIComponent('براءة')}&display=swap">
<link rel="stylesheet" href="/styles.css">
${ld(path, schema)}
</head>
<body>
${header(path)}
<main id="main">${body}</main>
${footer()}
<script src="/main.js" defer></script>
</body>
</html>`;

// hero image: portrait crop on phones, landscape on desktop (art direction via <picture>)
const heroImg = (id, alt, active, eager) => `<picture>
  <source media="(max-width:900px)" srcset="${U(id, 640, 1024)} 640w, ${U(id, 1080, 1728)} 1080w" sizes="100vw">
  <img src="${U(id, 1600, 992)}" srcset="${U(id, 1600, 992)} 1600w, ${U(id, 2200, 1364)} 2200w" sizes="100vw" width="1600" height="992" alt="${alt}"${active ? ' class="is-active"' : ''} ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
</picture>`;
const heroMedia = slides => `<div class="hero__media">${slides.map(([id, alt], i) => heroImg(id, alt, i === 0, i === 0)).join('')}</div>`;

// ---------- HOME ----------
const home = page({
  path: '/', lcp: P.heroMakeup, ogImg: P.heroMakeup,
  title: `${B.name} | صالون تجميل وميك أب آرتست في ${B.city}`,
  desc: `${B.name} في ${B.city}: مكياج عرائس وسهرات، تسريحات شعر، عناية بالبشرة، أظافر وخدمة تجميل منزلية. احجزي موعدك عبر واتساب ${B.phoneLocal}.`,
  schema: [faqLD(faqHome)],
  body: `
<section class="hero" aria-labelledby="h1">
  ${heroMedia([[P.heroMakeup, 'خبيرة مكياج في براءة بيوتي سنتر تجهّز عميلة'], [P.bride, 'عروس بفستان أبيض'], [P.blow, 'تصفيف الشعر بالسشوار في الصالون']])}
  <div class="wrap">
    <span class="eyebrow">صالون تجميل نسائي · ${B.city}، الأردن</span>
    <h1 id="h1">${words('جمالكِ يبدأ بلمسة براءة', 3)}</h1>
    <p class="hero__lead">مكياج عرائس وسهرات، تسريحات، عناية بالبشرة وخدمة منزلية. فنّ يبرز ملامحك الحقيقية ويخليكِ نجمة كل مناسبة.</p>
    ${ctas()}
    <div class="hero__chips"><span class="chip">مكياج عرائس</span><span class="chip">ميك أب آرتست</span><span class="chip">خدمة منزلية</span><span class="chip">تسريحات</span></div>
  </div>
  <div class="hero__dots" role="group" aria-label="صور الخلفية"><button aria-label="الصورة 1" aria-current="true"></button><button aria-label="الصورة 2" aria-current="false"></button><button aria-label="الصورة 3" aria-current="false"></button></div>
  <span class="scroll-cue" aria-hidden="true"></span>
</section>

<div class="marquee-wrap"><div class="marquee" aria-hidden="true"><div class="marquee__track">${[0, 1].map(() => `<span>مكياج عرائس</span><span>سوفت جلام</span><span>تسريحات سهرة</span><span>خدمة منزلية</span><span>عناية بالبشرة</span><span>مناكير</span><span>رموش وحواجب</span>`).join('')}</div></div></div>

<section class="sec sec--light" id="services" aria-labelledby="srv-h">
  <div class="wrap">
    <div class="sec__head" data-reveal><span class="eyebrow">خدماتنا</span><h2 id="srv-h">كل اللي بتحتاجيه لإطلالة كاملة، تحت سقف واحد</h2>
    <p class="muted">من تحضير البشرة لآخر لمسة بالتسريحة، فريق براءة بيوتي سنتر يهتم بكل تفصيلة.</p></div>
    <div class="bento">${services.map((s, i) => `<a class="card c-${i + 1}" href="${s.href}" data-reveal style="--d:${i % 3}">
      ${img(s.img, s.alt, { ratio: i === 0 ? 1.1 : 1.25, sizes: i === 0 ? '(max-width:900px) 100vw, 60vw' : '(max-width:560px) 100vw, (max-width:900px) 50vw, 40vw' })}
      <span class="card__num">0${i + 1}</span><span class="card__arrow">${I.arrow}</span>
      <div class="card__body"><h3>${s.t}</h3><p>${s.d}</p></div></a>`).join('')}</div>
  </div>
</section>

<section class="sec sec--plum" aria-labelledby="story-h">
  <div class="wrap">
    <div class="sec__head" data-reveal><span class="eyebrow">رحلة العروس</span><h2 id="story-h">من أول رسالة… لآخر صورة بالعرس</h2></div>
    <div class="story">
      <div class="story__media">
        ${img(P.palette, 'اختيار ألوان المكياج المناسبة للعروس', { ratio: 1.25 })}
        ${img(P.mua, 'جلسة تجربة مكياج العروس', { ratio: 1.25 })}
        ${img(P.bride2, 'العروس بإطلالتها النهائية يوم العرس', { ratio: 1.25 })}
      </div>
      <div>
        <div class="step" data-step="0"><span class="step__n">01</span><h3>استشارة واختيار الستايل</h3><p class="muted">ابعتيلنا صورة الفستان والستايل اللي بتحبيه، ونقترح عليكِ الألوان والتسريحة اللي بتناسب ملامحك ولون بشرتك.</p></div>
        <div class="step" data-step="1"><span class="step__n">02</span><h3>جلسة التجربة</h3><p class="muted">نجرّب الإطلالة قبل العرس ونعدّل لحد ما تحسّي إنها إنتِ، بس بأحلى نسخة.</p></div>
        <div class="step" data-step="2"><span class="step__n">03</span><h3>يوم العرس</h3><p class="muted">بالصالون أو ببيتك، نجهّزك بهدوء وعلى الوقت، بمكياج ثابت لآخر الليل وتسريحة ما بتتحرك.</p><p><a class="btn" href="/bridal-makeup/">باقات العرائس ${I.arrow}</a></p></div>
      </div>
    </div>
  </div>
</section>

<section class="sec" aria-labelledby="home-h">
  <div class="wrap split split--rev">
    <div data-reveal>
      <span class="eyebrow">خدمة تجميل منزلية</span>
      <h2 id="home-h" style="font-size:clamp(2rem,4.4vw,3.4rem)">الصالون بيجي لعندك</h2>
      <p class="muted">ما بدك تطلعي؟ نجيكِ عالبيت أو مكان التجهيز بكامل الأدوات والإضاءة، وإنتِ مرتاحة بين أهلك.</p>
      <ul class="ticks"><li>مكياج وتسريحات للعروس والمرافقات</li><li>أدوات معقّمة ومنتجات احترافية</li><li>مواعيد مرنة حسب مناسبتك</li></ul>
      <a class="btn" href="/home-service/">تفاصيل الخدمة المنزلية ${I.arrow}</a>
    </div>
    <div class="split__img" data-reveal="clip">${img(P.mua2, 'خبيرة مكياج تجهّز عميلة في منزلها')}
      <div class="split__badge"><b>نجيكِ لوين ما كنتِ</b>${B.city} والمناطق القريبة</div></div>
  </div>
</section>

<section class="sec sec--plum" aria-labelledby="gal-h">
  <div class="wrap">
    <div class="sec__head center" data-reveal><span class="eyebrow">إلهام</span><h2 id="gal-h">تفاصيل بتصنع الفرق</h2><p class="muted">تابعي أحدث أعمالنا على <a href="${B.ig}" target="_blank" rel="noopener" style="color:var(--gold-2)">إنستغرام</a>.</p></div>
    <div class="gallery">${[[P.lips, 'مكياج شفاه وردي ناعم'], [P.hair2, 'تسريحة شعر في الصالون'], [P.nails2, 'مناكير وردي فاتح'], [P.brushes, 'فراشي مكياج احترافية'], [P.bride3, 'عروس بباقة ورد'], [P.facial, 'جلسة عناية بالبشرة'], [P.salon, 'داخل صالون التجميل'], [P.lashes, 'تركيب رموش'], [P.cosmetics, 'مستحضرات تجميل']]
      .map(([id, alt], i) => `<figure>${img(id, alt, { ratio: [1.3, 1, 1.5][i % 3], sizes: '(max-width:600px) 100vw, 33vw', widths: [400, 700, 1000] })}</figure>`).join('')}</div>
  </div>
</section>

<section class="sec sec--light" aria-labelledby="why-h">
  <div class="wrap">
    <div class="sec__head center" data-reveal><span class="eyebrow">ليش براءة؟</span><h2 id="why-h">لأن إطلالتك تستاهل الأفضل</h2></div>
    <div class="feats">
      <div class="feat" data-reveal style="--d:0">${I.crown}<h3>خبرة بالعرائس</h3><p>إطلالات عرائس تجمع بين الفخامة والنعومة وتناسب الذوق الأردني.</p></div>
      <div class="feat" data-reveal style="--d:1">${I.shield}<h3>نظافة وتعقيم</h3><p>أدوات معقّمة لكل عميلة ومنتجات احترافية أصلية.</p></div>
      <div class="feat" data-reveal style="--d:2">${I.home}<h3>خدمة منزلية</h3><p>نجيكِ لبيتك أو مكان التجهيز بكل المعدات.</p></div>
      <div class="feat" data-reveal style="--d:3">${I.clock}<h3>التزام بالوقت</h3><p>جدول واضح يوم المناسبة، بدون توتر ولا تأخير.</p></div>
    </div>
  </div>
</section>

${faqBlock(faqHome)}
${ctaBlock()}`,
});

// ---------- landing page factory ----------
const landing = ({ path, crumb, title, desc, h1, h1Shine, eyebrow, lead, hero, ogImg, sections, faq, service }) => page({
  path, title, desc, lcp: hero, ogImg: ogImg || hero,
  schema: [serviceLD(crumb, desc, path), faqLD(faq), crumbLD([['الرئيسية', '/'], [crumb, path]])],
  body: `
<section class="hero hero--page" aria-labelledby="h1">
  ${heroMedia([[hero, h1]])}
  <div class="wrap">
    <nav class="crumbs" aria-label="مسار التنقل"><ol><li><a href="/">الرئيسية</a></li><li aria-current="page">${crumb}</li></ol></nav>
    <span class="eyebrow">${eyebrow}</span>
    <h1 id="h1">${words(h1, h1Shine)}</h1>
    <p class="hero__lead">${lead}</p>
    ${ctas()}
  </div>
</section>
${sections}
${faqBlock(faq, `أسئلة شائعة عن ${crumb}`)}
${ctaBlock()}`,
});

const feats = list => `<div class="feats">${list.map(([ic, t, p], i) => `<div class="feat" data-reveal style="--d:${i}">${I[ic]}<h3>${t}</h3><p>${p}</p></div>`).join('')}</div>`;
const splitSec = ({ eyebrow, h, p, ticks, imgId, alt, rev = false, plum = false, badge }) => `<section class="sec${plum ? ' sec--plum' : ''}"><div class="wrap split${rev ? ' split--rev' : ''}">
  ${rev ? '' : `<div class="split__img" data-reveal="clip">${img(imgId, alt)}${badge ? `<div class="split__badge">${badge}</div>` : ''}</div>`}
  <div data-reveal><span class="eyebrow">${eyebrow}</span><h2 style="font-size:clamp(1.9rem,4vw,3.1rem)">${h}</h2><p class="muted">${p}</p>
  <ul class="ticks">${ticks.map(t => `<li>${t}</li>`).join('')}</ul><a class="btn" href="${B.wa}" target="_blank" rel="noopener">${I.wa}اسألينا على واتساب</a></div>
  ${rev ? `<div class="split__img" data-reveal="clip">${img(imgId, alt)}${badge ? `<div class="split__badge">${badge}</div>` : ''}</div>` : ''}
</div></section>`;

const bridal = landing({
  path: '/bridal-makeup/', crumb: 'مكياج العرائس', hero: P.bride,
  title: `مكياج عرايس في ${B.city} | ${B.name}`,
  desc: `مكياج عرائس احترافي في ${B.city} مع جلسة تجربة وتسريحة وتجهيز المرافقات، بالصالون أو في البيت. احجزي يوم عرسك مع ${B.name}.`,
  eyebrow: `مكياج عرايس · ${B.city}`, h1: 'إطلالة ليلة العمر بتوقيع براءة', h1Shine: 3,
  lead: 'مكياج عرائس ثابت وناعم، تسريحة بتليق بفستانك، وتجهيز كامل لك ولأهلك. بالصالون أو ببيتك.',
  faq: faqBridal,
  sections: `
<section class="sec sec--light"><div class="wrap">
  <div class="sec__head" data-reveal><span class="eyebrow">باقة العروس</span><h2>كل تفصيلة محسوبة ليومك</h2><p class="muted">نشتغل معك خطوة بخطوة من الاستشارة لحد آخر صورة.</p></div>
  ${feats([['sparkle', 'تحضير البشرة', 'ترطيب وتجهيز يخلي المكياج يندمج طبيعي ويثبت أطول.'], ['crown', 'مكياج العروس', 'ستايل ناعم أو جلام حسب ذوقك وفستانك.'], ['heart', 'التسريحة', 'رفعة، ويفي أو تسريحة مع الطرحة والتاج.'], ['home', 'تجهيز بالبيت', 'نجيكِ لبيتك أو مكان التجهيز يوم العرس.']])}
</div></section>
${splitSec({ eyebrow: 'جلسة التجربة', h: 'جرّبي إطلالتك قبل العرس', p: 'بجلسة التجربة نختار الألوان والرموش والتسريحة مع بعض، لتكوني مطمّنة يوم العرس.', ticks: ['اختيار الستايل حسب الفستان', 'تعديل لحد ما تكوني راضية 100%', 'تصوير الإطلالة للرجوع إلها'], imgId: P.mua, alt: 'جلسة تجربة مكياج للعروس', plum: true, badge: '<b>جلسة تجربة</b>قبل العرس' })}
${splitSec({ eyebrow: 'العروس والمرافقات', h: 'جهّزي أهلك وصاحباتك معك', p: 'باقة متكاملة للعروس والأم والأخوات والصديقات بنفس اليوم.', ticks: ['مكياج وتسريحات للمرافقات', 'تنظيم المواعيد حسب وقت الزفة', 'بالصالون أو بالبيت'], imgId: P.bride3, alt: 'عروس مع باقة الورد', rev: true })}`,
});

const mua = landing({
  path: '/makeup-artist/', crumb: 'ميك أب آرتست', hero: P.mua,
  title: `ميك أب آرتست في ${B.city} | مكياج سهرات ومناسبات – ${B.name}`,
  desc: `ميك أب آرتست في ${B.city}: مكياج سهرات، خطوبة، تخرّج ومناسبات بستايل سوفت جلام أو سموكي، مع تسريحات. احجزي مع ${B.name} عبر واتساب.`,
  eyebrow: `ميك أب آرتست · ${B.city}`, h1: 'مكياج يحكي عنكِ قبل ما تحكي', h1Shine: 2,
  lead: 'سوفت جلام، سموكي أو ناعم ونهاري: مكياج مصمّم لملامحك ومناسبتك، بإيدين خبيرة مكياج محترفة.',
  faq: faqMua,
  sections: `
<section class="sec sec--light"><div class="wrap">
  <div class="sec__head" data-reveal><span class="eyebrow">ستايلات المكياج</span><h2>لكل مناسبة إطلالتها</h2></div>
  ${feats([['sparkle', 'سوفت جلام', 'إشراقة ناعمة وبشرة مثالية للسهرات والخطوبة.'], ['crown', 'سموكي آيز', 'عيون جريئة لإطلالة مسائية فخمة.'], ['heart', 'مكياج ناعم', 'لمسة طبيعية للتخرّج والعزائم والجلسات.'], ['clock', 'مكياج سريع', 'لما يكون وقتك ضيق وبدك نتيجة مرتبة.']])}
</div></section>
${splitSec({ eyebrow: 'منتجات وأدوات', h: 'منتجات احترافية وأدوات معقّمة', p: 'صحة بشرتك أولويتنا: نستخدم منتجات أصلية ونعقّم كل الأدوات والفراشي لكل عميلة.', ticks: ['منتجات أصلية مقاومة للتعرّق', 'فراشي وأدوات معقّمة', 'اختيار درجات تناسب لون بشرتك'], imgId: P.brushes, alt: 'فراشي مكياج احترافية', plum: true })}
${splitSec({ eyebrow: 'تسريحات', h: 'كمّلي الإطلالة بتسريحة', p: 'سشوار، ويفي أو رفعة سهرة، نخطط المكياج والتسريحة كقطعة وحدة.', ticks: ['تسريحات سهرة وعرائس', 'سشوار ناعم ولمّاع', 'تثبيت يدوم طوال المناسبة'], imgId: P.curl, alt: 'تسريحة شعر بالمكواة', rev: true })}`,
});

const homeSvc = landing({
  path: '/home-service/', crumb: 'خدمة تجميل منزلية', hero: P.mua2,
  title: `خدمة تجميل منزلية في ${B.city} | مكياج وتسريحات بالبيت – ${B.name}`,
  desc: `خدمة مكياج وتسريحات منزلية في ${B.city} والمناطق القريبة: للعروس والسهرات والمرافقات، بأدوات معقّمة ومنتجات احترافية. احجزي عبر واتساب.`,
  eyebrow: `خدمة منزلية · ${B.city}`, h1: 'الصالون بيجي لعندك', h1Shine: 2,
  lead: 'مكياج وتسريحات في بيتك أو مكان التجهيز. نجيب كل الأدوات والإضاءة، وإنتِ استمتعي بوقتك مع أهلك.',
  faq: faqHomeSvc,
  sections: `
<section class="sec sec--light"><div class="wrap">
  <div class="sec__head" data-reveal><span class="eyebrow">كيف بتشتغل الخدمة؟</span><h2>ثلاث خطوات وبنكون عندك</h2></div>
  ${feats([['wa', 'ابعتي رسالة', 'اكتبي الخدمة والتاريخ وعدد الأشخاص وموقعك على واتساب.'], ['clock', 'نأكد الموعد', 'نرتب معك الوقت المناسب ونوضح التفاصيل كاملة.'], ['home', 'بنوصل لعندك', 'نجي بكامل المعدات ونجهّزك وإنتِ مرتاحة.']])}
</div></section>
${splitSec({ eyebrow: 'شو بنقدّم بالبيت؟', h: 'كل خدمات التجهيز للمناسبات', p: 'من العروس لأصغر بنت بالعيلة، نجهّز الكل بنفس المكان.', ticks: ['مكياج عرائس وسهرات', 'تسريحات وسشوار', 'تجهيز المرافقات والأهل'], imgId: P.hair2, alt: 'تسريحة شعر في المنزل', plum: true, badge: `<b>${B.city}</b>والمناطق القريبة` })}`,
});

const notFound = page({
  path: '/404.html', ogImg: P.cosmetics, title: `الصفحة غير موجودة | ${B.name}`, desc: 'الصفحة المطلوبة غير موجودة.',
  body: `<section class="hero hero--page"><div class="wrap"><span class="eyebrow">404</span><h1>${words('الصفحة مش موجودة', 2)}</h1><p class="hero__lead">يمكن الرابط تغيّر. ارجعي للرئيسية أو احجزي مباشرة.</p><div class="hero__cta"><a class="btn" href="/">الرئيسية</a></div></div></section>`,
}).replace('index,follow', 'noindex');

// ---------- write ----------
rmSync(OUT, { recursive: true, force: true });
const pages = { '/': home, '/bridal-makeup/': bridal, '/makeup-artist/': mua, '/home-service/': homeSvc };
for (const [p, html] of Object.entries(pages)) {
  mkdirSync(OUT + p, { recursive: true });
  writeFileSync(`${OUT}${p}index.html`, minify.html(rebase(html)));
}
writeFileSync(`${OUT}/404.html`, minify.html(rebase(notFound)));
writeFileSync(`${OUT}/styles.css`, minify.css(await (await import('node:fs/promises')).readFile('src/styles.css', 'utf8')));
copyFileSync('src/main.js', `${OUT}/main.js`);
copyFileSync('src/favicon.svg', `${OUT}/favicon.svg`);
writeFileSync(`${OUT}/.nojekyll`, '');
writeFileSync(`${OUT}/robots.txt`, `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
writeFileSync(`${OUT}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(pages).map(p => `  <url><loc>${SITE}${p}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(`${OUT}/site.webmanifest`, JSON.stringify({ name: B.name, short_name: 'براءة', lang: 'ar', dir: 'rtl', start_url: BASE + '/', display: 'standalone', background_color: '#120a0f', theme_color: '#120a0f', icons: [{ src: BASE + '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }] }));
writeFileSync(`${OUT}/llms.txt`, `# ${B.name} (${B.nameEn})

> صالون تجميل نسائي في ${B.city}، الأردن. مكياج عرائس وسهرات، ميك أب آرتست، تسريحات شعر، عناية بالبشرة، مناكير وبديكير، رموش وحواجب، وخدمة تجميل منزلية.

- المدينة: ${B.city}، الأردن
- الهاتف وواتساب للحجز: ${B.phone}
- إنستغرام: ${B.ig}
- فيسبوك: ${B.fb}
- سناب شات: ${B.snap}

## الصفحات
- [الرئيسية](${SITE}/): نظرة عامة على الخدمات والحجز
- [مكياج العرائس في ${B.city}](${SITE}/bridal-makeup/): باقة العروس وجلسة التجربة وتجهيز المرافقات
- [ميك أب آرتست في ${B.city}](${SITE}/makeup-artist/): مكياج سهرات ومناسبات وتسريحات
- [خدمة تجميل منزلية](${SITE}/home-service/): مكياج وتسريحات في المنزل

## الخدمات
${services.map(s => `- ${s.t}: ${s.d}`).join('\n')}
`);
console.log('built ->', OUT, 'SITE =', SITE);
