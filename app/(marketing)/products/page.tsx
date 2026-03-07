'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { 
  ArrowRight,
  Search,
  FileCheck,
  TrendingUp,
  Calculator,
  PieChart,
  Users,
  Zap,
  MapPin,
  Clock,
  Shield,
  Bell,
  BarChart3,
  Building2,
  Settings,
  Mail,
  MessageSquare,
  CheckCircle2,
  Star,
  Crown,
  Rocket
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

function FeatureBlock({ 
  icon: Icon, 
  title, 
  description, 
  features,
  imagePosition = 'right',
  delay = 0
}: { 
  icon: React.ComponentType<{className?: string}>;
  title: string;
  description: string;
  features: string[];
  imagePosition?: 'left' | 'right';
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "grid lg:grid-cols-2 gap-8 lg:gap-16 items-center",
        imagePosition === 'left' && "lg:grid-flow-dense"
      )}
    >
      {/* Content */}
      <div className={cn(imagePosition === 'left' && "lg:col-start-2")}>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-accent" />
        </div>
        <h3 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-4">
          {title}
        </h3>
        <p className="text-lg text-ink-500 mb-6 leading-relaxed">
          {description}
        </p>
        <ul className="space-y-3">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <span className="text-ink-600">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Visual Representation */}
      <div className={cn(
        "relative",
        imagePosition === 'left' && "lg:col-start-1 lg:row-start-1"
      )}>
        <div className="bg-surface rounded-2xl border border-border shadow-zen-xl p-6">
          {/* Mock UI based on feature type */}
          {title.includes('Tracking') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-sm font-medium text-foreground">Foreclosure Listings</span>
                <span className="text-xs text-accent font-medium">81 Active</span>
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-rice-50 rounded-lg">
                  <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{['Oak St', 'Maple Ave', 'Pine Rd', 'Cedar Ln'][i-1]}</div>
                    <div className="text-xs text-ink-500">Sale in {i * 5 + 2} days</div>
                  </div>
                  <div className="text-sm font-semibold text-accent">${(60 + i * 25)}K</div>
                </div>
              ))}
            </div>
          )}
          {title.includes('Research') && (
            <div className="space-y-4">
              <div className="p-4 bg-rice-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <FileCheck className="w-5 h-5 text-success" />
                  <span className="font-medium text-foreground">Title Assessment</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-500">Tax Liens</span>
                    <span className="text-success font-medium">None Found</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-500">Judgments</span>
                    <span className="text-warning font-medium">1 Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-500">Mechanic Liens</span>
                    <span className="text-success font-medium">None Found</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                <div className="text-sm font-medium text-accent mb-1">Estimated Offer Range</div>
                <div className="text-2xl font-bold text-foreground">$85,000 - $95,000</div>
              </div>
            </div>
          )}
          {title.includes('Pipeline') && (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2 text-xs text-center">
                {['Watching', 'Researching', 'Offer', 'Closed'].map((stage, i) => (
                  <div key={i} className={cn(
                    "p-2 rounded",
                    i === 1 ? "bg-accent/10 text-accent font-medium" : "bg-rice-100 text-ink-500"
                  )}>
                    {stage}
                  </div>
                ))}
              </div>
              <div className="p-4 bg-rice-50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="font-medium text-foreground">1234 E Douglas Ave</span>
                </div>
                <div className="text-sm text-ink-500 mb-2">Currently in Researching stage</div>
                <div className="text-xs text-ink-400">Added to pipeline 3 days ago</div>
              </div>
            </div>
          )}
          {title.includes('Analyzer') && (
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                {['Flip', 'Rental', 'Wholesale'].map((strategy, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex-1 py-2 text-center text-sm font-medium rounded-lg",
                      i === 0 ? "bg-accent text-white" : "bg-rice-100 text-ink-500"
                    )}
                  >
                    {strategy}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-rice-50 rounded-lg">
                  <div className="text-xs text-ink-500 mb-1">Projected Profit</div>
                  <div className="text-lg font-bold text-success">$42,500</div>
                </div>
                <div className="p-3 bg-rice-50 rounded-lg">
                  <div className="text-xs text-ink-500 mb-1">ROI</div>
                  <div className="text-lg font-bold text-accent">24.8%</div>
                </div>
              </div>
            </div>
          )}
          {title.includes('Room') && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-vermillion-dark flex items-center justify-center text-white font-semibold">
                  MK
                </div>
                <div>
                  <div className="font-medium text-foreground">Mike King Investment Group</div>
                  <div className="text-xs text-ink-500">12 active investors</div>
                </div>
              </div>
              <div className="space-y-2">
                {['Dan Drake - 5 properties', 'Sarah Chen - 3 properties', 'James Wilson - 2 properties'].map((investor, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-rice-50 rounded-lg">
                    <span className="text-sm text-foreground">{investor}</span>
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TierFeatureCard({ 
  tier,
  icon: Icon,
  title,
  features,
  cta,
  popular = false 
}: { 
  tier: string;
  icon: React.ComponentType<{className?: string}>;
  title: string;
  features: string[];
  cta: string;
  popular?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative rounded-2xl border p-6 lg:p-8",
        popular 
          ? "bg-gradient-to-br from-accent/5 to-surface border-accent shadow-zen-lg" 
          : "bg-surface border-border shadow-zen"
      )}
    >
      {popular && (
        <div className="absolute -top-3 left-4 px-3 py-1 bg-accent text-white text-xs font-semibold rounded-full">
          Recommended
        </div>
      )}
      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-accent" />
      </div>
      <h3 className="font-display text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-ink-500 mb-4">{tier}</p>
      <ul className="space-y-2 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-ink-600">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href="/pricing"
        className={cn(
          "block w-full text-center py-2.5 rounded-lg font-medium transition-all",
          popular
            ? "bg-accent text-white hover:bg-accent-hover"
            : "bg-rice-100 text-foreground hover:bg-rice-200"
        )}
      >
        {cta}
      </Link>
    </motion.div>
  );
}

// Page Sections
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
          Our Products
        </span>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 max-w-4xl mx-auto">
          Two Products. One Mission:{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-vermillion-dark">
            Your Success.
          </span>
        </h1>
        <p className="text-lg lg:text-xl text-ink-500 max-w-2xl mx-auto mb-8">
          Whether you are an individual investor or an agent managing a group, 
          we have the tools you need to win in the foreclosure market.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="#investor-dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-accent rounded-xl hover:bg-accent-hover transition-all"
          >
            Investor Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#deal-room"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-foreground bg-surface border border-border rounded-xl hover:border-accent/30 transition-all"
          >
            Deal Room
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function InvestorDashboardSection() {
  return (
    <section id="investor-dashboard" className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-vermillion-dark flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-accent">For Individual Investors</span>
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Investor Dashboard
          </h2>
          <p className="text-lg text-ink-500 max-w-2xl">
            Everything you need to discover, analyze, and close foreclosure deals in Kansas. 
            Built by investors, for investors.
          </p>
        </motion.div>

        <div className="space-y-24 lg:space-y-32">
          <FeatureBlock
            icon={Search}
            title="Real-Time Foreclosure Tracking"
            description="Live data from county publications, updated continuously. See every new filing, sale date change, and status update as it happens. Filter by location, property type, sale timeline, and more."
            features={[
              "Live Sedgwick County foreclosure feed",
              "Advanced filtering by city, ZIP, and sale date",
              "Anonymous \"others watching\" indicator",
              "Property alerts based on your criteria",
              "Sale date urgency badges (7, 14, 30+ days)"
            ]}
            delay={0}
          />

          <FeatureBlock
            icon={FileCheck}
            title="Court Research & Title Intelligence"
            description="Automated analysis of court records saves you 4+ hours per property. Know liens, judgments, and title health before you ever drive to the site."
            features={[
              "Automated Kansas court record lookup",
              "Lien detection (tax, mechanic, judgment)",
              "Title health assessment (clean/clouded/complex)",
              "Estimated offer range based on encumbrances",
              "Research summary with AI-generated insights"
            ]}
            imagePosition="left"
            delay={0.1}
          />

          <FeatureBlock
            icon={TrendingUp}
            title="Smart CRM Pipeline"
            description="Track every deal from discovery to closing with 12 granular stages. Never lose track of a potential deal again. Stage history with notes and timestamps."
            features={[
              "12 pipeline stages from Watching to Closed",
              "Stage history with notes and timestamps",
              "Private notes and documents per property",
              "Offer amount tracking",
              "Time-in-stage indicators"
            ]}
            delay={0.2}
          />

          <FeatureBlock
            icon={Calculator}
            title="Deal Analyzer"
            description="Instant ROI calculations for flip, rental, and wholesale strategies. Compare scenarios side-by-side and know exactly what to offer."
            features={[
              "Flip profit calculator with renovation costs",
              "Rental cash flow and cap rate analysis",
              "Wholesale assignment fee calculator",
              "Side-by-side strategy comparison",
              "Assumption tuning with instant recalculation"
            ]}
            imagePosition="left"
            delay={0.3}
          />

          <FeatureBlock
            icon={PieChart}
            title="Portfolio Analytics"
            description="Track your owned properties, construction costs, legal fees, and total profit/loss. Visual charts that update as you add data."
            features={[
              "Total portfolio value tracking",
              "YTD and lifetime P/L calculations",
              "Cost breakdown by category",
              "Construction, legal, and interest tracking",
              "CSV import for historical deals"
            ]}
            delay={0.4}
          />
        </div>
      </div>
    </section>
  );
}

function DealRoomSection() {
  return (
    <section id="deal-room" className="py-24 lg:py-32 bg-rice-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo to-indigo-dark flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-indigo">For Agents & Groups</span>
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Deal Room
          </h2>
          <p className="text-lg text-ink-500 max-w-2xl">
            White-labeled investor management for real estate agents. Provide concierge-level 
            service to your investor group at scale.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {[
            {
              icon: Building2,
              title: "Branded Deal Room",
              description: "Your logo, your colors, your contact info. A professional platform your investors will love."
            },
            {
              icon: Users,
              title: "Investor Management",
              description: "Onboard, monitor activity, and track pipelines for all your investors in one place."
            },
            {
              icon: MessageSquare,
              title: "Group Notes",
              description: "Share drive-by observations and property notes with your entire investor group."
            },
            {
              icon: BarChart3,
              title: "Activity Dashboard",
              description: "See what properties your investors are watching, researching, and pursuing."
            },
            {
              icon: Mail,
              title: "Weekly Digests",
              description: "Automated personalized emails to each investor with new matching properties."
            },
            {
              icon: Settings,
              title: "Custom Features",
              description: "Up to 2 custom feature requests included with setup. Built for your workflow."
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-surface rounded-2xl border border-border p-6 lg:p-8 hover:border-indigo/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-indigo" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-ink-500">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <FeatureBlock
          icon={Zap}
          title="Homeowner Outreach Automation"
          description="Coming soon: Automated letter campaigns to homeowners in pre-foreclosure. Zapier integration with your CRM for seamless workflow."
          features={[
            "Pre-foreclosure homeowner identification",
            "Automated letter campaign sequences",
            "Zapier + Lofty CRM integration",
            "Campaign performance tracking",
            "Touch scheduling and management"
          ]}
          delay={0.2}
        />
      </div>
    </section>
  );
}

function TiersSection() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Choose Your Tools
          </h2>
          <p className="text-lg text-ink-500">
            Investor Dashboard for individual investors. Deal Room for agents managing groups.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TierFeatureCard
            tier="Individual"
            icon={Star}
            title="Free"
            features={[
              "2-3 listings per session",
              "Basic property info",
              "Save up to 3 properties",
              "Educational content"
            ]}
            cta="Get Started"
          />
          <TierFeatureCard
            tier="Individual"
            icon={Zap}
            title="Standard"
            features={[
              "Full property listings",
              "Court research data",
              "CRM pipeline",
              "Deal analyzer"
            ]}
            cta="See Pricing"
            popular
          />
          <TierFeatureCard
            tier="Individual"
            icon={Rocket}
            title="Premium"
            features={[
              "Everything in Standard",
              "Priority alerts",
              "Comp sales data",
              "Priority support"
            ]}
            cta="See Pricing"
          />
          <TierFeatureCard
            tier="Agent/Group"
            icon={Crown}
            title="Deal Room"
            features={[
              "Branded platform",
              "Investor management",
              "Group notes",
              "Weekly digests"
            ]}
            cta="Contact Sales"
          />
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
            Ready to Get Started?
          </h2>
          <p className="text-lg text-white/70 mb-8">
            Start with our free tier to explore the platform, or jump right into 
            Standard for the full foreclosure intelligence experience.
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
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border border-white/30 rounded-xl hover:bg-white/10 transition-all"
            >
              Compare Plans
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Main Page
export default function ProductsPage() {
  return (
    <>
      <HeroSection />
      <InvestorDashboardSection />
      <DealRoomSection />
      <TiersSection />
      <CTASection />
    </>
  );
}
