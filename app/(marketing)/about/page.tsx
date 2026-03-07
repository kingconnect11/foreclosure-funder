'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight,
  MapPin,
  Target,
  Heart,
  Zap,
  Users,
  Building2,
  TrendingUp,
  Award,
  Quote,
  Mail,
  Linkedin,
  Twitter
} from 'lucide-react';
import { cn } from '@/lib/utils';

const values = [
  {
    icon: Target,
    title: "Investor-First",
    description: "Every feature we build starts with one question: Does this help investors close more deals? If the answer is no, we do not build it."
  },
  {
    icon: Heart,
    title: "Kansas Roots",
    description: "We are not a Silicon Valley startup guessing at Midwest real estate. We are Wichita-based, Kansas-proud, and deeply connected to the local market."
  },
  {
    icon: Zap,
    title: "Move Fast",
    description: "In foreclosure investing, hours matter. We prioritize speed and real-time data because we know you need to act before the competition."
  },
  {
    icon: Users,
    title: "Human + Tech",
    description: "Technology should amplify human expertise, not replace it. We combine automation with Mike's 20+ years of real estate experience."
  }
];

const milestones = [
  {
    year: "2024",
    title: "The Problem",
    description: "Mike King spent 4+ hours per week manually researching foreclosure properties for his investor clients. Dan Drake, his most active investor, spent even more time digging through court records."
  },
  {
    year: "Early 2025",
    title: "The Idea",
    description: "Mike's brother Philip, a software engineer in San Francisco, saw an opportunity to automate the painful parts of foreclosure research while preserving the human judgment that makes deals successful."
  },
  {
    year: "Mid 2025",
    title: "The MVP",
    description: "Philip built the first scraper for Sedgwick County foreclosure publications. Mike started using it with his beta investor group."
  },
  {
    year: "2026",
    title: "Foreclosure Funder",
    description: "The platform launches with a full CRM pipeline, court research automation, and deal analysis tools -- built specifically for Kansas foreclosure investors."
  }
];

const team = [
  {
    name: "Mike King",
    role: "Co-Founder & Head of Sales",
    location: "Wichita, Kansas",
    bio: "Licensed real estate agent with 20+ years of experience in the Wichita market. Mike has helped hundreds of investors navigate foreclosure purchases and knows the local landscape better than anyone.",
    initials: "MK",
    color: "from-accent to-vermillion-dark"
  },
  {
    name: "Philip King",
    role: "Co-Founder & CTO",
    location: "San Francisco, California",
    bio: "Software engineer and architect with experience building scalable systems. Philip brings the technical expertise to transform Mike's market knowledge into a platform that serves investors statewide.",
    initials: "PK",
    color: "from-indigo to-indigo-dark"
  }
];

const stats = [
  { value: "81", label: "Properties Tracked", suffix: "+" },
  { value: "12", label: "Pipeline Stages", suffix: "" },
  { value: "35", label: "RLS Policies", suffix: "" },
  { value: "1", label: "Market (for now)", suffix: "" }
];

