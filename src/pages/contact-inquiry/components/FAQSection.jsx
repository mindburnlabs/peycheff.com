import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState(0);

  const faqs = [
    {
      question: "What types of projects do you typically work on?",
      answer: `I specialize in systems design for startups and scale-ups, focusing on:\n\n• Product architecture and technical strategy\n• User experience optimization and conversion improvement\n• Team structure and development process optimization\n• Advisory services for founders and technical leaders\n\nI work best with companies that have product-market fit and are looking to scale efficiently.`
    },
    {
      question: "How do you structure your engagements?",
      answer: `I offer flexible engagement models based on your needs:\n\n• **Project-based:** Fixed scope with defined deliverables (4-12 weeks)\n• **Retainer:** Ongoing advisory and support (monthly commitment)\n• **Intensive:** Deep-dive workshops and strategy sessions (1-2 weeks)\n\nAll engagements start with a discovery phase to ensure we're aligned on goals and approach.`
    },
    {
      question: "What\'s your typical response time and availability?",
      answer: `I respond to all inquiries within 24 hours, usually much sooner. For ongoing projects:\n\n• Regular check-ins and updates within 48 hours\n• Urgent matters addressed within 4 hours during business days\n• Available for calls in PST/PDT timezone, with flexibility for global clients\n\nI work with a limited number of clients to ensure quality and attention.`
    },
    {
      question: "Do you work with early-stage startups?",
      answer: `I primarily work with startups that have:\n\n• Product-market fit or strong early traction\n• Funding to invest in proper systems and processes\n• A team ready to implement recommendations\n• Clear business goals and success metrics\n\nFor very early-stage companies, I recommend starting with my newsletter and content for foundational knowledge.`
    },
    {
      question: "What information should I include in my inquiry?",
      answer: `The more context you provide, the better I can help. Include:\n\n• Your current challenges and what you've tried\n• Business goals and success metrics\n• Team size and technical background\n• Timeline and budget considerations\n• Specific outcomes you're hoping to achieve\n\nDon't worry about having all the answers - we'll figure it out together.`
    },
    {
      question: "Do you offer any guarantees on your work?",
      answer: `While I can't guarantee specific business outcomes (too many variables), I do guarantee:\n\n• Clear, actionable recommendations based on proven frameworks\n• Regular communication and transparency throughout the engagement\n• Deliverables that meet the agreed-upon scope and timeline\n• A collaborative approach that builds your team's capabilities\n\nMy goal is your long-term success, not just completing a project.`
    }
  ];

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? -1 : index);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-foreground font-semibold text-xl">
          Frequently Asked Questions
        </h3>
        <p className="text-text-secondary">
          Common questions about working together and my process.
        </p>
      </div>
      <div className="space-y-4">
        {faqs?.map((faq, index) => (
          <div
            key={index}
            className="bg-card rounded-lg border border-border overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-surface/50 transition-colors duration-150 ease-out"
            >
              <h4 className="text-foreground font-medium pr-4">
                {faq?.question}
              </h4>
              <Icon
                name={openFAQ === index ? "ChevronUp" : "ChevronDown"}
                size={20}
                className="text-text-secondary flex-shrink-0"
              />
            </button>
            
            {openFAQ === index && (
              <div className="px-6 pb-4 animate-slide-down">
                <div className="pt-2 border-t border-border">
                  <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
                    {faq?.answer}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="bg-surface rounded-lg p-6 border border-border">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="MessageCircle" size={24} color="var(--color-accent)" />
          </div>
          <div className="space-y-2">
            <h4 className="text-foreground font-medium">
              Still have questions?
            </h4>
            <p className="text-text-secondary text-sm">
              Don't see your question here? Feel free to reach out directly. I'm happy to discuss your specific situation and how I might be able to help.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;