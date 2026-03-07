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
  MessageSquare,
  FileSearch,
  Brain,
  Zap as ZapIcon,
  Headphones,
  Plane,
  Wrench
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
      { text: "Property intelligence reports", included: false, detail: "Demo only" },
      { text: "Court records research", included: false, detail: "Not included" },
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
      { text: "Property intelligence reports", included: true, detail: "3/month" },
      { text: "Court records research", included: true, detail: "3/month ($5/additional)" },
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
      { text: "Property intelligence reports", included: true, detail: "10/month ($5/additional)" },
      { text: "Court records research", included: true, detail: "10/month ($5/additional)" },
      { text: "Priority notifications", included: true },
      { text: "Comparable sales data", included: true },
      { text: "Maps & satellite imagery", included: true },
      { text: "Document preparation services", included: true },
      { text: "Portfolio analytics", included: true },
      { text: "CSV import for portfolio properties", included: true },
      { text: "Zapier integration setup", included: true },
      { text: "Priority email support", included: true },
    ],
    cta: "Start Free Trial",
    ctaLink: "/signup",
    popular: false
  }
];

const dealRoomTiers = [
  {
    name: "Deal Room",
    icon: Building2,
    price: { setup: 1100, seat: 29 },
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
      { text: "Homeowner outreach automation", included: false, comingSoon: true },
      { text: "Weekly investor digests", included: true },
      { text: "7-day free trial per seat", included: true },
    ],
    cta: "Contact Sales",
    ctaLink: "/contact",
    popular: false
  },
  {
    name: "Premium Deal Room",
    icon: Crown,
    price: { monthly: 2500, annual: 1900 },
    description: "White-glove service for enterprise agent teams",
    features: [
      { text: "Everything in Deal Room", included: true },
      { text: "Virtual or on-site onboarding", included: true },
      { text: "Up to 2 workflow automations", included: true, detail: "Zapier, n8n, Make.com" },
      { text: "24-hour technical support", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Custom API integrations", included: true },
      { text: "Quarterly strategy reviews", included: true },
      { text: "Priority feature requests", included: true },
      { text: "White-label mobile app", included: false, comingSoon: true },
      { text: "Advanced analytics dashboard", included: true },
      { text: "Team training sessions", included: true },
    ],
    cta: "Contact Sales",
    ctaLink: "/contact",
    popular: true,
    badge: "Enterprise"
  }
];

