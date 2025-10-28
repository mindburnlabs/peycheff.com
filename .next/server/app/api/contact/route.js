"use strict";(()=>{var e={};e.id=386,e.ids=[386],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},4770:e=>{e.exports=require("crypto")},2907:(e,t,o)=>{o.r(t),o.d(t,{originalPathname:()=>A,patchFetch:()=>I,requestAsyncStorage:()=>b,routeModule:()=>x,serverHooks:()=>w,staticGenerationAsyncStorage:()=>v});var r={};o.r(r),o.d(r,{OPTIONS:()=>f,POST:()=>y});var a=o(9303),s=o(8716),i=o(3131),n=o(7070),l=o(2723),c=o(5192),p=o(8605);let d=new l.R(process.env.RESEND_API_KEY||"test_key"),g=(0,p.createRateLimit)(p.RATE_LIMITS["/api/contact"]),m=c.z.object({name:c.z.string().min(2,"Name must be at least 2 characters"),email:c.z.string().email("Please provide a valid email address"),company:c.z.string().optional(),message:c.z.string().min(10,"Message must be at least 10 characters"),goal:c.z.string().optional()}),u={CONTACT_NOTIFICATION:{subject:e=>`New Contact Inquiry from ${e}`,html:e=>`
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0A84FF 0%, #007AFF 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">New Contact Inquiry</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">peycheff.com</p>
        </div>

        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Contact Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 500; width: 100px;">Name:</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-weight: 600;">${e.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Email:</td>
              <td style="padding: 8px 0;">
                <a href="mailto:${e.email}" style="color: #0A84FF; text-decoration: none;">${e.email}</a>
              </td>
            </tr>
            ${e.company?`
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Company:</td>
              <td style="padding: 8px 0; color: #1a1a1a;">${e.company}</td>
            </tr>
            `:""}
            ${e.goal?`
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Goal:</td>
              <td style="padding: 8px 0; color: #1a1a1a;">${e.goal}</td>
            </tr>
            `:""}
          </table>
        </div>

        <div style="background: white; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Message</h2>
          <p style="color: #374151; line-height: 1.6; margin: 0; white-space: pre-wrap;">${e.message}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="mailto:${e.email}?subject=Re: Your inquiry"
             style="background: #0A84FF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Reply to ${e.name}
          </a>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 14px;">
          <p>Received at ${new Date().toLocaleString("en-US",{timeZone:"America/New_York",dateStyle:"full",timeStyle:"short"})}</p>
        </div>
      </div>
    `},CONTACT_CONFIRMATION:{subject:"Thanks for reaching out - I'll reply within 24 hours",html:e=>`
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0A84FF 0%, #007AFF 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Thanks, ${e.name}!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 18px;">I'll review your message and reply within 24 hours.</p>
        </div>

        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">What I received:</h2>
          <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #0A84FF;">
            <p style="color: #374151; line-height: 1.6; margin: 0; font-style: italic;">"${e.message.length>200?e.message.substring(0,200)+"...":e.message}"</p>
          </div>
          ${e.goal||e.company?`
          <div style="margin-top: 15px; font-size: 14px; color: #6b7280;">
            ${e.company?`<strong>Company:</strong> ${e.company}`:""}
            ${e.company&&e.goal?" • ":""}
            ${e.goal?`<strong>Goal:</strong> ${e.goal}`:""}
          </div>
          `:""}
        </div>

        <div style="background: white; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">What happens next?</h2>
          <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">I'll review your inquiry and research your background</li>
            <li style="margin-bottom: 8px;">If it's a good fit, I'll reply with next steps within 24 hours</li>
            <li style="margin-bottom: 8px;">For complex projects, I might suggest a quick call to clarify details</li>
            <li>All initial conversations are free - no commitment required</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #6b7280;">
          <p style="margin: 0 0 10px 0;">Need to add something? Just reply to this email.</p>
          <p style="margin: 0; font-size: 14px;">
            Ivan Peycheff<br>
            <a href="mailto:ivan@peycheff.com" style="color: #0A84FF; text-decoration: none;">ivan@peycheff.com</a>
          </p>
        </div>
      </div>
    `}},h=async e=>{try{let t=await d.emails.send({from:"Ivan Peycheff <ivan@peycheff.com>",to:e.to,subject:e.subject,html:e.html,replyTo:e.replyTo||"ivan@peycheff.com"});return console.log("Email sent successfully:",t),{success:!0,data:t}}catch(e){return console.error("Email sending failed:",e),{success:!1,error:e.message}}};async function y(e){try{(0,p.getClientIP)(e);let t=(0,p.validateRequest)(e);if(!t.valid)return n.NextResponse.json({success:!1,error:"Invalid request",reason:t.reason},{status:400});let o=await g(e);if(!o.success)return n.NextResponse.json({success:!1,error:o.error},{status:o.statusCode,headers:{"Retry-After":o.retryAfter?.toString()||"3600"}});let r=await e.json(),a=m.parse(r),s=[];if(/<script|javascript:|onload=|onerror=/i.test(a.name)&&s.push("name contains suspicious content"),/(<script|javascript:|onload=|onerror=|base64_encode|eval|exec|system)/i.test(a.message)&&s.push("message contains suspicious content"),a.message.length>5e3&&s.push("message too long"),s.length>0)return n.NextResponse.json({success:!1,error:"Invalid input detected",reasons:s},{status:400});if(!process.env.RESEND_API_KEY)return console.error("RESEND_API_KEY environment variable is required"),n.NextResponse.json({success:!1,error:"Email service not configured. Please contact support."},{status:500});let i=await h({to:process.env.CONTACT_EMAIL||"ivan@peycheff.com",subject:u.CONTACT_NOTIFICATION.subject(a.name),html:u.CONTACT_NOTIFICATION.html(a),replyTo:a.email});if(!i.success)return console.error("Failed to send notification email:",i.error),n.NextResponse.json({success:!1,error:"Failed to send notification. Please try again later."},{status:500});let l=await h({to:a.email,subject:u.CONTACT_CONFIRMATION.subject,html:u.CONTACT_CONFIRMATION.html(a)});return l.success||console.error("Failed to send confirmation email:",l.error),console.log(`New contact inquiry from ${a.email} (${a.company||"Individual"})`),n.NextResponse.json({success:!0,message:"Your message has been sent successfully! I'll get back to you within 24 hours.",inquiryId:Date.now().toString()},{headers:{"X-RateLimit-Remaining":o.remaining?.toString()||"0","X-RateLimit-Reset":new Date(o.resetTime).toISOString(),"X-Content-Type-Options":"nosniff","X-Frame-Options":"DENY"}})}catch(e){if(console.error("Contact form error:",e),e instanceof c.z.ZodError)return n.NextResponse.json({success:!1,error:"Validation failed",details:e.issues.map(e=>e.message)},{status:400});return n.NextResponse.json({success:!1,error:"An unexpected error occurred. Please try again later."},{status:500})}}async function f(e){let t=e.headers.get("origin"),o=t&&["https://peycheff.com","https://www.peycheff.com"].includes(t);return new n.NextResponse(null,{status:200,headers:{"Access-Control-Allow-Origin":o?t:"null","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type, X-Requested-With","Access-Control-Allow-Credentials":"true","Access-Control-Max-Age":"86400",Vary:"Origin"}})}let x=new a.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/contact/route",pathname:"/api/contact",filename:"route",bundlePath:"app/api/contact/route"},resolvedPagePath:"/Users/ivan/Code/peycheff.com/app/api/contact/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:b,staticGenerationAsyncStorage:v,serverHooks:w}=x,A="/api/contact/route";function I(){return(0,i.patchFetch)({serverHooks:w,staticGenerationAsyncStorage:v})}}};var t=require("../../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),r=t.X(0,[216,592],()=>o(2907));module.exports=r})();