'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  Building2,
  User,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    description: "For general inquiries and support",
    value: "hello@foreclosurefunder.com",
    href: "mailto:hello@foreclosurefunder.com",
    color: "bg-accent/10 text-accent"
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "Mon-Fri, 9am-5pm CST",
    value: "(316) 555-0123",
    href: "tel:+13165550123",
    color: "bg-success/10 text-success"
  },
  {
    icon: MapPin,
    title: "Visit Us",
    description: "Wichita, Kansas",
    value: "123 E Douglas Ave, Suite 100",
    href: "#",
    color: "bg-indigo/10 text-indigo"
  }
];

const inquiryTypes = [
  { value: "", label: "Select inquiry type" },
  { value: "sales", label: "Sales - Interested in Deal Room" },
  { value: "support", label: "Support - Need help with the platform" },
  { value: "demo", label: "Demo - Schedule a product demo" },
  { value: "partnership", label: "Partnership - Business development" },
  { value: "feedback", label: "Feedback - Share your thoughts" },
  { value: "other", label: "Other" }
];

const faqs = [
  {
    question: "How quickly will I hear back?",
    answer: "We typically respond to all inquiries within 24 hours during business days. For Deal Room sales inquiries, Mike usually responds personally within a few hours."
  },
  {
    question: "Can I schedule a demo?",
    answer: "Absolutely! Select 'Demo' as your inquiry type and let us know what you would like to see. We can walk you through both the Investor Dashboard and Deal Room features."
  },
  {
    question: "Do you offer custom integrations?",
    answer: "For Deal Room clients, we include up to 2 custom feature requests with the setup fee. We can discuss specific integrations during your consultation."
  },
  {
    question: "What areas do you serve?",
    answer: "Currently we focus on Sedgwick County and Butler County in Kansas. We are expanding statewide throughout 2026. Contact us if you are interested in another Kansas market."
  }
];

function ContactMethodCard({ method, index }: { method: typeof contactMethods[0]; index: number }) {
  const Icon = method.icon;
  
  return (
    <motion.a
      href={method.href}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-surface rounded-2xl border border-border p-6 hover:border-accent/20 hover:shadow-zen-lg transition-all duration-300"
    >
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", method.color)}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground mb-1">{method.title}</h3>
      <p className="text-sm text-ink-500 mb-3">{method.description}</p>
      <p className="text-sm font-medium text-accent group-hover:text-accent-hover transition-colors">
        {method.value}
      </p>
    </motion.a>
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

function ContactForm() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    inquiryType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission - user will connect their own backend
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface rounded-2xl border border-border p-8 lg:p-12 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <h3 className="font-display text-2xl font-bold text-foreground mb-4">
          Message Sent!
        </h3>
        <p className="text-ink-500 mb-6">
          Thank you for reaching out. We have received your message and will get back to you within 24 hours.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setFormState({
              name: '',
              email: '',
              phone: '',
              company: '',
              inquiryType: '',
              message: ''
            });
          }}
          className="text-accent hover:text-accent-hover font-medium transition-colors"
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formState.name}
              onChange={handleChange}
              placeholder="John Smith"
              className="w-full pl-10 pr-4 py-3 bg-rice-50 border border-border rounded-xl text-foreground placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all min-h-[44px]"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formState.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full pl-10 pr-4 py-3 bg-rice-50 border border-border rounded-xl text-foreground placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all min-h-[44px]"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formState.phone}
              onChange={handleChange}
              placeholder="(316) 555-0123"
              className="w-full pl-10 pr-4 py-3 bg-rice-50 border border-border rounded-xl text-foreground placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all min-h-[44px]"
            />
          </div>
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
            Company
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input
              type="text"
              id="company"
              name="company"
              value={formState.company}
              onChange={handleChange}
              placeholder="Your Company (optional)"
              className="w-full pl-10 pr-4 py-3 bg-rice-50 border border-border rounded-xl text-foreground placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all min-h-[44px]"
            />
          </div>
        </div>
      </div>

      {/* Inquiry Type */}
      <div>
        <label htmlFor="inquiryType" className="block text-sm font-medium text-foreground mb-2">
          Inquiry Type *
        </label>
        <div className="relative">
          <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
          <select
            id="inquiryType"
            name="inquiryType"
            required
            value={formState.inquiryType}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 bg-rice-50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all min-h-[44px] appearance-none cursor-pointer"
          >
            {inquiryTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400 rotate-90" />
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
          Message *
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-ink-400" />
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            value={formState.message}
            onChange={handleChange}
            placeholder="How can we help you? Tell us about your needs..."
            className="w-full pl-10 pr-4 py-3 bg-rice-50 border border-border rounded-xl text-foreground placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-xl transition-all",
          isSubmitting
            ? "bg-ink-400 cursor-not-allowed"
            : "bg-accent hover:bg-accent-hover shadow-zen hover:shadow-zen-lg"
        )}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          <>
            Send Message
            <Send className="w-5 h-5" />
          </>
        )}
      </button>

      <p className="text-xs text-ink-400 text-center">
        By submitting this form, you agree to our{" "}
        <Link href="#" className="text-accent hover:underline">Privacy Policy</Link>.
        We will never share your information.
      </p>
    </form>
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
          Contact Us
        </span>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
          Let's{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-vermillion-dark">
            Connect
          </span>
        </h1>
        <p className="text-lg lg:text-xl text-ink-500 max-w-2xl mx-auto">
          Have questions about Foreclosure Funder? Want to learn more about Deal Room? 
          We are here to help. Reach out and we will respond within 24 hours.
        </p>
      </motion.div>
    </section>
  );
}

function ContactMethodsSection() {
  return (
    <section className="py-12 lg:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          {contactMethods.map((method, idx) => (
            <ContactMethodCard key={idx} method={method} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FormSection() {
  return (
    <section className="py-24 lg:py-32 bg-rice-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Send Us a Message
            </h2>
            <p className="text-ink-500 mb-8">
              Fill out the form and we will get back to you as soon as possible. 
              For Deal Room inquiries, Mike will reach out personally.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Response Time</h4>
                  <p className="text-sm text-ink-500">
                    We typically respond within 24 hours during business days (Mon-Fri, 9am-5pm CST).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Schedule a Demo</h4>
                  <p className="text-sm text-ink-500">
                    Select "Demo" as your inquiry type to schedule a personalized walkthrough 
                    of the platform.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-indigo" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Deal Room Sales</h4>
                  <p className="text-sm text-ink-500">
                    Interested in a branded deal room for your investor group? 
                    Mike handles all Deal Room inquiries personally.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <ContactForm />
          </motion.div>
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
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-ink-500">
            Quick answers to common questions about contacting us.
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
            Ready to Get Started?
          </h2>
          <p className="text-lg text-white/70 mb-8">
            Try Foreclosure Funder free for 7 days. No credit card required.
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
              View Pricing
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Main Page
export default function ContactPage() {
  return (
    <>
      <HeroSection />
      <ContactMethodsSection />
      <FormSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
