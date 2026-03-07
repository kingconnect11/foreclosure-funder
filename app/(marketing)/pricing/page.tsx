'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Check,
  X,
  ArrowRight,
  Sparkles,
  Zap,
  Crown,
  Building2,
  HelpCircle,
  CheckCircle2,
  Star,
  Clock,
  Shield,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

const tiers = [
  {
    name: "Free",
    icon: Star,
    price: { monthly: 0, annual: 0 },
    description: "Explore foreclosure investing",
    features: [
      { text: "2-3 listings per session", included: true },
      { text: "Address + sale date only", included: true },
      { text: "Save up to 3 properties", included: true },
      { text: "Educational content access", included: true },
      { text: "Basic property search", included: true },
      { text: "Full property details", included: false },
      { text: "Court research data", included: false },
      { text: "CRM pipeline", included: false },
      { text: "Deal analyzer", included: false },
      { text: "Property alerts", included: false },
    ],
    cta: "Get Started",
    ctaLink: "/signup",
    popular: false
  },
  {
    name: "Standard",
    icon: Zap,
    price: { monthly: 20, annual: 16 },
    description: "Everything a serious investor needs",
    features: [
      { text: "Unlimited property listings", included: true },
      { text: "Full property details", included: true },
      { text: "Court research data", included: true },
      { text: "Appraisal data (beds, baths, sqft)", included: true },
      { text: "Full CRM pipeline (12 stages)", included: true },
      { text: "Unlimited property saves", included: true },
      { text: "Property alerts", included: true },
      { text: "Deal analyzer (flip/rental/wholesale)", included: true },
      { text: "Onboarding interview", included: true },
      { text: "Mobile access", included: true },
    ],
    cta: "Start Free Trial",
    ctaLink: "/signup",
    popular: true,
    badge: "Most Popular"
  },
  {
    name: "Premium",
    icon: Sparkles,
    price: { monthly: 40, annual: 32 },
    description: "Advanced tools for power users",
    features: [
      { text: "Everything in Standard", included: true },
      { text: "Priority notifications", included: true },
      { text: "Comparable sales data", included: true },
      { text: "Maps & satellite imagery", included: true },
      { text: "Document preparation services", included: true },
      { text: "Portfolio analytics", included: true },
      { text: "CSV import for owned properties", included: true },
      { text: "Zapier integration setup", included: true },
      { text: "Priority email support", included: true },
      { text: "AI voice agent (coming soon)", included: false, comingSoon: true },
    ],
    cta: "Start Free Trial",
    ctaLink: "/signup",
    popular: false
  }
];

const dealRoomTier = {
  name: "Deal Room",
  icon: Building2,
  setupPrice: 1100,
  seatPrice: 29,
  description: "For real estate agents managing investor groups",
  features: [
    { text: "Custom branded deal room", included: true },
    { text: "Agent admin panel", included: true },
    { text: "Investor management tools", included: true },
    { text: "Group notes sharing", included: true },
    { text: "Activity feed dashboard", included: true },
    { text: "Full onboarding meeting with founders", included: true },
    { text: "Group onboarding session (30-45 min)", included: true },
    { text: "Up to 2 custom feature requests", included: true },
    { text: "Homeowner outreach automation (coming soon)", included: false, comingSoon: true },
    { text: "Weekly investor digests", included: true },
    { text: "7-day free trial per seat", included: true },
  ],
  cta: "Contact Sales",
  ctaLink: "/contact",
  popular: false
};

const faqs = [
  {
    question: "Can I upgrade or downgrade at any time?",
    answer: "Yes, you can change your plan at any time. Upgrades take effect immediately. Downgrades take effect at the end of your current billing period."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes, Standard and Premium tiers include a 7-day free trial. No credit card required to start. Deal Room seats also include a 7-day trial."
  },
  {
    question: "What happens when I hit the free tier limits?",
    answer: "You'll be prompted to upgrade to continue viewing full property details and accessing premium features. Your saved properties will be preserved for 30 days."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee for all paid tiers. If Foreclosure Funder is not right for you, contact us for a full refund."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards through Stripe. Annual plans receive a 20% discount compared to monthly billing."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use Supabase Row-Level Security (RLS) to ensure your data is only accessible to you. All data is encrypted in transit and at rest."
  }
];

