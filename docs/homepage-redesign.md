# CrossFit Canvas Homepage Redesign - Developer Brief

**Project**: Homepage redesign for CrossFit Canvas (crossfitcanvas.com)
**Goal**: Transform generic Squarespace template into conversion-optimized homepage that matches offline gym quality
**Reference Site**: PRVN Nashville (prvnnashville.com) - study this for design patterns and conversion architecture

## Implementation Commit History

1. **Hero Section** - `8ccc6a7`
   - Full-screen hero with gradient overlay
   - Primary and secondary CTAs
   - Animated scroll indicator

2. **Social Proof & FAQ Highlights** - `a54beae`
   - Social proof banner with 5-star rating and testimonial
   - 3-column FAQ addressing top objections

3. **Value Props & Transparent Pricing** - `d3929c6`
   - 4-pillar value proposition section
   - Transparent pricing with 3 membership tiers

4. **Complete Homepage Redesign** - `7f169ec`
   - Class breakdown timeline
   - Programs showcase (6 programs)
   - Coach spotlight (Jon & Abi)
   - Member testimonials
   - Facility highlights
   - Schedule snapshot
   - Location & contact
   - Final CTA banner
   - Enhanced footer
   - Page integration

---

## Overview & Context

CrossFit Canvas is an excellent gym (4-5 star reviews, 12,000sf facility, welcoming community) with a generic website that creates conversion barriers. This homepage redesign removes friction points and builds trust through transparency, social proof, and clear calls-to-action.

**Critical Problems to Solve:**
- Pricing hidden behind forms (major trust barrier)
- No integrated booking system
- Generic template lacks personality
- Excellent reviews not showcased
- Unclear value proposition and next steps

---

## Homepage Structure (Top to Bottom)

### SECTION 1: Hero / Above the Fold
**Purpose**: Immediate value proposition + primary CTA

**Layout**:
- Full-width background (video loop or high-energy photo of actual gym/members)
- Centered content overlay with dark gradient for text readability
- Maximum impact in first 3 seconds of visit

**Content**:
```
HEADLINE (Large, Bold):
"Your Community Gym in Caldwell, Idaho"

SUBHEADLINE (Medium weight):
"Small classes (8-12 people). Expert coaching. Every fitness level welcome."

PRIMARY CTA BUTTON (Large, high contrast):
"Book Your Free No Sweat Intro" → Links to booking/contact page

SECONDARY CTA (Text link or ghost button):
"View Class Schedule" → Links to schedule section/page
```

**Design Specs**:
- Headline: 48-60px, bold weight, white text with subtle shadow
- Subheadline: 20-24px, regular weight
- CTA button: Minimum 180px wide, 56px tall, bright contrasting color (suggest: vibrant orange/red against dark background)
- Include down arrow/scroll indicator at bottom of hero

**Technical Notes**:
- Background video preferred (30-60 second loop of classes in action)
- Fallback to high-quality photo if video unavailable
- Ensure mobile responsive (stack vertically, maintain readability)
- Hero should be 80-100vh on desktop, 70vh on mobile

---

### SECTION 2: Social Proof Banner
**Purpose**: Immediate credibility with third-party validation

**Layout**:
- Full-width colored band (light gray or brand color at 10% opacity)
- Centered content, single row on desktop, stack on mobile

**Content**:
```
⭐⭐⭐⭐⭐ 4.8 Stars from 200+ Reviews

"The coaches are amazing and the community is so welcoming!" - Sarah M.

[Google Reviews Icon] [Facebook Icon] [Yelp Icon]
```

**Design Specs**:
- Padding: 40px vertical
- Star rating: Large, golden yellow
- Quote: Italic, 18px, with attribution
- Keep brief - single testimonial only
- Icons should link to actual review profiles

---

