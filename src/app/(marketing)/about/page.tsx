import { Metadata } from "next";
import { MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoachCard } from "@/components/coach-card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us - CrossFit Canvas Caldwell",
  description:
    "Learn about CrossFit Canvas in Caldwell, ID. Our mission, values, coaches, and commitment to helping you change your life through fitness.",
};

export default function AboutPage() {
  const programs = [
    "CrossFit Classes & Premium Facility",
    "Olympic Lifting",
    "Personal Training",
    "Kids Fitness Classes",
    "Sports Performance Training",
    "One-on-One Nutrition Programming",
    "Members-Only App",
    "Open Gym Access",
    "Top-of-the-line Equipment",
  ];

  const coaches = [
    {
      name: "Abi Williams",
      credentials: "Owner, CrossFit L1",
      image: "/assets/coaches/abi-williams.png",
      bio: 'Meet Coach Abi Williams!\nAbi grew up in Emmett, ID and graduated from Emmett High School before heading to trade school to become a Dental Assistant. After 9 years in the dental field, she made the bold move to follow her true passion—pursuing Nutrition Coaching and working full-time at CrossFit Canvas!\n\nAbi\'s own fitness journey started back in 2015. Wanting to feel stronger and healthier, she began training at a traditional gym. Her first big challenge? Training for Spartan Races! After years of strength training and obstacle race prep, she discovered CrossFit in 2018—and she\'s been hooked ever since.\n\nFavorite thing about coaching CrossFit?\n"Helping people realize they\'re capable of way more than they ever thought possible—and watching them crush goals inside and outside the gym."\n\nGoals for the future?\n"To continue growing our CrossFit Canvas community, expand my reach as a Nutrition Coach, and keep helping people live stronger, healthier lives."',
    },
    {
      name: "Jon Williams",
      credentials: "Owner, CrossFit L2",
      image: "/assets/coaches/jon-williams.png",
      bio: "Meet Coach Jon Williams!\nJon grew up in Emmett, ID and graduated from Vallivue High School before taking his basketball talents to the college level. He played at TVCC in Ontario, Oregon where he earned an Associate's Degree in Physical Education, then transferred to Grandview University in Des Moines, Iowa. There, he played another two years of college basketball while interning with the athletic department's strength & conditioning team during his senior year —graduating in 2016 with a Bachelor's in Kinesiology & Health Promotion.\n\nAfter college, Jon jumped straight into personal training & coaching CrossFit and never looked back. Two years later, in 2019, he and his wife Abi opened the doors to CrossFit Canvas!\n\nJon is going into his 9th year coaching and has his CrossFit Level 2 certification!\n\nFavorite thing about coaching CrossFit?\n\"Watching people do things they never thought they could. Seeing confidence and strength grow inside and outside the gym for our members means so much to us. There have been so many people come through the doors at CrossFit Canvas and to know we hopefully had a positive impact on their lives is why we love doing what we do.\"\n\nGoals for the future?\n\"To keep building a strong, encouraging community at CrossFit Canvas that helps push each other to be better every day—both fitness wise and as people. We don't know how long we're here for or how long we'll be doing this before life changes so we hope to make as much impactful change as possible.\"",
    },
    {
      name: "Andrea Goff",
      credentials: "CrossFit L1",
      image: "/assets/coaches/andrea-goff.png",
      bio: "I grew up in Caldwell, Idaho, and spent my childhood summers in South Texas, where I was born. I've been married to my husband, Ryan, for 23 years this June, and we have two awesome kiddos, Cash and Presley.\n\nI graduated from Vallivue High School and went on to attend Boise State University.\n\nI enjoy remodeling & home decorating projects in my \"spare\" time. Over the years, I have learned how to build things, knock down walls, remove cabinets hang shiplap, etc. I love it!!\n\nMy family and I are extremely active — you'll find us wakesurfing, hiking & enjoying our pool in the summer, and we love to travel. We're big fans of all things fitness and spend a lot of time cheering on our kids at their sporting events. It's truly the BEST!\n\nI've been a CrossFit coach for six years. When I'm not coaching, I run my own retail and custom t-shirt business, G4 Collective.\n\nWhat I love most about coaching is getting to be a part of someone's day for an hour & making those connections. It's an honor to show up, encourage them, and hopefully leave them feeling stronger and happier than when they walked in.\n\nLooking ahead, I'm currently working toward my CrossFit Level 2 certification. I'm also passionate about furthering my education in women's health/fitness — especially for women 40 and over. It's so important for women in this stage of life to continue building and maintaining muscle through weight training and nutrition.",
    },
    {
      name: "Dre Lucich",
      credentials: "CrossFit L2",
      image: "/assets/coaches/dre-lucich.png",
      bio: "💪 Where did you grow up?\nSunny San Diego, California 🌴\n\n🎓 Education:\nI swam for Boise State University from 2007–2011 while earning my Bachelor's in Elementary Education.\n\n🏊‍♀️ Sports, Hobbies & Activities:\nCrossFit (surprise!), dance parties with my daughter Kennedy, coaching Meridian High School's Swim Team, drinking way too much coffee, crafting, being outdoors, and doing anything in the water!\n\n🍎 Career:\nI spent 7 amazing years teaching elementary school before transitioning to my most rewarding role yet—stay-at-home mom to Kennedy.\n\n❤️ Favorite Thing About Coaching CrossFit:\nWatching people build confidence not just in the gym, but in life. I love connecting with each athlete and being a part of their journey—especially as they kick butt into their 90s!\n\n🎯 Goals:\n• Personal Goal: Improve my gymnastics and hit a 350 lb deadlift\n• Coaching Goal: Earn my Pregnancy & Postpartum Athleticism certification and eventually test for the Level 3 (L3) Coaching Credential",
    },
    {
      name: "JT Hand",
      credentials: "CrossFit L2",
      image: "/assets/coaches/jt-hand.png",
      bio: "JT spent his early childhood in California before moving to Meridian, Idaho in the early '90s. He graduated from Centennial High School, where he played baseball, eventually going on to play for the Detroit Tigers' long A team right out of high school.\n\nAfter returning from baseball, JT met his wife Jamie. They've been married for over 25 years and have two children—Trevor and Tia.\n\nJT has been coaching CrossFit for over 15 years and is passionate about connecting with people and helping them reach their fitness goals. He loves seeing members progress and grow on their fitness journeys.\n\nWhen he's not coaching, JT is focused on his own health and fitness—especially when it involves mountain biking anywhere and everywhere he can.\n\nCrossFit Canvas has been very lucky to have JT on the team for the entire almost 6 years now that we have been open!! You can catch JT coaching some class at almost all times, and you'll rarely catch him without a smile on his face and a backwards hat on!!",
    },
    {
      name: "JT Mahon",
      credentials: "CrossFit L2",
      image: "/assets/coaches/jt-mahon.png",
      bio: "Born and raised in Council, Idaho, JT grew up logging with his dad or dominating the field—earning All-State honors in football, basketball, and track. He went on to compete in football and track at both the University of Idaho and The College of Idaho, where he earned his undergraduate degree. 💪\n\nCurrently, he's a Bronco working toward his MBA while leading the night shift at the Amazon Fulfillment Center near the Idaho Center. (So if you've ordered from Amazon lately, you're welcome. 😉)\n\n🏈 Outside the gym, he's either watching football or deep in a DIY home project—\"DIY for life!\"\n\nAs a coach, JT finds the most reward in seeing people grow, change, and develop through hard work and determination.\n\n\"My personal goal is to maintain an able body—to be a competitor and a protector. As a coach, I want to help people stay focused on their own journey. Comparison is the thief of joy!\"",
    },
    {
      name: "Liz Krmpotich",
      credentials: "CrossFit L2",
      image: "/assets/coaches/liz-krmpotich.png",
      bio: "Born and raised in Green River, Wyoming, Liz has been breaking barriers from the start—literally! She was one of the first female athletes in the state to compete in pole vaulting and also made waves as a competitive diver. She even turned down a scholarship to dive at UNLV to marry her high school sweetheart, Bobby, and begin their adventure together.\n\nNow living in Idaho, Liz wears many hats: mom to Cole and Lexi, licensed property appraiser, office manager of Balanced Electric (which she co-owns with Bobby), and of course, CrossFit coach extraordinaire!\n\nHer passion for movement and adventure knows no bounds—she's run multiple half marathons, hiked across Europe, swam in the Adriatic and Baltic Seas, and even backpacked the Nā Pali Coast. Paddleboarding, cliff diving, and CrossFit? She's all in. 🏃‍♀️🏞️🌊\n\nLiz found CrossFit in 2012 and began coaching in 2015. Helping others discover their strength—both inside and out—is the highlight of her day. 💥\n\nHer bucket list?\n🏕️ Hike the Appalachian Trail\n🔥 Compete on Survivor\n🏋️‍♀️ Do CrossFit until she's 100",
    },
    {
      name: "Tyler Berkheiser",
      credentials: "CrossFit L1",
      image: "/assets/coaches/tyler-berkheiser.png",
      bio: "🏡 Hometown Roots: Tyler grew up in Meridian, Idaho, and has also lived in Salt Lake City, St. George, San Antonio, and Biloxi.\n\n🎓 Education: A proud Meridian High School grad and Idaho State University alum.\n\n🏈 Athletic Background: Tyler brings years of athleticism to the floor — from sprinting on the track (100m, long jump, 4x100m relay) to powering through as a football running back and wide receiver.\n\n💪 Why He Coaches: \"Helping others reach their goals — whether it's their first pull-up, losing 10 lbs, or stepping into their first competition — that's what lights me up.\"\n\n🎯 What's Next: Tyler's dedicated to continuing his education and finding new ways to serve and inspire the CrossFit community.",
    },
    {
      name: "Zac Jones",
      credentials: "CrossFit L2",
      image: "/assets/coaches/zac-jones.jpeg",
      bio: "I started CrossFit back in 2013 and immediately fell in love with the constant challenge and variety that it gave my workout routine every day. The community that is built around suffering together is a highlight as well.\n\nAs I've learned the CrossFit methodology and refined my movement I really enjoy supporting others fitness journeys and teaching people what I've learned. I'm always happy to talk about methodology, nutrition, weightlifting or anything fitness related.",
    },
    {
      name: "Katirah Vangaasbeck",
      credentials: "CrossFit L1",
      image: "/assets/coaches/kat.png",
      bio: "I started CrossFit in December 2021, and it quickly became my favorite part of the day. I love how it pushes you out of your comfort zone in the best way both mentally and physically.\n\nOutside of the gym, I love hanging out with my dogs, fostering animals, thrifting, and traveling.\n\nI’m all about creating a space where people feel safe to mess up, try again, laugh, grow, and do things that might scare them. I want everyone to feel welcome, supported, and capable.",
    },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-charcoal-dark to-black" />
        <div className="relative z-20 container mx-auto px-6 text-center">
          <h1 className="font-heading text-4xl md:text-6xl uppercase tracking-wide text-white mb-4 leading-tight">
            About CrossFit Canvas
          </h1>
          <p className="font-sans text-xl md:text-2xl text-white/90 font-normal">
            Change Your Life With Us
          </p>
        </div>
      </section>
      {/* Mission Section with Image */}
      <section className="bg-black">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 items-center">
            {/* Image on Left */}
            <div className="relative h-[400px] md:h-[600px]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url('/assets/gym-fam.png')",
                }}
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Content on Right */}
            <div className="px-6 py-12 md:px-12 md:py-20">
              <div className="space-y-6 text-white">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-balance">
                  About CrossFit Canvas
                </h1>

                <div className="space-y-4 text-base md:text-lg">
                  <p>
                    Simply put, our mission is to help you, &quot;Change Your
                    Life With Us.&quot; After spending time in our facility and
                    with our team we want our members to walk out of our doors
                    after a workout and feel like they are a better version of
                    themselves.
                  </p>

                  <p>
                    Our team cares about guiding and encouraging each and every
                    member to obtain the goals they seek for themselves. Our
                    members&apos; goals are specific and if we can assist in
                    that journey to realizing their aspirations then we have
                    truly helped them change their life.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Values - Dark Section */}
      <section className="bg-black py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-6 text-white">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-8 text-balance">
              Our community is what makes us special and it&apos;s what will
              keep you going
            </h2>

            <div className="space-y-4 text-base md:text-lg">
              <p>
                CrossFit Canvas has been serving the Caldwell, Idaho community
                for years, focusing on supporting people ready to take action on
                their fitness goals.
              </p>

              <p>
                We understand that working out is challenging, but accessibility
                and convenience should never be barriers to your success.
                Whether you&apos;re just starting out or are a seasoned athlete,
                you&apos;ll find support, encouragement, and accountability from
                our coaches and fellow members.
              </p>

              <p>
                We believe in supporting people who are ready to take action and
                give them everything they need to crush their goals. It&apos;s
                why our members keep coming back for more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coaches Section - Placeholder */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Meet Our Coaches
            </h2>
            <p className="text-lg text-muted-foreground">
              Our experienced coaching team is dedicated to helping you reach
              your goals
            </p>
          </div>

          {/* Coaches grid - 2 columns on desktop */}
          <div className="max-w-7xl mx-auto scroll-mt-44" id="coaches">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              {coaches.map((coach) => (
                <CoachCard key={coach.name} coach={coach} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-card rounded-lg border p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <MapPin className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-heading text-2xl font-bold mb-3">
                      Location
                    </h3>
                    <p className="text-base leading-relaxed">
                      4611 Enterprise Way
                      <br />
                      Caldwell, Idaho 83605
                    </p>
                    <p className="text-sm text-muted-foreground mt-3">
                      Conveniently located off Franklin on the east side of the
                      freeway past Home Depot
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <Clock className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-heading text-2xl font-bold mb-3">
                      Hours
                    </h3>
                    <p className="text-base leading-relaxed">
                      <span className="font-semibold">Monday-Friday:</span>
                      <br />5 AM - 8 PM
                    </p>
                    <p className="text-base leading-relaxed mt-2">
                      <span className="font-semibold">Weekends:</span>
                      <br />8 AM - 3 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs & Amenities */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Programs & Amenities
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to reach your fitness goals
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {programs.map((program, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0 group-hover:scale-150 transition-transform" />
                  <p className="text-base">{program}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-white uppercase tracking-wide">
              Ready to Get Started?
            </h2>
            <p className="text-lg md:text-xl mb-8 text-white/80">
              Join our community and start your fitness journey today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-black hover:bg-white hover:text-black border-2 border-white text-white text-base font-bold uppercase px-8 py-6 h-auto rounded-sm transition-all hover:scale-105"
              >
                <Link href="/tour">
                  Schedule a Tour
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border border-white text-white hover:bg-white hover:text-black text-base font-bold uppercase px-8 py-6 h-auto rounded-sm transition-all"
              >
                <a href="/schedule">View Schedule</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