function PricingCard({ 
  tier, 
  billingPeriod,
  index 
}: { 
  tier: typeof tiers[0]; 
  billingPeriod: 'monthly' | 'annual';
  index: number;
}) {
  const Icon = tier.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className={cn(
        "relative rounded-2xl border p-6 lg:p-8 flex flex-col",
        tier.popular 
          ? "bg-surface border-accent shadow-zen-xl scale-105 z-10" 
          : "bg-surface border-border shadow-zen"
      )}
    >
      {tier.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1.5 bg-accent text-white text-sm font-semibold rounded-full shadow-lg">
            {tier.badge}
          </span>
        </div>
      )}

      <div className="mb-6">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-accent" />
        </div>
        <h3 className="font-display text-2xl font-bold text-foreground mb-1">
          {tier.name}
        </h3>
        <p className="text-sm text-ink-500">{tier.description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="font-display text-4xl font-bold text-foreground">
            ${billingPeriod === 'monthly' ? tier.price.monthly : tier.price.annual}
          </span>
          {tier.price.monthly > 0 && (
            <span className="text-ink-500">/month</span>
          )}
        </div>
        {billingPeriod === 'annual' && tier.price.monthly > 0 && (
          <p className="text-sm text-success mt-1">
            Save ${(tier.price.monthly - tier.price.annual) * 12}/year
          </p>
        )}
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {tier.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            {feature.included ? (
              <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 text-ink-300 shrink-0 mt-0.5" />
            )}
            <span className={cn(
              "text-sm",
              feature.included ? "text-ink-600" : "text-ink-400"
            )}>
              {feature.text}
              {'comingSoon' in feature && feature.comingSoon && (
                <span className="ml-2 text-xs text-warning">(Coming soon)</span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={tier.ctaLink}
        className={cn(
          "block w-full text-center py-3 px-4 rounded-xl font-semibold transition-all",
          tier.popular
            ? "bg-accent text-white hover:bg-accent-hover shadow-zen hover:shadow-zen-lg"
            : "bg-rice-100 text-foreground hover:bg-rice-200 border border-border"
        )}
      >
        {tier.cta}
      </Link>
    </motion.div>
  );
}

function DealRoomCard() {
  const Icon = dealRoomTier.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative rounded-2xl border border-indigo/30 bg-gradient-to-br from-indigo/5 to-surface p-6 lg:p-8"
    >
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <div className="w-12 h-12 rounded-xl bg-indigo/10 flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-indigo" />
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
            {dealRoomTier.name}
          </h3>
          <p className="text-ink-500 mb-6">{dealRoomTier.description}</p>
          
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-display text-4xl font-bold text-foreground">
              ${dealRoomTier.setupPrice.toLocaleString()}
            </span>
            <span className="text-ink-500">setup</span>
          </div>
          <p className="text-sm text-ink-500">
            + ${dealRoomTier.seatPrice}/seat/month
          </p>
        </div>

        <div>
          <ul className="space-y-3 mb-6">
            {dealRoomTier.features.slice(0, 6).map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo shrink-0 mt-0.5" />
                <span className="text-sm text-ink-600">{feature.text}</span>
              </li>
            ))}
          </ul>
          <Link
            href={dealRoomTier.ctaLink}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo text-white rounded-xl font-semibold hover:bg-indigo-dark transition-colors"
          >
            {dealRoomTier.cta}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="border-b border-border last:border-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-5 text-left"
      >
        <span className="font-medium text-foreground pr-8">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowRight className="w-5 h-5 text-ink-400 rotate-90" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-ink-500 leading-relaxed">{answer}</p>
      </motion.div>
    </motion.div>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-rice-50 to-background" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
          Simple, Transparent Pricing
        </span>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
          Invest in Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-vermillion-dark">
            Success
          </span>
        </h1>
        <p className="text-lg lg:text-xl text-ink-500 max-w-2xl mx-auto">
          Start free and upgrade when you are ready. No hidden fees. Cancel anytime.
        </p>
      </motion.div>
    </section>
  );
}

