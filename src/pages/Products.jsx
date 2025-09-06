import React from 'react';
import SEO from '../components/SEO';
import { ProductCard, QuickBuyButton } from '../components/ProductButton';
import Icon from '../components/AppIcon';

const Products = () => {
  const categories = {
    advisory: {
      title: 'Advisory Services',
      description: 'Direct access to my thinking and experience',
      products: ['STRATEGY_CALL', 'SPARRING_PACK', 'OFFICE_HOURS']
    },
    digital: {
      title: 'Digital Products',
      description: 'Playbooks, templates, and systems I use',
      products: ['OPERATOR_PACK', 'AUTOMATION_KIT', 'DIAGRAM_LIBRARY']
    },
    membership: {
      title: 'Membership',
      description: 'Ongoing access to insights and early products',
      products: ['BUILD_NOTES_MONTHLY', 'BUILD_NOTES_YEARLY']
    },
    deposits: {
      title: 'Project Deposits',
      description: 'Reserve your spot for larger engagements',
      products: ['SYSTEMS_AUDIT_DEPOSIT', 'BUILD_SPRINT_DEPOSIT']
    }
  };

  return (
    <>
      <SEO 
        title="Products & Services"
        description="Playbooks, templates, advisory services, and systems from Ivan Peycheff. Digital products and direct access to proven frameworks."
      />
      
      <div className="py-16 min-h-screen">
        <div className="container max-w-7xl mx-auto px-6">
          {/* Header */}
          <section className="pt-32 pb-24 text-center">
            <h1 className="text-5xl font-bold mb-8">
              Products & Services
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Everything I build, think, and do—distilled into formats you can use. 
              <br className="hidden sm:block" />
              From quick calls to complete systems.
            </p>
          </section>

          {/* Categories */}
          {Object.entries(categories).map(([key, category], index) => (
            <section key={key} className="py-16">
              {index > 0 && (
                <div className="w-24 h-px bg-border mx-auto mb-16" />
              )}
              
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">
                  {category.title}
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {category.description}
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8 mb-16">
                {category.products.map(productKey => (
                  <ProductCard
                    key={productKey}
                    productKey={productKey}
                    featured={productKey === 'STRATEGY_CALL' || productKey === 'BUILD_NOTES_YEARLY'}
                  />
                ))}
              </div>
            </section>
          ))}

          {/* Value Props */}
          <section className="py-20 bg-surface/50 -mx-6 px-6 rounded-2xl border border-border/30">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">Why these work</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything here is battle-tested. These aren't theoretical frameworks—
                they're what I actually use to ship products and run systems.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Target" size={24} className="text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Battle-tested</h3>
                <p className="text-muted-foreground">
                  Used in real projects with real deadlines. No academic theories.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Clock" size={24} className="text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Time-compressed</h3>
                <p className="text-muted-foreground">
                  Designed for speed. Get to outcomes without the fluff.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Zap" size={24} className="text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Immediately actionable</h3>
                <p className="text-muted-foreground">
                  You can start implementing within hours, not weeks.
                </p>
              </div>
            </div>
          </section>

          {/* Quick Access */}
          <section className="py-20 text-center">
            <h2 className="text-3xl font-bold mb-6">Popular picks</h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Most people start here. Pick what matches your timeline and budget.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <QuickBuyButton productKey="STRATEGY_CALL" className="text-lg" />
              <QuickBuyButton productKey="OPERATOR_PACK" className="text-lg" />
              <QuickBuyButton productKey="BUILD_NOTES_MONTHLY" className="text-lg" />
              <QuickBuyButton productKey="AUTOMATION_KIT" className="text-lg" />
            </div>
          </section>

          {/* Trust & Guarantee */}
          <section className="py-16 text-center border-t border-neutral-200">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="flex flex-col items-center">
                  <Icon name="Shield" size={32} className="text-green-600 mb-3" />
                  <h3 className="font-semibold mb-2">30-day guarantee</h3>
                  <p className="text-sm text-muted-foreground">
                    Not satisfied? Full refund, no questions asked.
                  </p>
                </div>
                
                <div className="flex flex-col items-center">
                  <Icon name="Lock" size={32} className="text-blue-400 mb-3" />
                  <h3 className="font-semibold mb-2">Secure payments</h3>
                  <p className="text-sm text-muted-foreground">
                    SSL encrypted, processed by Stripe.
                  </p>
                </div>
                
                <div className="flex flex-col items-center">
                  <Icon name="Mail" size={32} className="text-accent mb-3" />
                  <h3 className="font-semibold mb-2">Instant delivery</h3>
                  <p className="text-sm text-muted-foreground">
                    Digital products delivered immediately via email.
                  </p>
                </div>
              </div>

              <p className="text-muted-foreground italic">
                Questions? <a href="/contact" className="text-accent hover:underline">Get in touch</a> and 
                I'll help you pick the right option.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Products;