### SECTION 3: Objection-Handling FAQ Highlights
**Purpose**: Answer top 3 questions immediately (inspired by PRVN's approach)

**Layout**:
- Three-column grid on desktop (stack on mobile)
- Icon + Headline + Answer format
- Equal height columns with centered alignment

**Content**:

**Column 1:**
```
Icon: ✓ or Question Mark
QUESTION: "Do I need experience?"
ANSWER: "Absolutely not! We work with complete beginners every day.
Every workout is scaled to your current fitness level by our expert coaches."
```

**Column 2:**
```
Icon: Clock
QUESTION: "What's a typical class like?"
ANSWER: "60-minute classes with warm-up, skill work, and workout.
Small groups (8-12 people) ensure individual attention and proper form."
```

**Column 3:**
```
Icon: Dollar Sign
QUESTION: "How much does it cost?"
ANSWER: "Unlimited membership starts at $165/month. Try us first with
21 days for $199 or a free No Sweat Intro consultation."
[Link: "See all pricing options →"]
```

**Design Specs**:
- Icons: 48px, brand color
- Question: 24px, bold, brand color
- Answer: 16px, regular weight, dark gray
- Column padding: 60px vertical, 40px horizontal
- Background: White or very light gray
- Add subtle bottom border or shadow to separate from next section

**Technical Notes**:
- CRITICAL: Display actual pricing in Column 3 - this removes major conversion barrier
- Make entire column clickable if adding hover effects
- Ensure proper grid collapse on mobile (full width stacked)

---

### SECTION 4: Value Proposition Pillars
**Purpose**: Communicate what makes CrossFit Canvas special

**Layout**:
- Four-column grid on desktop (2x2 grid on tablet, stack on mobile)
- Icon/Image + Headline + Description format

**Content**:

**Pillar 1: Expert Coaching**
```
Headline: "Certified Expert Coaches"
Description: "All coaches are CrossFit Level 1+ certified with years of
experience. We focus on proper form, safety, and helping you reach your goals."
```

**Pillar 2: Premier Facility**
```
Headline: "12,000 SF Facility"
Description: "State-of-the-art 12,000 square foot facility with Rogue equipment,
showers, recovery room, and dedicated kids' area. Everything you need under one roof."
```

**Pillar 3: Small Classes**
```
Headline: "Small Class Sizes"
Description: "Average 8-12 people per class means individual attention from coaches.
You're not just a number - we learn your name, your goals, and how to help you succeed."
```

**Pillar 4: Welcoming Community**
```
Headline: "No-Clique Community"
Description: "From first-timers to competitive athletes, everyone is welcome here.
No intimidation, no judgment - just supportive people working toward their goals together."
```

**Design Specs**:
- Background: Contrasting color from FAQ section (if FAQ is white, use light gray here)
- Padding: 80px vertical, 60px horizontal on container
- Icons: 64px, simple line-style or flat design
- Headline: 22px, bold
- Description: 16px, regular weight
- Grid gap: 40px between columns

**Technical Notes**:
- Consider using actual gym photos as backgrounds with overlay instead of icons
- If using photos, ensure text remains readable with gradient overlays
- Maintain consistent heights across columns

---

### SECTION 5: Transparent Pricing
**Purpose**: Remove the #1 conversion barrier with public pricing

**Layout**:
- Centered headline
- Three pricing cards in row (stack on mobile)
- Comparison table format with features

**Content**:

**Headline**: "Simple, Transparent Pricing"
**Subheadline**: "No contracts. No hidden fees. Cancel anytime."

**Card 1: Trial Option**
```
"Try Us First"
21 Days Unlimited
$199 one-time
---
• Unlimited classes for 21 days
• Foundations coaching included
• No commitment required
• Full facility access

[BUTTON: "Start Your Trial"]
```

**Card 2: Most Popular (Featured)**
```
"Most Popular"
Unlimited Membership
$165/month
---
• Unlimited classes per month
• All class types included
• Open gym access
• Member app & tracking

[BUTTON: "Get Started"]
```

**Card 3: Flexible Option**
```
"Flexible Schedule"
13 Classes/Month
$135/month
---
• 13 classes per month
• All class types included
• Roll over unused classes
• Open gym access

[BUTTON: "Choose This Plan"]
```

**Below Cards**:
```
Additional Options Available:
• Drop-in: $25/class
• 10-Class Pack: $200 (save $50)
• Free No Sweat Intro Consultation

[Link: "Questions about pricing? Contact us →"]
```

**Design Specs**:
- Card width: ~320px each, equal heights
- "Most Popular" card: elevated (subtle shadow), colored border or background highlight
- Card padding: 40px internal
- Price typography: $165 large (36-48px), /month small (16px)
- Features: checkmark bullets, 16px text
- CTA buttons: Full-width within card, same styling as hero CTA
- Background: White cards on light gray section background OR light cards on white background

**Technical Notes**:
- CRITICAL: All pricing must be visible without forms/clicks
- Consider adding toggle for "Monthly" vs "Annual" pricing if offering discounts
- Ensure buttons link to booking/contact with plan pre-selected
- Mobile: Stack cards vertically, maintain "Most Popular" highlight

---

### SECTION 6: What to Expect (Class Breakdown)
**Purpose**: Demystify the experience for newcomers

**Layout**:
- Two-column layout: left side has headline/intro, right side has timeline/breakdown
- OR single column with centered timeline graphic

**Content**:

**Headline**: "What Happens in a CrossFit Canvas Class?"
**Intro**: "Every 60-minute class follows a proven structure designed to improve your fitness safely and effectively."

**Timeline**:
```
0-10 min: Group Warm-Up
• Dynamic stretching and mobility
• Get blood flowing and prevent injury
• Coach introduces workout of the day

10-30 min: Skill Development
• Learn and practice specific movements
• Coaches provide individual feedback
• Build strength and technique

30-55 min: Workout (The "WOD")
• High-energy coached workout
• Scaled to your fitness level
• Push yourself with group motivation

55-60 min: Cool Down & Stretch
• Guided recovery stretching
• Celebrate efforts with classmates
• Optional: stay for open gym
```

**Design Specs**:
- Visual timeline (vertical line with time markers)
- Icons for each phase
- Use brand colors for timeline elements
- Consider using actual class photos beside each phase
- Padding: 80px vertical

---

### SECTION 7: Programs Offered
**Purpose**: Show variety beyond just CrossFit

**Layout**:
- Horizontal scrolling cards OR grid layout
- Image + Title + Brief description + "Learn More" link

**Content**:

**Programs to highlight**:
1. **CrossFit Classes** - "Our signature program. Constantly varied functional movements for all fitness levels."
2. **HYROX Training** - "Specific training for HYROX competitions. Build endurance and functional strength."
3. **Kids Program** - "Fun, age-appropriate fitness for children. Dedicated space and specialized coaching."
4. **Personal Training** - "One-on-one coaching tailored to your specific goals and schedule."
5. **Yoga Classes** - "Flexibility, mobility, and recovery. Perfect complement to strength training."
6. **Spin Classes** - "High-intensity cardio in our dedicated spin room."

**Design Specs**:
- Card size: 280px wide minimum
- Image: 280x180px (16:9 aspect ratio)
- Title: 20px bold
- Description: 14-16px, 2-3 lines maximum
- "Learn More →" link at bottom of each card
- If using horizontal scroll: add scroll indicators/arrows
- Background: Alternate color from previous section

---

### SECTION 8: Coach Spotlight
**Purpose**: Build trust through qualified, personable coaches

**Layout**:
- Centered headline
- Two featured coaches (owners Jon and Abi)
- Side-by-side on desktop, stack on mobile

**Content**:

**Headline**: "Meet Your Coaches"

**Coach 1: Jon (Example)**
```
[Professional photo of Jon coaching]

Jon - Owner & Head Coach
"CrossFit Level 2 Trainer | 8+ Years Coaching Experience"

Brief bio: "I started CrossFit Canvas to create the gym I always wanted -
where everyone feels welcome regardless of fitness level. My favorite part
is watching members surprise themselves with what they can achieve."

[Link: "Meet all our coaches →"]
```

**Coach 2: Abi (Example)**
```
[Professional photo of Abi coaching]

Abi - Owner & Coach
"CrossFit Level 1 Trainer | Nutrition Certified"

Brief bio: "I love helping people build confidence through fitness. Whether
you're brand new or an experienced athlete, I'll help you scale workouts
to challenge you appropriately and reach your goals."

[Link: "Meet all our coaches →"]
```

**Design Specs**:
- Photo: 400x400px minimum, circular crop or soft rounded corners
- Name: 24px bold
- Title/Credentials: 16px, brand color or medium gray
- Bio: 16px regular, 3-4 lines maximum
- Background: White or light gray
- Padding: 80px vertical

**Technical Notes**:
- NEED FROM CLIENT: Professional coach photos and credentials
- Link should go to full coaches/about page
- Consider adding small certification badge icons if available

---

### SECTION 9: Member Testimonials
**Purpose**: Real social proof from actual members

**Layout**:
- Carousel/slider format OR static three-column grid
- Photo + Quote + Name + Result/Achievement format

**Content Example** (populate with actual testimonials):

**Testimonial 1**:
```
[Member photo]

"I was intimidated by CrossFit but the coaches at Canvas made me feel
so welcome. Six months in and I'm stronger than I've ever been. The
small classes mean real coaching, not just watching a whiteboard."

- Sarah M., Member since 2023
Lost 25 lbs | First pull-up achieved
```

**Testimonial 2**:
```
[Member photo]

"As a former athlete, I needed something that challenged me. The
programming is excellent and the community keeps me coming back.
Best decision I made for my fitness."

- Mike R., Member since 2022
Competed in first CrossFit competition
```

**Testimonial 3**:
```
[Member photo]

"I'm in my 50s and never thought I'd do CrossFit. The coaches scale
everything perfectly to my level. I feel stronger and healthier than
I did in my 40s!"

- Linda K., Member since 2023
Improved mobility | Reduced back pain
```

**Design Specs**:
- If carousel: show 1 at a time on mobile, 3 on desktop
- Photos: 200x200px, circular crop
- Quote: 18-20px, italic font style
- Name: 16px bold
- Achievement: 14px, brand color or gray
- Include navigation dots/arrows if carousel
- Background: Contrasting from previous section
- Padding: 80px vertical

**Technical Notes**:
- NEED FROM CLIENT: Actual member testimonials with written permission and photos
- Alternative: Use text-only testimonials with star ratings if photos unavailable
- Link to Google/Facebook reviews at bottom: "Read all 200+ reviews →"

---

### SECTION 10: Facility Highlights
**Purpose**: Showcase the 12,000sf facility and amenities

**Layout**:
- Large photo gallery/grid
- 2x3 grid on desktop (6 photos), 2x2 on tablet, 1 column on mobile

**Content - Photo subjects**:
1. Main workout floor (wide angle showing space and equipment)
2. Rogue equipment close-up (quality equipment matters)
3. Recovery room/amenities
4. Kids' area
5. Showers/locker rooms
6. Community/members working out together

**Overlay text on section**:
```
Headline: "12,000 Square Feet of Premium Fitness Space"

Features list below or beside photos:
✓ State-of-the-art Rogue equipment
✓ Climate-controlled facility
✓ Clean showers & locker rooms
✓ Recovery room with foam rollers
✓ Dedicated kids' area
✓ Free parking
✓ Complimentary cold towels

[BUTTON: "Schedule a Tour"]
```

**Design Specs**:
- Photos: High quality, properly lit, showing cleanliness and space
- Grid gap: 20px between photos
- Hover effect: Slight zoom or overlay on images
- Can use lightbox/modal for full-size viewing
- Background: Dark (to make photos pop) OR continue alternating pattern
- Padding: 80px vertical

**Technical Notes**:
- NEED FROM CLIENT: Professional facility photos
- Consider adding 360° virtual tour if available
- Optimize images for web (compress without quality loss)

---

### SECTION 11: Schedule Snapshot
**Purpose**: Show class availability without leaving homepage

**Layout**:
- Centered headline
- Either embedded schedule widget OR static schedule sample with CTA

**Content**:

**Option A - If you have scheduling system**:
```
Headline: "50+ Classes Weekly | Find Your Perfect Time"

[Embedded schedule showing next 3 days]

Button: "View Full Schedule & Book Class"
```

**Option B - If no scheduling system yet (temporary)**:
```
Headline: "50+ Classes Weekly"
Subheadline: "Classes from 5:00 AM to 6:45 PM every day"

Sample Schedule (Monday):
5:00 AM - CrossFit
6:00 AM - CrossFit
9:00 AM - CrossFit
12:00 PM - CrossFit
4:30 PM - CrossFit
5:30 PM - CrossFit
6:30 PM - HYROX Training

"Classes available 7 days a week with options for every schedule"

[BUTTON: "Contact for Full Schedule"]
[BUTTON: "Book Your Free Intro"]
```

**Design Specs**:
- Clean table/grid format
- Easy to scan time slots
- Use brand colors for class type differentiation
- Mobile: ensure schedule remains readable (may need horizontal scroll)
- Background: White or light gray
- Padding: 60px vertical

**Technical Notes**:
- If implementing Mindbody/Zen Planner, use their embeddable widget
- Ensure widget matches site styling (many can be customized)
- Add loading state if widget has delay

---

### SECTION 12: Location & Contact
**Purpose**: Make it easy to find and contact the gym

**Layout**:
- Two-column: Map on left, contact info on right (stack on mobile)

**Content**:

**Left Column**:
```
[Google Maps embed showing gym location]
- Interactive map
- Pin on exact location
- "Get Directions" link opening in Google Maps
```

**Right Column**:
```
Visit Us:
[Full Address]
Caldwell, Idaho 83605

Hours:
Monday-Friday: 5:00 AM - 8:00 PM
Saturday: 7:00 AM - 12:00 PM
Sunday: 9:00 AM - 11:00 AM

Contact:
Phone: [Phone Number] (click to call on mobile)
Email: info@crossfitcanvas.com (NOT Gmail!)

[Social Media Icons - Instagram, Facebook]

[BUTTON: "Send Us a Message"]
```

**Design Specs**:
- Map: 600px wide minimum on desktop
- Contact info: Well spaced, easy to read
- Icons: 32px, brand colors
- Phone/email: Make clickable (tel: and mailto: links)
- Background: Light gray or white
- Padding: 80px vertical

**Technical Notes**:
- Google Maps embed: use iframe embed code
- Ensure map is interactive (zoomable, draggable)
- Mobile: stack map on top, contact info below

---

### SECTION 13: Final CTA Banner
**Purpose**: Last chance conversion before footer

**Layout**:
- Full-width colored background (brand primary color)
- Centered content, large and bold

**Content**:
```
Headline: "Ready to Start Your Fitness Journey?"
Subheadline: "Join Caldwell's friendliest gym. No experience needed."

[LARGE BUTTON: "Book Your Free No Sweat Intro"]

Below button (smaller text):
"Have questions? Call us at [phone] or send a message"
```

**Design Specs**:
- Background: Bold brand color (vibrant, contrasting)
- Text: White for contrast
- Headline: 36-42px, bold
- Button: Extra large (min 200px wide, 60px tall), white background with brand color text
- Padding: 100px vertical
- Make this section IMPOSSIBLE to miss

---

### SECTION 14: Footer
**Purpose**: Navigation, legal, additional info

**Layout**:
- Four-column layout on desktop
- Stack on mobile

**Content**:

**Column 1: Branding**
```
[CrossFit Canvas Logo]
"Caldwell's Premier CrossFit Gym"

[Social media icons]
```

**Column 2: Quick Links**
```
Navigation:
- About Us
- Programs
- Pricing
- Schedule
- Coaches
- Contact
```

**Column 3: Programs**
```
- CrossFit Classes
- HYROX Training
- Personal Training
- Kids Program
- Yoga
- Spin
```

**Column 4: Contact**
```
[Address]
[Phone]
[Email]

Hours:
Mon-Fri: 5am-8pm
Sat-Sun: [Hours]
```

**Bottom Bar**:
```
© 2025 CrossFit Canvas. All rights reserved.
Privacy Policy | Terms of Service

"CrossFit® is a registered trademark of CrossFit, LLC."
```

**Design Specs**:
- Background: Dark gray or black
- Text: Light gray/white
- Links: Underline on hover
- Social icons: 28px
- Column gap: 60px
- Padding: 60px vertical
- Bottom bar: Border-top separator, centered text

---

## Global Design System

### Colors (to be confirmed with client)
**Recommendation**:
- Primary Brand Color: Bold, energetic (e.g., #E94F37 burnt orange/red)
- Secondary: Dark charcoal (#2D3142)
- Accent: Bright highlight (e.g., #00B4D8 cyan)
- Backgrounds: White (#FFFFFF), Light gray (#F7F7F7), Dark (#1F1F1F)
- Text: Charcoal (#333333), Medium gray (#666666), Light gray for dark BG (#CCCCCC)

### Typography
**Headlines**:
- Font: Sans-serif, bold, modern (e.g., Montserrat Bold, Poppins Bold)
- Sizes: H1: 48-60px, H2: 36-42px, H3: 28-32px, H4: 22-24px

**Body Text**:
- Font: Highly readable sans-serif (e.g., Open Sans, Inter, Source Sans Pro)
- Sizes: Large body: 18-20px, Regular: 16px, Small: 14px
- Line height: 1.6-1.8 for readability

**Special Text** (inspired by PRVN):
- Consider lowercase for very casual/friendly sections: "let's get started"
- Mix with standard case for important info: "Book Your Free Intro"

### Buttons
**Primary CTA**:
- Large: 180px+ wide, 56px tall, 60px tall on hero
- Bold text: 16-18px, uppercase or title case
- High contrast: Bright background with dark text OR dark background with white text
- Hover: Slight darken and subtle lift/shadow
- Border radius: 4-8px (modern but not too rounded)

**Secondary CTA**:
- Ghost button: Border only, transparent background
- Or smaller solid button in accent color
- Same height as primary, less visual weight

### Spacing
- Section padding: 80-100px vertical on desktop, 60px on mobile
- Container max-width: 1200-1400px
- Grid gaps: 40-60px between columns
- Component internal padding: 40px
- Maintain consistent rhythm throughout page

### Images
- All photos: High resolution (minimum 1920px wide for full-width sections)
- Optimization: Compress for web (WebP format preferred)
- Aspect ratios: Maintain consistency (16:9 for landscape, 1:1 for portraits/squares)
- Alt text: Required for accessibility

### Animations & Interactions
**Subtle enhancements**:
- Fade-in on scroll (elements appear as user scrolls down)
- Button hover states (slight scale or shadow increase)
- Smooth scrolling between sections
- Image hover effects (slight zoom)

**Keep performance in mind**:
- Don't overdo animations
- Ensure 60fps smoothness
- Provide reduced-motion alternatives for accessibility

### Responsive Breakpoints
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: Below 768px
- Large mobile: 480px - 767px
- Small mobile: Below 480px

**Mobile Considerations**:
- Stack all multi-column layouts
- Increase button sizes for touch (min 48x48px)
- Simplify navigation (hamburger menu)
- Reduce padding (60px becomes 40px)
- Font sizes scale down slightly but remain readable

---

## Technical Requirements

### Performance
- Page load time: Under 3 seconds
- Lighthouse score: 90+ on all metrics
- Image optimization: All images compressed, lazy loading below fold
- Code minification: CSS and JS minified in production

### SEO Basics
```html
<title>CrossFit Canvas | Premier CrossFit Gym in Caldwell, Idaho</title>
<meta name="description" content="Join Caldwell's friendliest CrossFit gym. Small classes (8-12 people), expert coaches, and welcoming community. All fitness levels welcome. Book your free intro today!">

<!-- Open Graph for social sharing -->
<meta property="og:title" content="CrossFit Canvas | CrossFit Gym in Caldwell, Idaho">
<meta property="og:description" content="Small classes, expert coaching, all fitness levels welcome. Try 21 days for $199.">
<meta property="og:image" content="[URL to hero image]">
<meta property="og:url" content="https://www.crossfitcanvas.com">
```

### Accessibility
- Semantic HTML (proper heading hierarchy)
- Alt text on all images
- Sufficient color contrast (WCAG AA minimum)
- Keyboard navigation support
- Screen reader friendly
- Focus states visible on interactive elements
- ARIA labels where needed

### Analytics Tracking
**Implement event tracking on**:
- All CTA button clicks ("Book Free Intro", "View Pricing", etc.)
- Phone number clicks
- Email clicks
- Social media icon clicks
- Form submissions
- Scroll depth (25%, 50%, 75%, 100%)
- Time on page

### Integrations Required
1. **Booking System**: Mindbody, Zen Planner, or PushPress
   - Embed scheduling widget in Section 11
   - Link all CTA buttons to booking flow

2. **Email Marketing**: Mailchimp, ConvertKit, or similar
   - Add newsletter signup in footer
   - Capture leads from contact forms

3. **Google Maps**: Embed in Section 12

4. **Social Media**: Instagram feed (optional, can add later)

5. **Review Widgets**: Google Reviews integration (Section 2 & 9)

### Forms Needed
**Primary Contact Form** (linked from CTAs):
```
Fields:
- Name (required)
- Email (required)
- Phone (required)
- "I'm interested in:" dropdown (Free Intro, 21-Day Trial, Membership, Just have questions)
- Message (optional)
- Submit button

Success message: "Thanks! We'll contact you within 24 hours."
Confirmation email: Auto-send to user and notification to gym
```

---

## Assets Needed from Client

### Content
- [ ] Final pricing amounts for all membership tiers
- [ ] Coach names, titles, certifications, and bios
- [ ] 3-5 member testimonials with permission to publish
- [ ] Facility features list (confirm accuracy)
- [ ] Class schedule (full week)
- [ ] Exact hours of operation
- [ ] Professional email address (not Gmail)
- [ ] Social media handles

### Visual Assets
- [ ] Logo files (PNG with transparent background, SVG preferred)
- [ ] Brand colors (hex codes) if established
- [ ] Professional facility photos (minimum 20 high-res images):
  - Wide angle of main workout floor (2-3 photos)
  - Equipment close-ups (3-4 photos)
  - Classes in action with members (4-5 photos)
  - Recovery room, showers, kids' area (3-4 photos)
  - Exterior/entrance (1-2 photos)
  - Coaches coaching (3-4 photos)
- [ ] Coach headshots (professional, well-lit, similar style)
- [ ] Member photos for testimonials (with signed release forms)
- [ ] Hero video (optional but recommended, 30-60 seconds)

### Access & Credentials
- [ ] Current website hosting/CMS access
- [ ] Domain registrar access (if changing hosts)
- [ ] Google Analytics property
- [ ] Google My Business access (for reviews)
- [ ] Booking system credentials (if already exists)
- [ ] Social media account access (for feed integration)

---

## Development Process

### Phase 1: Setup & Design (Week 1)
1. Gather all assets from client
2. Create design mockups in Figma/XD for approval
3. Get client sign-off on design before building

### Phase 2: Build (Weeks 2-3)
1. Set up development environment
2. Build responsive HTML/CSS structure
3. Implement all sections top to bottom
4. Add interactivity and animations
5. Integrate booking system and forms
6. Test across devices and browsers

### Phase 3: Content & Testing (Week 3-4)
1. Insert all final content and images
2. Optimize images and performance
3. Cross-browser testing (Chrome, Firefox, Safari, Edge)
4. Mobile device testing (iOS and Android)
5. Accessibility audit
6. SEO implementation
7. Analytics setup

### Phase 4: Launch (Week 4)
1. Final client review and approval
2. Deploy to production
3. Monitor for issues first 48 hours
4. Make any quick fixes needed

---

## Success Metrics

**Primary Goals**:
- Increase "Book Free Intro" clicks by 200%+
- Reduce pricing inquiry form submissions (pricing now public)
- Increase time on site from <1min to 2-3min average
- Improve mobile conversion rate

**Track These KPIs**:
- Homepage bounce rate (target: under 50%)
- CTA click-through rate (target: 5%+ click primary CTA)
- Scroll depth (target: 70%+ reach bottom third)
- Form submissions per week
- Phone calls generated (use tracking number if possible)

---

## Questions for Client Before Starting

1. Do you have an existing booking system or need recommendations?
2. What's your timeline for getting professional photography done?
3. Do you have brand guidelines (colors/fonts) or are we establishing new ones?
4. Are current membership prices accurate ($100-180/month range)? Exact amounts?
5. Who will provide ongoing content updates after launch?
6. Do you have budget for premium stock photos if member photos unavailable?
7. Any specific competitor sites you love or hate?
8. What's the #1 objection you hear from potential members that we should address?
9. Any upcoming promotions or events to feature?
10. Who is final decision maker for design approval?

---

## Notes & Recommendations

**DO**:
- Make pricing transparent (critical for trust)
- Use real gym photos, not stock images
- Keep language conversational and welcoming
- Make CTAs impossible to miss
- Show real member testimonials
- Emphasize small class sizes and individual attention
- Highlight that all fitness levels are welcome

**DON'T**:
- Use intimidating language or imagery
- Hide pricing behind forms
- Overcomplicate navigation
- Use jargon without explanation
- Make site too text-heavy (balance with visuals)
- Forget mobile optimization
- Copy PRVN exactly (be inspired, but authentic to CrossFit Canvas)

**Reference PRVN Nashville for**:
- FAQ approach to objection handling
- Transparent pricing display
- Conversational but professional tone
- Clean modern layout
- Strategic CTA placement

**But maintain CrossFit Canvas's authentic identity**:
- Community-focused, not celebrity-driven
- Caldwell, Idaho local personality
- Jon & Abi's approachable ownership style
- Small-town friendliness with premium quality

---

## Contact for Questions

Developer questions about scope, functionality, or clarifications should be directed to: [Your contact info]

Client questions about content, photos, or business decisions should be directed to: [Client contact]

---

**This homepage redesign removes the barriers preventing excellent CrossFit Canvas gym from converting website visitors into members. Focus on transparency, trust-building, and making the next step obvious. Good luck with the build!**