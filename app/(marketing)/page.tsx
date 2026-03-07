'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2,
  TrendingUp,
  Search,
  FileCheck,
  Users,
  PieChart,
  Bell,
  MapPin,
  Calculator,
  Zap,
  Shield,
  Clock,
  ChevronRight,
  Play,
  Star,
  Quote,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const floatAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
};

// Components
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      className="tabular-nums"
    >
      {isInView ? value.toLocaleString() : '0'}{suffix}
    </motion.span>
  );
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0,
  className 
}: { 
  icon: React.ComponentType<{className?: string}>;
  title: string;
  description: string;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "group relative bg-surface rounded-2xl border border-border p-6 lg:p-8",
        "transition-all duration-300 hover:shadow-zen-xl hover:border-accent/20",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-accent" />
      </div>
      <h3 className="font-display font-semibold text-lg text-foreground mb-2">{title}</h3>
      <p className="text-sm text-ink-500 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function TestimonialCard({ 
  quote, 
  author, 
  role,
  delay = 0 
}: { 
  quote: string;
  author: string;
  role: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-surface rounded-2xl border border-border p-6 lg:p-8 shadow-zen"
    >
      <Quote className="w-8 h-8 text-accent/20 mb-4" />
      <p className="text-foreground leading-relaxed mb-6">{quote}</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-vermillion-dark flex items-center justify-center text-white font-semibold text-sm">
          {author.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div className="font-medium text-sm text-foreground">{author}</div>
          <div className="text-xs text-ink-500">{role}</div>
        </div>
      </div>
    </motion.div>
  );
}

