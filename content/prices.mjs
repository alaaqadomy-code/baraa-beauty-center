// صفحة «البكجات والأسعار» (/prices/): هيكل جاهز بانتظار أرقام المالك.
// القاعدة: لا أسعار مخترعة. كل price = null حتى يرسل المالك الرقم الحقيقي بالدينار.
// التفعيل (بعد وصول الأرقام):
//   1. اكتبي كل سعر كرقم (مثلاً price: 150) واحذفي أي بند لا يريد المالك نشره.
//   2. راجعي بنود includes مع المالك (مأخوذة من نصوص الموقع الحالية فقط).
//   3. اكتبي updated بتاريخ اعتماد الأسعار (YYYY-MM-DD) واجعلي live: true.
//   4. node build.mjs: البناء يفشل عمداً إذا live = true وبقي أي سعر null.
// ما دام live = false: الصفحة لا تدخل docs/ ولا sitemap ولا القائمة ولا التذييل،
// وتُكتب نسخة معاينة محلية فقط في drafts/prices/index.html (noindex، ومتجاهلة في git).
export const prices = {
  live: false,
  updated: null,
  currency: 'دينار',
  packages: [
    { name: 'بكج العروس (الفستان الأبيض)', price: null, from: true, includes: ['مكياج العروس مع مدام براءة شخصياً', 'التسريحة', 'تثبيت الطرحة والتاج'] },
    { name: 'بكج عروس الحنّة', price: null, from: true, includes: ['مكياج الحنّة بألوان دافية', 'تسريحة أو لفّة متنسّقة مع الثوب'] },
    { name: 'بكج الخطوبة', price: null, from: true, includes: ['مكياج خطوبة (ناعم أو سوفت جلام أو جلام)', 'تسريحة أو لفّة حجاب'] },
    { name: 'بكج المرافقات (للشخص الواحد)', price: null, from: true, includes: ['مكياج', 'سشوار أو تسريحة'] },
  ],
  services: [
    { name: 'مكياج سهرة', price: null, href: '/evening-makeup/' },
    { name: 'سشوار', price: null, href: '/hair-styling/' },
    { name: 'تسريحة سهرة', price: null, href: '/hair-styling/' },
    { name: 'بروتين وكيراتين', price: null, href: '/protein-keratin/' },
    { name: 'صبغة شعر', price: null, href: '/hair-color/' },
    { name: 'مناكير وبديكير', price: null, href: '/nails/' },
    { name: 'أظافر جل', price: null, href: '/gel-nails/' },
    { name: 'تنظيف بشرة', price: null, href: '/facial/' },
    { name: 'حلاوة', price: null, href: '/halawa/' },
    { name: 'تركيب رموش', price: null, href: '/lashes/' },
    { name: 'حواجب', price: null, href: '/eyebrows/' },
  ],
};
