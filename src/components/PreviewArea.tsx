'use client';

import { useThemeStore } from '@/store/useThemeStore';
import s from './Preview.module.css';

function SectionDivider({ label }: { label: string }) {
  return (
    <div className={s.sectionDivider}>
      <div className={s.sectionDividerLine} />
      <span className={s.sectionDividerLabel}>{label}</span>
      <div className={s.sectionDividerLine} />
    </div>
  );
}

/* ═══ Navbar ═══ */
function NavbarPreview() {
  return (
    <div className={s.pNavbar}>
      <div className={s.pNavLogo}>BrandUI</div>
      <div className={s.pNavLinks}>
        <span className={s.pNavLink}>Dashboard</span>
        <span className={s.pNavLink}>Products</span>
        <span className={s.pNavLink}>Analytics</span>
        <span className={s.pNavLink}>Settings</span>
      </div>
      <div className={s.pNavActions}>
        <button className={`${s.pBtn} ${s.pBtnGhost} ${s.pBtnSm}`}>Sign In</button>
        <button className={`${s.pBtn} ${s.pBtnPrimary} ${s.pBtnSm}`}>Get Started</button>
      </div>
    </div>
  );
}

/* ═══ Hero ═══ */
function HeroPreview() {
  return (
    <div className={s.pHero}>
      <div className={s.pHeroBadge}>✨ New Release v3.0</div>
      <h1 className={s.pHeroTitle}>Build beautiful products<br />faster than ever</h1>
      <p className={s.pHeroSubtitle}>A design system that adapts to your brand. One color change transforms your entire interface with intelligent color science.</p>
      <div className={s.pHeroActions}>
        <button className={`${s.pBtn} ${s.pBtnPrimary} ${s.pBtnLg}`}>Start Free Trial</button>
        <button className={`${s.pBtn} ${s.pBtnSecondary} ${s.pBtnLg}`}>View Demo</button>
      </div>
    </div>
  );
}