// Hero Section
function HeroSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[90vh] flex items-center overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-rice-50 via-background to-background" />
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, #1A1D20 1px, transparent 1px),
                           linear-gradient(to bottom, #1A1D20 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Floating Elements */}
      <motion.div 
        {...floatAnimation}
        className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-gradient-to-br from-accent/5 to-transparent blur-3xl"
      />
      <motion.div 
        {...floatAnimation}
        animate={{ ...floatAnimation.animate, transition: { ...floatAnimation.animate.transition, delay: 1 } }}
        className="absolute bottom-40 left-[5%] w-96 h-96 rounded-full bg-gradient-to-tr from-vermillion/5 to-transparent blur-3xl"
      />

      {/* Content */}
      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center lg:text-left"
          >
            <motion.div 
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium text-accent">Now serving Kansas investors</span>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6"
            >
              Your Foreclosure{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-vermillion-dark">
                Intelligence
              </span>{" "}
              Command Center
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-lg lg:text-xl text-ink-500 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Mike King and his investor group spent 320 hours per week on manual research. 
              With Foreclosure Funder, they now spend less than 30 minutes per month 
              inputting data -- and get 10x the actionable insights. Real-time property 
              intelligence built for Kansas investors.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-accent rounded-xl hover:bg-accent-hover transition-all shadow-zen-lg hover:shadow-zen-xl"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/products"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-foreground bg-surface border border-border rounded-xl hover:border-accent/30 hover:bg-rice-50 transition-all"
              >
                <Play className="w-5 h-5" />
                See How It Works
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-10 pt-10 border-t border-border/50"
            >
              {[
                { value: 320, label: 'Hours Saved Weekly', suffix: '' },
                { value: 30, label: 'Minutes Per Month', suffix: '' },
                { value: 10, label: 'X More Insights', suffix: '' },
              ].map((stat, idx) => (
                <div key={idx} className="text-center lg:text-left">
                  <div className="font-display text-2xl font-bold text-foreground">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-ink-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Visual Representation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Dashboard Preview Card */}
            <div className="relative bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-rice-50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-danger/80" />
                  <div className="w-3 h-3 rounded-full bg-warning/80" />
                  <div className="w-3 h-3 rounded-full bg-success/80" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-ink-400">Foreclosure Funder Dashboard</span>
                </div>
              </div>
              
              {/* Mock Content */}
              <div className="p-4 space-y-3">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Active', value: '47', color: 'bg-accent/10 text-accent' },
                    { label: 'Upcoming', value: '18', color: 'bg-warning/10 text-warning' },
                    { label: 'In Pipeline', value: '12', color: 'bg-success/10 text-success' },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-rice-50 rounded-lg p-3">
                      <div className={cn("text-lg font-bold", stat.color.split(' ')[1])}>{stat.value}</div>
                      <div className="text-xs text-ink-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
                
                {/* Property Cards */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-accent/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rice-200 to-rice-100 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-ink-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {['1234 E Douglas Ave', '5678 W Central', '9012 N Rock Rd'][i-1]}
                      </div>
                      <div className="text-xs text-ink-500">Wichita, KS • Sale in {7*i} days</div>
                    </div>
                    <div className="text-sm font-semibold text-accent">
                      ${(85 + i * 15)}K
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Badge */}
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-surface rounded-xl border border-border shadow-xl p-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <div>
                  <div className="text-xs font-medium text-foreground">Deal Analyzed</div>
                  <div className="text-xs text-ink-500">ROI: 24.5%</div>
                </div>
              </div>
            </motion.div>

            {/* Floating Notification */}
            <motion.div
              animate={{ y: [0, 6, 0], rotate: [0, -1, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -left-4 bg-surface rounded-xl border border-border shadow-xl p-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <div className="text-xs font-medium text-foreground">New Property Alert</div>
                  <div className="text-xs text-ink-500">Matches your criteria</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: Search,
      title: "Real-Time Foreclosure Tracking",
      description: "Live data from Sedgwick County publications. Never miss a new filing or sale date change. Our scraper updates continuously so you're always first to know."
    },
    {
      icon: FileCheck,
      title: "Court Research & Title Intelligence",
      description: "Automated lien and judgment analysis with 3-10 included reports per month (tier-based). Additional reports $5 each. Know title health before you drive."
    },
    {
      icon: TrendingUp,
      title: "Smart Deal Pipeline",
      description: "Track every deal from discovery to closing. 12 granular stages with notes, history, and collaboration tools. Never lose track of a potential deal again."
    },
    {
      icon: Calculator,
      title: "Deal Analyzer",
      description: "Instant flip, rental, and wholesale calculations. ROI, cash flow, and risk assessment in seconds. Compare strategies side by side."
    },
    {
      icon: PieChart,
      title: "Portfolio Analytics",
      description: "Track your portfolio properties, construction costs, legal fees, and total P/L. Visual charts that update in real time as you add data."
    },
    {
      icon: Users,
      title: "Deal Room Collaboration",
      description: "For agents managing investor groups. Share notes, track group activity, and provide white-glove service at scale."
    }
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
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Everything You Need
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            One Platform. Every Stage.
          </h2>
          <p className="text-lg text-ink-500">
            From discovery to closing, Foreclosure Funder has the tools serious investors need.
            No more spreadsheets. No more missed opportunities.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} delay={idx * 0.1} />
          ))}
        </div>

        {/* Additional Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { icon: Zap, title: "Property Alerts", desc: "Instant notifications" },
            { icon: MapPin, title: "Map Integration", desc: "Google Maps embeds" },
            { icon: Clock, title: "Sale Date Urgency", desc: "Visual countdown" },
            { icon: Shield, title: "Data Security", desc: "RLS protection" },
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-border"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="font-medium text-sm text-foreground">{item.title}</div>
                <div className="text-xs text-ink-500">{item.desc}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Discover",
      description: "Browse real-time foreclosure listings for Sedgwick County. Filter by sale date, property type, and your investment criteria."
    },
    {
      number: "02",
      title: "Research",
      description: "Access court records, lien information, and property details. Our automated research saves you 4+ hours per property."
    },
    {
      number: "03",
      title: "Analyze",
      description: "Run the numbers with our Deal Analyzer. Compare flip, rental, and wholesale scenarios side by side."
    },
    {
      number: "04",
      title: "Track",
      description: "Add properties to your pipeline and track them through every stage from site visit to closing."
    }
  ];

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            From Search to Close
          </h2>
          <p className="text-lg text-ink-500">
            A streamlined workflow designed by investors, for investors.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="relative"
            >
              <div className="bg-surface rounded-2xl border border-border p-6 lg:p-8 h-full hover:border-accent/20 transition-colors">
                <div className="text-5xl font-display font-bold text-accent/20 mb-4">
                  {step.number}
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-ink-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ChevronRight className="w-6 h-6 text-border" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Social Proof Section
function SocialProofSection() {
  const testimonials = [
    {
      quote: "Foreclosure Funder has completely transformed how I find and track deals. The court research automation alone saves me 4 hours every week.",
      author: "Dan Drake",
      role: "Active Foreclosure Investor, Wichita"
    },
    {
      quote: "Finally, a tool that understands the foreclosure process. The pipeline stages match exactly how I work deals from discovery to close.",
      author: "Mike King",
      role: "Real Estate Agent & Co-Founder"
    },
    {
      quote: "The deal analyzer is a game-changer. I can compare flip vs rental scenarios in seconds and know exactly what to offer.",
      author: "Philip King",
      role: "CTO & Co-Founder"
    }
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
          <div className="flex items-center justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-5 h-5 fill-warning text-warning" />
            ))}
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Trusted by Kansas Investors
          </h2>
          <p className="text-lg text-ink-500">
            Join the investors who have found peace of mind with Foreclosure Funder.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <TestimonialCard key={idx} {...testimonial} delay={idx * 0.1} />
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8"
        >
          {[
            "Built in Kansas",
            "SSL Secured",
            "RLS Protected",
            "Real-Time Data"
          ].map((badge, idx) => (
            <div key={idx} className="flex items-center gap-2 text-ink-500">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm font-medium">{badge}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Pricing Preview Section
function PricingPreviewSection() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      description: "Get a taste of foreclosure investing",
      features: ["2-3 listings per session", "Address + sale date only", "Save up to 3 properties", "Educational content"],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Standard",
      price: "$20",
      priceNote: "/month",
      description: "Everything a serious investor needs",
      features: ["Full property listings", "Court research data", "CRM pipeline", "Unlimited saves", "Property alerts"],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Premium",
      price: "$40",
      priceNote: "/month",
      description: "Advanced tools for power users",
      features: ["Everything in Standard", "Priority notifications", "Comparable sales data", "Document prep", "Priority support"],
      cta: "Start Free Trial",
      popular: false
    }
  ];

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Simple Pricing
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Invest in Your Success
          </h2>
          <p className="text-lg text-ink-500">
            Start free. Upgrade when you are ready. No hidden fees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={cn(
                "relative rounded-2xl border p-6 lg:p-8",
                tier.popular 
                  ? "bg-surface border-accent shadow-zen-xl" 
                  : "bg-surface border-border shadow-zen"
              )}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-accent text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {tier.price}
                  </span>
                  {tier.priceNote && (
                    <span className="text-ink-500">{tier.priceNote}</span>
                  )}
                </div>
                <p className="text-sm text-ink-500">{tier.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm text-ink-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={cn(
                  "block w-full text-center py-3 px-4 rounded-lg font-medium transition-all",
                  tier.popular
                    ? "bg-accent text-white hover:bg-accent-hover shadow-zen hover:shadow-zen-lg"
                    : "bg-rice-100 text-foreground hover:bg-rice-200 border border-border"
                )}
              >
                {tier.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Deal Room CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-ink-500 mb-4">
            Are you a real estate agent managing investor groups?
          </p>
          <Link 
            href="/pricing"
            className="inline-flex items-center gap-2 text-accent hover:text-accent-hover font-medium transition-colors"
          >
            See Deal Room pricing
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// Final CTA Section
function FinalCTASection() {
  return (
    <section className="py-24 lg:py-32 bg-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="font-display text-3xl lg:text-5xl font-bold text-white mb-6">
            Ready to Find Your Next Deal?
          </h2>
          <p className="text-lg lg:text-xl text-white/70 mb-8">
            Join Kansas investors who are already using Foreclosure Funder 
            to discover, analyze, and close more foreclosure deals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-foreground bg-white rounded-xl hover:bg-rice-50 transition-all shadow-lg hover:shadow-xl"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border border-white/30 rounded-xl hover:bg-white/10 transition-all"
            >
              Talk to Sales
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/50">
            No credit card required. 7-day free trial.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  const footerLinks = {
    Product: [
      { label: 'Features', href: '/products' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Deal Room', href: '/products#deal-room' },
      { label: 'Changelog', href: '#' },
    ],
    Company: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
    ],
    Resources: [
      { label: 'Documentation', href: '#' },
      { label: 'Help Center', href: '#' },
      { label: 'Guides', href: '#' },
      { label: 'API', href: '#' },
    ],
    Legal: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Security', href: '#' },
    ],
  };

  return (
    <footer className="bg-rice-50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vermillion to-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">
                Foreclosure Funder
              </span>
            </Link>
            <p className="text-sm text-ink-500 mb-4">
              Real-time foreclosure intelligence for Kansas investors.
            </p>
            <p className="text-xs text-ink-400">
              Built in Wichita, KS
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-sm text-foreground mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="text-sm text-ink-500 hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-ink-400">
            © 2026 Foreclosure Funder. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
              <a
                key={social}
                href="#"
                className="text-sm text-ink-500 hover:text-foreground transition-colors"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Page Component
export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SocialProofSection />
      <PricingPreviewSection />
      <FinalCTASection />
      <Footer />
    </>
  );
}
