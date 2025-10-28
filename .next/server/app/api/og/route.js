(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[582],{2067:e=>{"use strict";e.exports=require("node:async_hooks")},6195:e=>{"use strict";e.exports=require("node:buffer")},7764:(e,t,o)=>{"use strict";o.r(t),o.d(t,{ComponentMod:()=>Z,default:()=>w});var i={};o.r(i),o.d(i,{GET:()=>u,runtime:()=>d});var a={};o.r(a),o.d(a,{originalPathname:()=>h,patchFetch:()=>x,requestAsyncStorage:()=>m,routeModule:()=>f,serverHooks:()=>y,staticGenerationAsyncStorage:()=>g});var r=o(5214),s=o(2561),n=o(4828),p=o(6631);let l=[{id:"ai-saas-starter",name:"AI SaaS Starter Kit",description:"Complete SaaS foundation with AI integration, payment processing, and user management.",price:497,type:"product",category:"Development Tools",features:["AI-powered features out of the box","Stripe payment integration","User authentication & management","Next.js 14 with App Router","Database setup with Supabase","Email notifications with Resend"],stripePriceId:"price_1OGqdGKZpZpZpZpZpZpZpZpZ",popular:!0},{id:"product-launch-system",name:"Product Launch System",description:"Step-by-step framework for launching digital products that generate revenue from day one.",price:197,type:"playbook",category:"Strategy",features:["Pre-launch checklist","Launch day timeline","Post-launch optimization","Marketing templates","Analytics setup guide","Customer feedback loops"],stripePriceId:"price_1OGqdHKZpZpZpZpZpZpZpZpZ"},{id:"revenue-growth-playbook",name:"Revenue Growth Playbook",description:"Proven strategies to scale your digital product from $0 to $10K MRR.",price:297,type:"playbook",category:"Growth",features:["Pricing strategy frameworks","Customer acquisition tactics","Conversion optimization","Retention strategies","Upsell & cross-sell techniques","Financial modeling templates"],stripePriceId:"price_1OGqdIKZpZpZpZpZpZpZpZpZ"},{id:"ai-automation-kit",name:"AI Automation Kit",description:"Ready-to-use AI workflows and automations for your business.",price:397,type:"product",category:"Automation",features:["ChatGPT integration templates","Automated content generation","Customer support automation","Data analysis workflows","API integration guides","Custom AI model setup"],stripePriceId:"price_1OGqdJKZpZpZpZpZpZpZpZpZ"},{id:"technical-due-diligence",name:"Technical Due Diligence Checklist",description:"Comprehensive technical audit framework for M&A and investment.",price:997,type:"playbook",category:"Due Diligence",features:["Code review framework","Infrastructure assessment","Security audit checklist","Performance benchmarks","Scalability analysis","Risk assessment matrix"],stripePriceId:"price_1OGqdKKZpZpZpZpZpZpZpZpZ"},{id:"strategy-session",name:"1-on-1 Strategy Session",description:"Personalized guidance to transform your idea into a revenue-generating product.",price:5e3,type:"service",category:"Consulting",features:["90-minute deep-dive session","Custom roadmap development","Technical architecture review","Go-to-market strategy","Resource optimization","30-day follow-up support"],popular:!0}],c=e=>l.find(t=>t.id===e),d="edge";async function u(e){try{let{searchParams:t}=new URL(e.url),o=t.get("product"),i=t.get("title")||"Ivan Peycheff - Digital Products & Services",a=t.get("description")||"Premium products, playbooks, and consulting for builders who ship.",r=i,s=a,n=null;if(o){let e=c(o);e&&(r=e.name,s=e.description,n=`$${e.price}`)}let p=`
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0a0a0a" />
            <stop offset="100%" style="stop-color:#1a1a1a" />
          </linearGradient>
          <linearGradient id="text" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#ffffff" />
            <stop offset="100%" style="stop-color:#d1d5db" />
          </linearGradient>
          <linearGradient id="bottom" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#10b981" />
            <stop offset="50%" style="stop-color:#059669" />
            <stop offset="100%" style="stop-color:#10b981" />
          </linearGradient>
        </defs>

        <!-- Background -->
        <rect width="1200" height="630" fill="url(#bg)" />

        <!-- Brand -->
        <text x="600" y="120" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              font-size="32" font-weight="700" fill="#10b981" text-anchor="middle" letter-spacing="-0.5">
          IVAN PEYCHEFF
        </text>

        <!-- Product Title -->
        <text x="600" y="${n?"280":"260"}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              font-size="${n?"64":"56"}" font-weight="700" fill="url(#text)" text-anchor="middle" letter-spacing="-1">
          ${r}
        </text>

        <!-- Price (if product) -->
        ${n?`
          <rect x="480" y="320" width="240" height="80" rx="12" fill="rgba(16, 185, 129, 0.1)"
                stroke="rgba(16, 185, 129, 0.3)" stroke-width="2" />
          <text x="600" y="375" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                font-size="48" font-weight="700" fill="#10b981" text-anchor="middle">
            ${n}
          </text>
        `:""}

        <!-- Description -->
        <text x="600" y="${n?"460":"400"}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              font-size="24" fill="#9ca3af" text-anchor="middle">
          ${s}
        </text>

        <!-- Call to action -->
        <rect x="450" y="${n?"520":"460"}" width="300" height="60" rx="12"
              fill="rgba(16, 185, 129, 0.1)" stroke="rgba(16, 185, 129, 0.3)" stroke-width="1" />
        <circle cx="480" cy="${n?"550":"490"}" r="6" fill="#10b981" />
        <text x="600" y="${n?"560":"500"}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              font-size="18" font-weight="600" fill="#10b981" text-anchor="middle">
          peycheff.com
        </text>

        <!-- Bottom decoration -->
        <rect x="0" y="626" width="1200" height="4" fill="url(#bottom)" />
      </svg>
    `;return new Response(p,{headers:{"Content-Type":"image/svg+xml","Cache-Control":"public, max-age=3600, s-maxage=3600"}})}catch(e){return console.error("OG generation error:",e),new Response("Failed to generate OG image",{status:500})}}let f=new s.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/og/route",pathname:"/api/og",filename:"route",bundlePath:"app/api/og/route"},resolvedPagePath:"/Users/ivan/Code/peycheff.com/app/api/og/route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:m,staticGenerationAsyncStorage:g,serverHooks:y}=f,h="/api/og/route";function x(){return(0,p.XH)({serverHooks:y,staticGenerationAsyncStorage:g})}let Z=a,w=r.a.wrap(f)}},e=>{var t=t=>e(e.s=t);e.O(0,[216],()=>t(7764));var o=e.O();(_ENTRIES="undefined"==typeof _ENTRIES?{}:_ENTRIES)["middleware_app/api/og/route"]=o}]);
//# sourceMappingURL=route.js.map