function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  
  return (
    <section className="py-12 lg:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2 p-1 bg-rice-100 rounded-xl">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                billingPeriod === 'monthly'
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-ink-500 hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                billingPeriod === 'annual'
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-ink-500 hover:text-foreground"
              )}
            >
              Annual
              <span className="ml-1.5 text-xs text-success">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-16">
          {tiers.map((tier, index) => (
            <PricingCard 
              key={tier.name} 
              tier={tier} 
              billingPeriod={billingPeriod}
              index={index}
            />
          ))}
        </div>

        {/* Deal Room CTA */}
        <div className="max-w-4xl mx-auto">
          <DealRoomCard />
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  const allFeatures = [
    { name: "Property Listings", free: "2-3 per session", standard: "Unlimited", premium: "Unlimited" },
    { name: "Property Details", free: "Address + sale date", standard: "Full details", premium: "Full details" },
    { name: "Court Research", free: false, standard: true, premium: true },
    { name: "Appraisal Data", free: false, standard: true, premium: true },
    { name: "CRM Pipeline", free: false, standard: "12 stages", premium: "12 stages" },
    { name: "Property Saves", free: "3 max", standard: "Unlimited", premium: "Unlimited" },
    { name: "Property Alerts", free: false, standard: true, premium: true },
    { name: "Deal Analyzer", free: false, standard: true, premium: true },
    { name: "Portfolio Tracking", free: false, standard: false, premium: true },
    { name: "Priority Notifications", free: false, standard: false, premium: true },
    { name: "Comparable Sales", free: false, standard: false, premium: true },
    { name: "Maps & Imagery", free: false, standard: false, premium: true },
    { name: "Support", free: "Community", standard: "Email", premium: "Priority" },
  ];

  return (
    <section className="py-24 lg:py-32 bg-rice-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Feature Comparison
          </h2>
          <p className="text-ink-500">
            Compare all features across our investor tiers.
          </p>
        </motion.div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-4 px-4 font-medium text-foreground">Feature</th>
                <th className="text-center py-4 px-4 font-medium text-ink-500">Free</th>
                <th className="text-center py-4 px-4 font-medium text-accent">Standard</th>
                <th className="text-center py-4 px-4 font-medium text-ink-500">Premium</th>
              </tr>
            </thead>
            <tbody>
              {allFeatures.map((feature, idx) => (
                <tr key={idx} className="border-b border-border/50">
                  <td className="py-4 px-4 text-foreground">{feature.name}</td>
                  <td className="py-4 px-4 text-center">
                    {feature.free === true ? (
                      <Check className="w-5 h-5 text-success mx-auto" />
                    ) : feature.free === false ? (
                      <X className="w-5 h-5 text-ink-300 mx-auto" />
                    ) : (
                      <span className="text-sm text-ink-500">{feature.free}</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center bg-accent/5">
                    {feature.standard === true ? (
                      <Check className="w-5 h-5 text-success mx-auto" />
                    ) : feature.standard === false ? (
                      <X className="w-5 h-5 text-ink-300 mx-auto" />
                    ) : (
                      <span className="text-sm text-ink-600 font-medium">{feature.standard}</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {feature.premium === true ? (
                      <Check className="w-5 h-5 text-success mx-auto" />
                    ) : feature.premium === false ? (
                      <X className="w-5 h-5 text-ink-300 mx-auto" />
                    ) : (
                      <span className="text-sm text-ink-500">{feature.premium}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-ink-500">
            Everything you need to know about pricing and plans.
          </p>
        </motion.div>

        <div className="bg-surface rounded-2xl border border-border p-6 lg:p-8">
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} {...faq} index={idx} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-ink-500 mb-4">Still have questions?</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-accent hover:text-accent-hover font-medium transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Contact our sales team
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 lg:py-32 bg-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Start?
          </h2>
          <p className="text-lg text-white/70 mb-8">
            Start your 7-day free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-foreground bg-white rounded-xl hover:bg-rice-50 transition-all"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border border-white/30 rounded-xl hover:bg-white/10 transition-all"
            >
              Explore Features
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Main Page
export default function PricingPage() {
  return (
    <>
      <HeroSection />
      <PricingSection />
      <ComparisonSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