const faqs = [
  {
    question: "What counts as a property intelligence report?",
    answer: "Each full property intelligence report includes comprehensive data: property details, appraisal information, foreclosure status, sale timeline analysis, and initial recommendation scoring. Reports are generated on-demand for any property in our database."
  },
  {
    question: "What is court records research?",
    answer: "Court records research includes automated lookup of liens, judgments, lawsuits, and title issues from Kansas court systems. Each research request returns a summary of encumbrances and title health assessment."
  },
  {
    question: "What happens if I exceed my monthly report limit?",
    answer: "Additional reports beyond your tier limit are $5 each. You will receive a notification when you are approaching your limit, and you can either upgrade your plan or pay per report. Unused reports do not roll over."
  },
  {
    question: "Can I upgrade or downgrade at any time?",
    answer: "Yes, you can change your plan at any time. Upgrades take effect immediately. Downgrades take effect at the end of your current billing period."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes, Standard and Premium tiers include a 7-day free trial with full access to all features. No credit card required to start. Deal Room seats also include a 7-day trial."
  },
  {
    question: "What does Premium Deal Room include for onboarding?",
    answer: "Premium Deal Room includes either a full-day on-site onboarding at your office (travel included) or comprehensive virtual onboarding sessions. We work directly with your team to set up workflows, automations, and train all users."
  },
  {
    question: "What automation platforms are supported?",
    answer: "We support Zapier, n8n, Make.com (Integromat), and custom webhook integrations. Our team will build up to 2 automations for your workflow as part of the Premium Deal Room setup."
  },
  {
    question: "What areas do you serve?",
    answer: "Currently we focus on Sedgwick County and Butler County in Kansas. We are expanding statewide throughout 2026. Contact us if you are interested in another Kansas market."
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
              {feature.detail && feature.included && (
                <span className="ml-1.5 text-xs text-accent font-medium">({feature.detail})</span>
              )}
              {feature.detail && !feature.included && (
                <span className="ml-1.5 text-xs text-ink-400">{feature.detail}</span>
              )}
              {(feature as { comingSoon?: boolean }).comingSoon && (
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

function DealRoomCard({ tier, index }: { tier: typeof dealRoomTiers[0]; index: number }) {
  const Icon = tier.icon;
  const isPremium = tier.name.includes('Premium');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      whileHover={{ y: -4 }}
      className={cn(
        "relative rounded-2xl border p-6 lg:p-8",
        isPremium
          ? "bg-gradient-to-br from-indigo/5 to-surface border-indigo/30 shadow-zen-xl"
          : "bg-surface border-border shadow-zen"
      )}
    >
      {tier.popular && (
        <div className="absolute -top-3 left-4 px-3 py-1 bg-indigo text-white text-xs font-semibold rounded-full">
          {tier.badge}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
            isPremium ? "bg-indigo/10" : "bg-accent/10"
          )}>
            <Icon className={cn("w-6 h-6", isPremium ? "text-indigo" : "text-accent")} />
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
            {tier.name}
          </h3>
          <p className="text-ink-500 mb-6">{tier.description}</p>
          
          {(() => {
            const price = tier.price as { setup?: number; seat?: number; monthly?: number; annual?: number };
            if (price.setup) {
              return (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl font-bold text-foreground">
                      ${price.setup.toLocaleString()}
                    </span>
                    <span className="text-ink-500">setup</span>
                  </div>
                  <p className="text-sm text-ink-500">
                    + ${price.seat}/seat/month
                  </p>
                </div>
              );
            }
            return (
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-foreground">
                    ${price.monthly?.toLocaleString()}
                  </span>
                  <span className="text-ink-500">/month</span>
                </div>
                <p className="text-sm text-success">
                  ${price.annual?.toLocaleString()}/month billed annually (24% savings)
                </p>
              </div>
            );
          })()}
        </div>

        <div>
          <ul className="space-y-2.5 mb-6">
            {tier.features.slice(0, 7).map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className={cn(
                  "w-4 h-4 shrink-0 mt-0.5",
                  isPremium ? "text-indigo" : "text-accent"
                )} />
                <span className="text-sm text-ink-600">
                  {feature.text}
                  {(feature as { detail?: string }).detail && (
                    <span className="text-xs text-ink-400 ml-1">{(feature as { detail?: string }).detail}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href={tier.ctaLink}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
              isPremium
                ? "bg-indigo text-white hover:bg-indigo-dark shadow-zen hover:shadow-zen-lg"
                : "bg-accent text-white hover:bg-accent-hover"
            )}
          >
            {tier.cta}
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
          Start free and upgrade when you are ready. Intelligence reports and court research included. 
          No hidden fees. Cancel anytime.
        </p>
      </motion.div>
    </section>
  );
}

function InvestorTiersSection() {
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

        {/* Investor Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-8">
          {tiers.map((tier, index) => (
            <PricingCard 
              key={tier.name} 
              tier={tier} 
              billingPeriod={billingPeriod}
              index={index}
            />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-ink-500 max-w-2xl mx-auto"
        >
          <FileSearch className="w-4 h-4 inline-block mr-1" />
          Property intelligence reports and court records research are included monthly. 
          Additional reports are $5 each. Unused reports do not roll over.
        </motion.p>
      </div>
    </section>
  );
}

function DealRoomSection() {
  return (
    <section className="py-24 lg:py-32 bg-rice-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-indigo/10 text-indigo text-sm font-medium mb-4">
            For Real Estate Agents
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Deal Room Solutions
          </h2>
          <p className="text-lg text-ink-500">
            Manage your investor group with professional tools. From essential to enterprise.
          </p>
        </motion.div>

        <div className="grid gap-6 max-w-4xl mx-auto">
          {dealRoomTiers.map((tier, index) => (
            <DealRoomCard key={tier.name} tier={tier} index={index} />
          ))}
        </div>

        {/* Premium Features Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { icon: Plane, title: "On-Site Onboarding", desc: "Full-day setup at your office" },
            { icon: ZapIcon, title: "2 Automations", desc: "Zapier, n8n, Make.com" },
            { icon: Headphones, title: "24hr Support", desc: "Round-the-clock assistance" },
            { icon: Wrench, title: "Custom Integrations", desc: "API & webhook support" },
          ].map((feature, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-border"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo/10 flex items-center justify-center shrink-0">
                <feature.icon className="w-5 h-5 text-indigo" />
              </div>
              <div>
                <div className="font-medium text-sm text-foreground">{feature.title}</div>
                <div className="text-xs text-ink-500">{feature.desc}</div>
              </div>
            </div>
          ))}
        </motion.div>
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
            Everything you need to know about our pricing and features.
          </p>
        </motion.div>

        <div className="bg-surface rounded-2xl border border-border p-6 lg:p-8">
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} {...faq} index={idx} />
          ))}
        </div>
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
            Start your 7-day free trial today. Full access to all Standard features. 
            No credit card required.
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
      <InvestorTiersSection />
      <DealRoomSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