/* ═══ Cards ═══ */
function CardPreview() {
  const cards = [
    { icon: '📊', title: 'Analytics', desc: 'Track user behavior and conversion metrics in real-time.', stat: '12,450', label: '+15% this week' },
    { icon: '💰', title: 'Revenue', desc: 'Monitor revenue streams and financial performance.', stat: '$45.2K', label: '+8% this week' },
    { icon: '👥', title: 'Active Users', desc: 'See how many users are engaging with your product.', stat: '1,204', label: 'Live now' },
  ];
  return (
    <div className={s.pCardGrid}>
      {cards.map((c, i) => (
        <div key={i} className={s.pCard}>
          <div className={s.pCardIcon}>{c.icon}</div>
          <div className={s.pCardTitle}>{c.title}</div>
          <div className={s.pCardDesc}>{c.desc}</div>
          <div className={s.pCardStat}>{c.stat}</div>
          <span className={`${s.pBadge} ${s.pBadgePrimary}`}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══ Buttons ═══ */
function ButtonPreview() {
  return (
    <div style={{ padding: '32px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', fontFamily: 'var(--t-font)' }}>
      <button className={`${s.pBtn} ${s.pBtnPrimary}`}>Primary</button>
      <button className={`${s.pBtn} ${s.pBtnSecondary}`}>Secondary</button>
      <button className={`${s.pBtn} ${s.pBtnGhost}`}>Ghost</button>
      <button className={`${s.pBtn} ${s.pBtnAccent}`}>Gradient</button>
      <button className={`${s.pBtn} ${s.pBtnDisabled}`}>Disabled</button>
      <button className={`${s.pBtn} ${s.pBtnPrimary} ${s.pBtnSm}`}>Small</button>
      <button className={`${s.pBtn} ${s.pBtnPrimary} ${s.pBtnLg}`}>Large</button>
    </div>
  );
}

/* ═══ Alerts ═══ */
function AlertPreview() {
  return (
    <div className={s.pAlertGrid}>
      <div className={`${s.pAlert} ${s.pAlertSuccess}`}>✓ Your changes have been saved successfully.</div>
      <div className={`${s.pAlert} ${s.pAlertWarning}`}>⚠ Your trial expires in 3 days.</div>
      <div className={`${s.pAlert} ${s.pAlertError}`}>✕ Failed to process payment. Please try again.</div>
      <div className={`${s.pAlert} ${s.pAlertInfo}`}>ℹ A new update is available for your account.</div>
    </div>
  );
}

/* ═══ Forms ═══ */
function FormPreview() {
  return (
    <div className={s.pFormSection}>
      <div className={s.pFormGrid}>
        <div className={s.pFormGroup}>
          <label className={s.pFormLabel}>First Name</label>
          <input className={s.pInput} placeholder="John" readOnly />
        </div>
        <div className={s.pFormGroup}>
          <label className={s.pFormLabel}>Last Name</label>
          <input className={s.pInput} placeholder="Doe" readOnly />
        </div>
        <div className={s.pFormGroup}>
          <label className={s.pFormLabel}>Email</label>
          <input className={s.pInput} placeholder="john@example.com" readOnly />
        </div>
        <div className={s.pFormGroup}>
          <label className={s.pFormLabel}>Phone (Disabled)</label>
          <input className={`${s.pInput} ${s.pInputDisabled}`} placeholder="Not available" disabled readOnly />
        </div>
        <div className={s.pFormGroup} style={{ gridColumn: '1 / -1' }}>
          <label className={s.pFormLabel}>Message</label>
          <textarea className={s.pTextarea} placeholder="Type your message here..." readOnly />
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
        <button className={`${s.pBtn} ${s.pBtnPrimary}`}>Submit</button>
        <button className={`${s.pBtn} ${s.pBtnSecondary}`}>Cancel</button>
      </div>
    </div>
  );
}

/* ═══ Badges ═══ */
function BadgePreview() {
  return (
    <div className={s.pBadgeRow}>
      <span className={`${s.pBadge} ${s.pBadgePrimary}`}>Primary</span>
      <span className={`${s.pBadge} ${s.pBadgeSuccess}`}>✓ Success</span>
      <span className={`${s.pBadge} ${s.pBadgeWarning}`}>⚠ Warning</span>
      <span className={`${s.pBadge} ${s.pBadgeError}`}>✕ Error</span>
      <span className={`${s.pBadge} ${s.pBadgeAccent}`}>Featured</span>
      <span className={`${s.pBadge} ${s.pBadgePrimary}`}>New</span>
      <span className={`${s.pBadge} ${s.pBadgeSuccess}`}>Active</span>
      <span className={`${s.pBadge} ${s.pBadgeError}`}>Expired</span>
    </div>
  );
}

/* ═══ Tabs ═══ */
function TabsPreview() {
  return (
    <div className={s.pTabsWrap}>
      <div className={s.pTabList}>
        <button className={`${s.pTab} ${s.pTabActive}`}>Overview</button>
        <button className={s.pTab}>Analytics</button>
        <button className={s.pTab}>Reports</button>
        <button className={s.pTab}>Settings</button>
      </div>
      <div className={s.pTabContent}>
        This is the overview tab content. Your theme tokens are applied consistently across all tab states — active, hover, and default — maintaining visual cohesion throughout the interface.
      </div>
    </div>
  );
}

/* ═══ Pricing ═══ */
function PricingPreview() {
  const plans = [
    { name: 'Starter', price: '$9', features: ['5 Projects', '10GB Storage', 'Email Support', 'Basic Analytics'] },
    { name: 'Pro', price: '$29', features: ['Unlimited Projects', '100GB Storage', 'Priority Support', 'Advanced Analytics', 'Custom Domains'], featured: true },
    { name: 'Enterprise', price: '$99', features: ['Everything in Pro', '1TB Storage', '24/7 Support', 'SSO & SAML', 'Dedicated Manager'] },
  ];
  return (
    <div className={s.pPricingGrid}>
      {plans.map((p, i) => (
        <div key={i} className={`${s.pPricingCard} ${p.featured ? s.pPricingFeatured : ''}`}>
          {p.featured && <div className={s.pPricingBadge}>Most Popular</div>}
          <div className={s.pPricingName}>{p.name}</div>
          <div className={s.pPricingPrice}>{p.price}</div>
          <div className={s.pPricingPeriod}>per month</div>
          <ul className={s.pPricingFeatures}>
            {p.features.map((f, j) => (
              <li key={j} className={s.pPricingFeature}>
                <span className={s.pFeatureCheck}>✓</span> {f}
              </li>
            ))}
          </ul>
          <button className={`${s.pBtn} ${p.featured ? s.pBtnPrimary : s.pBtnSecondary}`} style={{ width: '100%' }}>
            {p.featured ? 'Start Free Trial' : 'Get Started'}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ═══ Testimonials ═══ */
function TestimonialPreview() {
  const items = [
    { quote: 'This theme engine completely transformed how we approach design. One color change and the entire system stays consistent.', name: 'Sarah Chen', role: 'Head of Design, TechCo', initials: 'SC' },
    { quote: 'We shipped our rebrand in half the time. The auto-generated palettes are incredibly well-balanced.', name: 'Marcus Johnson', role: 'CTO, StartupXYZ', initials: 'MJ' },
  ];
  return (
    <div className={s.pTestimonialGrid}>
      {items.map((t, i) => (
        <div key={i} className={s.pTestimonialCard}>
          <div className={s.pTestimonialQuote}>&ldquo;{t.quote}&rdquo;</div>
          <div className={s.pTestimonialAuthor}>
            <div className={s.pTestimonialAvatar}>{t.initials}</div>
            <div>
              <div className={s.pTestimonialName}>{t.name}</div>
              <div className={s.pTestimonialRole}>{t.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══ Blog ═══ */
function BlogPreview() {
  const posts = [
    { tag: 'Design', title: 'Building Scalable Design Systems', excerpt: 'Learn how to create design tokens that scale across multiple products and brands.', date: 'May 10, 2026' },
    { tag: 'Engineering', title: 'HSL Color Science for Developers', excerpt: 'Understanding how hue, saturation, and lightness create harmonious palettes.', date: 'May 8, 2026' },
  ];
  return (
    <div className={s.pBlogGrid}>
      {posts.map((p, i) => (
        <div key={i} className={s.pBlogCard}>
          <div className={s.pBlogImage}>{i === 0 ? '🎨' : '⚙️'}</div>
          <div className={s.pBlogBody}>
            <span className={s.pBlogTag}>{p.tag}</span>
            <div className={s.pBlogTitle}>{p.title}</div>
            <div className={s.pBlogExcerpt}>{p.excerpt}</div>
            <div className={s.pBlogMeta}>{p.date} · 5 min read</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══ Footer ═══ */
function FooterPreview() {
  return (
    <div className={s.pFooter}>
      <div className={s.pFooterGrid}>
        <div>
          <div className={s.pFooterBrand}>BrandUI</div>
          <div className={s.pFooterDesc}>A premium theme engine that transforms your brand identity with intelligent color science. One color, infinite possibilities.</div>
        </div>
        {[
          { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Docs'] },
          { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
          { title: 'Legal', links: ['Privacy', 'Terms', 'License', 'Security'] },
        ].map((col, i) => (
          <div key={i}>
            <div className={s.pFooterHeading}>{col.title}</div>
            <ul className={s.pFooterLinks}>
              {col.links.map(link => <li key={link} className={s.pFooterLink}>{link}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className={s.pFooterBottom}>
        <span>© 2026 BrandUI. All rights reserved.</span>
        <span>Crafted By <a href="https://www.linkedin.com/in/nirmal-rathod23/">Nirmal Rathod</a> </span>
      </div>
    </div>
  );
}

/* ═══ Contact Form ═══ */
function ContactPreview() {
  return (
    <div className={s.pContactSection}>
      <div className={s.pContactTitle}>Get in Touch</div>
      <div className={s.pContactSubtitle}>Have a question or want to work together? We&apos;d love to hear from you.</div>
      <div className={s.pContactForm}>
        <input className={s.pInput} placeholder="Your name" readOnly />
        <input className={s.pInput} placeholder="Your email" readOnly />
        <textarea className={s.pTextarea} placeholder="Your message..." readOnly />
        <button className={`${s.pBtn} ${s.pBtnPrimary}`} style={{ width: '100%' }}>Send Message</button>
      </div>
    </div>
  );
}

/* ═══ Sidebar Preview ═══ */
function SidebarLayoutPreview() {
  return (
    <div className={s.pSidebarPreview}>
      <div className={s.pSidebarNav}>
        <div className={s.pSidebarBrand}>BrandUI</div>
        <div className={`${s.pSidebarItem} ${s.pSidebarItemActive}`}>📊 Dashboard</div>
        <div className={s.pSidebarItem}>👥 Users</div>
        <div className={s.pSidebarItem}>📦 Products</div>
        <div className={s.pSidebarItem}>📈 Analytics</div>
        <div className={s.pSidebarItem}>⚙️ Settings</div>
      </div>
      <div className={s.pSidebarContent}>
        <div className={s.pSidebarContentTitle}>Dashboard</div>
        <div className={s.pSidebarContentDesc}>Welcome back! Here&apos;s an overview of your project metrics. The sidebar navigation adapts to your theme, maintaining clear visual hierarchy with active state highlighting.</div>
      </div>
    </div>
  );
}

/* ═══ Modal Preview ═══ */
function ModalPreview() {
  return (
    <div className={s.pModalOverlay}>
      <div className={s.pModal}>
        <div className={s.pModalHeader}>
          <div className={s.pModalTitle}>Confirm Action</div>
          <button className={s.pModalClose}>✕</button>
        </div>
        <div className={s.pModalBody}>
          Are you sure you want to proceed? This action will apply your theme changes across all components and cannot be undone.
        </div>
        <div className={s.pModalFooter}>
          <button className={`${s.pBtn} ${s.pBtnSecondary}`}>Cancel</button>
          <button className={`${s.pBtn} ${s.pBtnPrimary}`}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main Preview Area
   ═══════════════════════════════════════════════════════════════════ */

const DEVICE_WIDTHS = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

export default function PreviewArea() {
  const { activePreviewSection, tokens, devicePreview } = useThemeStore();
  const show = (key: string) => activePreviewSection === 'all' || activePreviewSection === key;
  const isMobileDevice = devicePreview === 'mobile';
  const isTabletDevice = devicePreview === 'tablet';
  const isConstrained = isMobileDevice || isTabletDevice;

  return (
    <main className={s.previewContainer}>
      <div className={s.previewInner}>
        <div className={s.previewToolbar}>
          <div className={s.previewBadge}>
            <span className={s.previewBadgeDot} />
            Live Preview · {tokens.mode === 'dark' ? 'Dark' : 'Light'} Mode · {tokens.brandPersonality.charAt(0).toUpperCase() + tokens.brandPersonality.slice(1)}
          </div>
          {isConstrained && (
            <div className={s.deviceLabel}>
              {isMobileDevice ? '📲 375px' : '📱 768px'}
            </div>
          )}
        </div>

        {/* Device frame wrapper */}
        <div
          className={`${s.deviceFrame} ${isConstrained ? s.deviceFrameConstrained : ''} ${isMobileDevice ? s.deviceFrameMobile : ''}`}
          style={{ maxWidth: DEVICE_WIDTHS[devicePreview] }}
        >
          {/* Phone notch for mobile */}
          {isMobileDevice && (
            <div className={s.phoneFrame}>
              <div className={s.phoneNotch}>
                <div className={s.phoneNotchInner} />
              </div>
            </div>
          )}

          <div className={s.themedFrame}>
            {show('navbar') && <NavbarPreview />}
            {show('hero') && <HeroPreview />}
            {show('cards') && <><SectionDivider label="Cards" /><CardPreview /></>}
            {show('buttons') && <><SectionDivider label="Buttons" /><ButtonPreview /></>}
            {show('alerts') && <><SectionDivider label="Alerts & Badges" /><AlertPreview /><BadgePreview /></>}
            {show('forms') && <><SectionDivider label="Forms & Inputs" /><FormPreview /></>}
            {show('all') && <><SectionDivider label="Tabs" /><TabsPreview /></>}
            {show('all') && <><SectionDivider label="Modal" /><ModalPreview /></>}
            {show('all') && <><SectionDivider label="Sidebar Navigation" /><SidebarLayoutPreview /></>}
            {show('pricing') && <><SectionDivider label="Pricing" /><PricingPreview /></>}
            {show('testimonials') && <><SectionDivider label="Testimonials" /><TestimonialPreview /></>}
            {show('blog') && <><SectionDivider label="Blog" /><BlogPreview /></>}
            {show('all') && <><SectionDivider label="Contact" /><ContactPreview /></>}
            {show('footer') && <FooterPreview />}
          </div>
        </div>
      </div>
    </main>
  );
}
