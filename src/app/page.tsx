import Link from 'next/link';
import { 
  MessageSquare, 
  Zap, 
  Clock, 
  Brain, 
  ArrowRight,
  Check,
  Bot,
  Send
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Train on Your Content',
    description: 'Upload your website, FAQs, or documents. Your chatbot learns your business in minutes.',
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Never miss a lead again. Your AI assistant answers questions around the clock.',
  },
  {
    icon: Zap,
    title: 'Instant Responses',
    description: 'No more waiting. Customers get answers in seconds, not hours.',
  },
  {
    icon: MessageSquare,
    title: 'Human Handoff',
    description: 'Complex questions? The bot smoothly escalates to your team when needed.',
  },
];

const pricingTiers = [
  {
    name: 'Starter',
    price: 29,
    description: 'Perfect for small businesses just getting started.',
    features: [
      '1,000 AI messages/month',
      '1 knowledge source',
      'Basic customization',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Growth',
    price: 49,
    description: 'For growing businesses with more traffic.',
    features: [
      '5,000 AI messages/month',
      '5 knowledge sources',
      'Full customization',
      'Priority support',
      'Analytics dashboard',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Pro',
    price: 99,
    description: 'For businesses that need more power.',
    features: [
      '20,000 AI messages/month',
      'Unlimited knowledge sources',
      'White-label branding',
      'API access',
      'Dedicated support',
      'Custom integrations',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[var(--primary)]">
            <MessageSquare className="w-6 h-6" />
            <span className="font-bold text-lg">ChatBot Pro</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Sign in
            </Link>
            <Link 
              href="/signup"
              className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--primary-light)] text-[var(--primary)] text-sm font-medium rounded-full mb-6">
            <Zap className="w-4 h-4" />
            <span>AI-powered customer support</span>
          </div>
          <h1 className="text-5xl font-bold text-[var(--text-primary)] leading-tight mb-6">
            Answer customer questions
            <br />
            <span className="text-[var(--primary)]">24/7 with AI</span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
            Train an AI chatbot on your business in minutes. Embed it on your website. 
            Never miss a lead again.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link 
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-lg transition-colors"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="text-sm text-[var(--text-tertiary)]">
              14 days free. No credit card required.
            </span>
          </div>
        </div>
      </section>

      {/* Demo Widget Preview */}
      <section className="py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[var(--surface-secondary)] rounded-2xl p-8 relative overflow-hidden min-h-[500px]">
            {/* Mock website content */}
            <div className="max-w-md">
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-full mb-3" />
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-6" />
              <div className="h-3 bg-gray-200 rounded w-full mb-3" />
              <div className="h-3 bg-gray-200 rounded w-5/6 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-4/5" />
            </div>

            {/* Widget Preview */}
            <div 
              className="absolute bottom-8 right-8 w-[340px] rounded-2xl shadow-xl overflow-hidden"
              style={{ boxShadow: '0 0 40px rgba(0, 0, 0, 0.12)' }}
            >
              {/* Header */}
              <div className="h-14 px-4 flex items-center gap-3 bg-[var(--primary)]">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">Support</div>
                  <div className="text-xs text-white/80">Usually replies instantly</div>
                </div>
              </div>

              {/* Messages */}
              <div className="bg-[var(--surface-secondary)] p-4 h-[240px] space-y-3">
                <div className="flex items-end gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--primary-light)] flex-shrink-0 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[var(--primary)]" />
                  </div>
                  <div className="max-w-[240px] px-4 py-2.5 bg-[var(--chat-bot)] text-[var(--text-primary)] rounded-2xl rounded-bl-sm text-sm">
                    Hi! How can I help you today?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[240px] px-4 py-2.5 bg-[var(--primary)] text-white rounded-2xl rounded-br-sm text-sm">
                    What are your business hours?
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--primary-light)] flex-shrink-0 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[var(--primary)]" />
                  </div>
                  <div className="max-w-[240px] px-4 py-2.5 bg-[var(--chat-bot)] text-[var(--text-primary)] rounded-2xl rounded-bl-sm text-sm">
                    We are open Monday through Friday, 9 AM to 6 PM EST!
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="bg-white p-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-2.5 bg-[var(--surface-tertiary)] rounded-full text-sm text-[var(--text-tertiary)]">
                    Type your message...
                  </div>
                  <button className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center">
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-[var(--surface-secondary)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              Everything you need to support customers
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Stop losing leads to slow response times. Let AI handle the routine questions 
              so your team can focus on what matters.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="bg-white p-6 rounded-xl border border-gray-200"
              >
                <div className="w-12 h-12 rounded-lg bg-[var(--primary-light)] flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-secondary)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Start free for 14 days. No credit card required. 
              Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <div 
                key={tier.name}
                className={`rounded-2xl border-2 p-8 ${
                  tier.popular 
                    ? 'border-[var(--primary)] bg-[var(--primary-light)]/30 relative' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--primary)] text-white text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                  {tier.name}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-[var(--text-primary)]">${tier.price}</span>
                  <span className="text-[var(--text-secondary)]">/month</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-6">
                  {tier.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                      <Check className="w-4 h-4 text-[var(--success)]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block w-full py-2.5 text-center text-sm font-medium rounded-lg transition-colors ${
                    tier.popular
                      ? 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white'
                      : 'bg-[var(--surface-tertiary)] hover:bg-gray-200 text-[var(--text-primary)]'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[var(--primary)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to stop missing leads?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Join hundreds of businesses using AI to provide instant customer support.
          </p>
          <Link 
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[var(--primary)] font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Start Your Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold">ChatBot Pro</span>
          </div>
          <p className="text-sm text-[var(--text-tertiary)]">
            © 2024 ChatBot Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
