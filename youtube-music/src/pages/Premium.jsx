import { useState } from 'react';
import { Check, X, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const features = [
  { name: 'Ad-free music', free: false, premium: true },
  { name: 'Background play', free: false, premium: true },
  { name: 'Downloads', free: false, premium: true },
  { name: 'High quality audio', free: false, premium: true },
  { name: 'YouTube Premium included', free: false, premium: true },
  { name: 'On-demand playback', free: true, premium: true },
  { name: 'Unlimited skips', free: false, premium: true },
];

const plans = [
  { id: 'individual', name: 'Individual', price: '₹99', period: '/month', description: 'For one person', highlight: true },
  { id: 'student', name: 'Student', price: '₹59', period: '/month', description: 'Verified students only' },
  { id: 'family', name: 'Family', price: '₹149', period: '/month', description: 'Up to 6 members' },
];

const faqs = [
  { q: 'What is YouTube Music Premium?', a: 'YouTube Music Premium gives you ad-free access to millions of songs, music videos, and podcasts. You can also download content for offline listening and enjoy background play on your mobile device.' },
  { q: 'How does the free trial work?', a: 'New subscribers get 1 month of YouTube Music Premium for free. You can cancel anytime during the trial without being charged.' },
  { q: 'Can I share my subscription?', a: 'The Family plan allows up to 6 members in the same household to share a subscription. Each member gets their own personal account.' },
  { q: 'What audio quality is available?', a: 'Premium subscribers can stream music at up to 256 kbps AAC quality. We also offer high-quality audio streaming for supported devices.' },
  { q: 'How do I cancel my subscription?', a: 'You can cancel your subscription anytime from your account settings. You\'ll continue to have access until the end of your billing period.' },
];

export default function Premium() {
  const [openFaq, setOpenFaq] = useState(null);
  const { showToast } = usePlayer();

  return (
    <div className="pb-8">
      {/* Hero Section */}
      <section className="relative mb-12 px-2">
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#FF0000] via-[#CC0000] to-[#0F0F0F] p-8 sm:p-12 lg:p-16 text-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Star size={16} className="text-yellow-400" fill="currentColor" />
              <span className="text-sm text-white font-medium">YouTube Music Premium</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Try 1 Month Free
            </h1>
            <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
              Ad-free music, offline listening, and background play. Get YouTube Music Premium today.
            </p>
            <button
              onClick={() => showToast('Premium trial activated!')}
              className="px-8 py-3 bg-white text-black rounded-full font-bold text-lg hover:bg-white/90 transition-colors duration-200 shadow-xl"
            >
              Get Premium
            </button>
          </div>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="mb-12 px-2">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Why Go Premium?</h2>
        <div className="max-w-2xl mx-auto bg-[#1F1F1F] rounded-2xl overflow-hidden border border-white/5">
          <div className="grid grid-cols-3 px-6 py-4 border-b border-white/5 bg-[#282828]">
            <span className="text-sm font-medium text-[#AAAAAA]">Feature</span>
            <span className="text-sm font-medium text-[#AAAAAA] text-center">Free</span>
            <span className="text-sm font-medium text-[#FF0000] text-center">Premium</span>
          </div>
          {features.map((feature, i) => (
            <div key={i} className="grid grid-cols-3 px-6 py-4 border-b border-white/5 last:border-b-0 hover:bg-[#282828] transition-colors">
              <span className="text-sm text-white">{feature.name}</span>
              <div className="flex justify-center">
                {feature.free ? (
                  <Check size={18} className="text-green-500" />
                ) : (
                  <X size={18} className="text-[#AAAAAA]/50" />
                )}
              </div>
              <div className="flex justify-center">
                <Check size={18} className="text-[#FF0000]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="mb-12 px-2">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 border transition-all duration-200 hover:scale-[1.02] ${
                plan.highlight
                  ? 'bg-gradient-to-br from-[#FF0000]/20 to-[#1F1F1F] border-[#FF0000]/50'
                  : 'bg-[#1F1F1F] border-white/5 hover:border-white/10'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF0000] text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-xs text-[#AAAAAA] mb-4">{plan.description}</p>
              <div className="flex items-baseline gap-0.5 mb-6">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-sm text-[#AAAAAA]">{plan.period}</span>
              </div>
              <button
                onClick={() => showToast(`${plan.name} plan selected!`)}
                className={`w-full py-3 rounded-full font-medium text-sm transition-colors duration-200 ${
                  plan.highlight
                    ? 'bg-[#FF0000] text-white hover:bg-[#CC0000]'
                    : 'bg-white text-black hover:bg-white/90'
                }`}
              >
                Start Free Trial
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-2 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-[#1F1F1F] rounded-xl overflow-hidden border border-white/5">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="flex items-center justify-between w-full px-6 py-4 text-left"
              >
                <span className="text-sm font-medium text-white pr-4">{faq.q}</span>
                {openFaq === index ? (
                  <ChevronUp size={18} className="text-[#AAAAAA] flex-shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-[#AAAAAA] flex-shrink-0" />
                )}
              </button>
              {openFaq === index && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-[#AAAAAA] leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