function ValueCard({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0 
}: { 
  icon: React.ComponentType<{className?: string}>;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group bg-surface rounded-2xl border border-border p-6 lg:p-8 hover:border-accent/20 transition-all duration-300"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-accent" />
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-sm text-ink-500 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function MilestoneItem({ 
  year, 
  title, 
  description, 
  index 
}: { 
  year: string;
  title: string;
  description: string;
  index: number;
}) {
  const isEven = index % 2 === 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className={cn(
        "relative grid md:grid-cols-2 gap-8 items-center",
        !isEven && "md:grid-flow-dense"
      )}
    >
      {/* Content */}
      <div className={cn(!isEven && "md:col-start-2")}>
        <div className="inline-block px-3 py-1 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-3">
          {year}
        </div>
        <h3 className="font-display text-xl lg:text-2xl font-bold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-ink-500 leading-relaxed">
          {description}
        </p>
      </div>
      
      {/* Timeline dot */}
      <div className="hidden md:flex justify-center">
        <div className="w-4 h-4 rounded-full bg-accent border-4 border-surface shadow-lg" />
      </div>
    </motion.div>
  );
}

function TeamCard({ member, index }: { member: typeof team[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-accent/20 transition-all duration-300"
    >
      {/* Avatar Section */}
      <div className="h-32 bg-gradient-to-br from-rice-100 to-rice-50 relative">
        <div className="absolute -bottom-10 left-6">
          <div className={cn(
            "w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white text-2xl font-bold shadow-lg",
            member.color
          )}>
            {member.initials}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="pt-12 pb-6 px-6">
        <h3 className="font-display text-xl font-bold text-foreground mb-1">
          {member.name}
        </h3>
        <p className="text-accent font-medium text-sm mb-1">{member.role}</p>
        <div className="flex items-center gap-1 text-ink-400 text-xs mb-4">
          <MapPin className="w-3 h-3" />
          {member.location}
        </div>
        <p className="text-sm text-ink-500 leading-relaxed mb-4">
          {member.bio}
        </p>
        <div className="flex items-center gap-3">
          <a href="#" className="text-ink-400 hover:text-accent transition-colors">
            <Linkedin className="w-4 h-4" />
          </a>
          <a href="#" className="text-ink-400 hover:text-accent transition-colors">
            <Twitter className="w-4 h-4" />
          </a>
          <a href="#" className="text-ink-400 hover:text-accent transition-colors">
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-rice-50 to-background" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #1A1D20 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-3xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
            About Us
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Built by Investors,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-vermillion-dark">
              For Investors
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-ink-500 leading-relaxed mb-8">
            Foreclosure Funder is the result of two brothers combining decades of real estate 
            expertise with modern technology. We are not a faceless software company -- we are 
            Kansas investors building the tool we wish we had.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-accent rounded-xl hover:bg-accent-hover transition-all"
            >
              Get in Touch
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 text-ink-500">
              <MapPin className="w-5 h-5 text-accent" />
              <span>Wichita, Kansas</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function MissionSection() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Mission Statement */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-6">
              Our Mission
            </h2>
            <div className="prose prose-lg">
              <p className="text-ink-500 leading-relaxed mb-6">
                We believe every foreclosure investor deserves access to the same quality 
                of information that institutional buyers have. The playing field should 
                be level -- whether you are investing $50K or $5M.
              </p>
              <p className="text-ink-500 leading-relaxed mb-6">
                Our mission is to democratize foreclosure intelligence: combining public 
                records, court research, and property data into a single platform that 
                saves investors 4+ hours per week and helps them make better decisions.
              </p>
              <p className="text-ink-500 leading-relaxed">
                We started in Wichita because that is where Mike has built his real estate 
                career. But our vision extends statewide and beyond -- bringing this level 
                of intelligence to foreclosure investors everywhere.
              </p>
            </div>
          </motion.div>

          {/* Right: Quote */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="bg-surface rounded-2xl border border-border p-8 lg:p-10 shadow-zen">
              <Quote className="w-10 h-10 text-accent/20 mb-4" />
              <blockquote className="text-lg lg:text-xl text-foreground leading-relaxed mb-6">
                "After 20 years in real estate, I know what investors need because I work 
                with them every day. Foreclosure Funder is the tool I wish existed when 
                I started -- and now we are building it for the next generation of investors."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-vermillion-dark flex items-center justify-center text-white font-bold">
                  MK
                </div>
                <div>
                  <div className="font-semibold text-foreground">Mike King</div>
                  <div className="text-sm text-ink-500">Co-Founder</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
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
            Our Values
          </h2>
          <p className="text-lg text-ink-500">
            The principles that guide everything we build.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {values.map((value, idx) => (
            <ValueCard key={idx} {...value} delay={idx * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StorySection() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Our Story
          </h2>
          <p className="text-lg text-ink-500">
            From a problem to a platform -- how Foreclosure Funder came to be.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent via-accent/50 to-accent/20 -translate-x-1/2" />
          
          <div className="space-y-12 lg:space-y-16">
            {milestones.map((milestone, idx) => (
              <MilestoneItem key={idx} {...milestone} index={idx} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
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
            Meet the Founders
          </h2>
          <p className="text-lg text-ink-500">
            Two brothers, two skill sets, one mission: to help Kansas investors succeed.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {team.map((member, idx) => (
            <TeamCard key={idx} member={member} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="py-24 lg:py-32 bg-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-4xl lg:text-5xl font-bold text-white mb-2">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-accent to-vermillion-dark rounded-3xl p-8 lg:p-16 text-center"
        >
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-4">
            Join Us on This Journey
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            We are building Foreclosure Funder in public, with feedback from real investors 
            like you. Try the platform, share your thoughts, and help us create something great.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-accent bg-white rounded-xl hover:bg-rice-50 transition-all"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border border-white/30 rounded-xl hover:bg-white/10 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Main Page
export default function AboutPage() {
  return (
    <>
      <HeroSection />
      <MissionSection />
      <ValuesSection />
      <StorySection />
      <TeamSection />
      <StatsSection />
      <CTASection />
    </>
  );
}
