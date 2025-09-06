import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full py-4 flex items-center justify-between text-left hover:text-accent transition-colors duration-150"
      >
        <span className="text-foreground font-medium text-sm pr-4">
          {question}
        </span>
        <Icon 
          name={isOpen ? "ChevronUp" : "ChevronDown"} 
          size={20} 
          className="text-text-secondary flex-shrink-0"
        />
      </button>
      {isOpen && (
        <div className="pb-4 animate-slide-down">
          <p className="text-text-secondary text-sm leading-relaxed">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
};

const FAQSection = () => {
  const [openItems, setOpenItems] = useState(new Set([0])); // First item open by default

  const faqData = [
    {
      question: "How do advisory engagements typically work?",
      answer: `Advisory engagements are flexible and tailored to your specific needs. Most start with a comprehensive assessment of your current systems and challenges, followed by strategic recommendations and ongoing support. Engagements can range from one-time consultations to long-term advisory relationships spanning several months.`
    },
    {
      question: "What\'s the typical duration and time commitment?",
      answer: `Engagements vary based on scope and complexity. Strategic consultations might be 2-4 weeks, while comprehensive system redesigns can take 2-3 months. Most clients commit to 5-10 hours per week during active phases, with regular check-ins and milestone reviews.`
    },
    {
      question: "Do you work with early-stage startups or only established companies?",
      answer: `I work with companies at various stages, from early-stage startups to established enterprises. The approach is tailored to your current stage - early-stage companies focus on foundational systems and scalable architecture, while established companies often need optimization and advanced scaling strategies.`
    },
    {
      question: "What\'s included in the strategic planning service?",
      answer: `Strategic planning includes comprehensive business analysis, systems architecture review, scalability assessment, team structure optimization, technology roadmap development, and implementation timeline. You'll receive detailed documentation, actionable recommendations, and ongoing support during execution.`
    },
    {
      question: "How do you measure success in advisory relationships?",
      answer: `Success metrics are defined collaboratively at the start of each engagement. Common measures include system performance improvements, team productivity gains, reduced operational complexity, faster time-to-market, and achievement of specific business objectives. Regular reviews ensure we're meeting your goals.`
    },
    {
      question: "Can you work with remote teams and international companies?",
      answer: `Absolutely. I regularly work with distributed teams and international companies. All advisory services can be delivered remotely through video calls, collaborative tools, and digital documentation. Time zone coordination is managed to ensure effective communication and progress.`
    }
  ];

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems?.has(index)) {
      newOpenItems?.delete(index);
    } else {
      newOpenItems?.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-foreground font-semibold text-xl">
            Frequently Asked Questions
          </h3>
          <p className="text-text-secondary text-sm">
            Common questions about advisory services and working relationships
          </p>
        </div>

        <div className="space-y-0">
          {faqData?.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq?.question}
              answer={faq?.answer}
              isOpen={openItems?.has(index)}
              onToggle={() => toggleItem(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQSection;