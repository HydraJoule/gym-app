import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dumbbell, Users, Calendar, TrendingUp, Zap, Target, Trophy, ArrowRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError) {
      // Create profile if it doesn't exist
      await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        role: "customer",
      })
      redirect("/dashboard")
    }

    if (profile?.role === "admin") {
      redirect("/admin")
    } else {
      redirect("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center glow-effect">
                <Dumbbell className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-gradient">FITTRACK</span>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90 glow-effect">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 hero-gradient overflow-hidden">
        <div className="absolute inset-0 bg-[url('/athletic-person-working-out-in-modern-gym.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-border rounded-full px-4 py-2 mb-8">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">{"Trusted by 10,000+ athletes worldwide"}</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-balance mb-8 leading-none">
              <span className="text-foreground">UNLEASH</span>
              <br />
              <span className="text-gradient">YOUR POTENTIAL</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto text-balance leading-relaxed">
              The ultimate gym management platform that transforms how trainers and athletes achieve peak performance.
              Track progress, assign workouts, and build champions.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button asChild size="lg" className="text-lg px-8 py-4 bg-primary hover:bg-primary/90 glow-effect group">
                <Link href="/auth/signup" className="flex items-center gap-2">
                  Start Training Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 border-border hover:bg-card bg-transparent"
              >
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "10K+", label: "Active Athletes" },
              { number: "50K+", label: "Workouts Completed" },
              { number: "500+", label: "Gym Partners" },
              { number: "99.9%", label: "Uptime" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-black text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground text-sm uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-balance">
              <span className="text-foreground">BUILT FOR</span>
              <br />
              <span className="text-gradient">CHAMPIONS</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Every feature designed to push limits and break barriers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Athlete Management",
                description:
                  "Track every member's journey with detailed progress analytics and personalized coaching insights",
              },
              {
                icon: Target,
                title: "Smart Assignments",
                description:
                  "AI-powered workout recommendations that adapt to individual goals and performance metrics",
              },
              {
                icon: Trophy,
                title: "Performance Tracking",
                description: "Real-time analytics and progress visualization that motivate and drive results",
              },
              {
                icon: Calendar,
                title: "Workout Scheduling",
                description: "Seamless scheduling system that keeps athletes consistent and trainers organized",
              },
              {
                icon: TrendingUp,
                title: "Progress Analytics",
                description: "Advanced metrics and insights that reveal patterns and optimize training programs",
              },
              {
                icon: Zap,
                title: "Instant Sync",
                description: "Lightning-fast synchronization across all devices for uninterrupted training flow",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="bg-card/50 backdrop-blur-sm border-border hover:bg-card/80 transition-all duration-300 group"
              >
                <CardHeader className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold mb-4 text-foreground">{feature.title}</CardTitle>
                  <CardDescription className="text-muted-foreground text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-card/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-8 text-balance">
            <span className="text-foreground">READY TO</span>
            <br />
            <span className="text-gradient">DOMINATE?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto text-balance">
            Join the elite community of trainers and athletes who refuse to settle for average
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="text-lg px-12 py-4 bg-primary hover:bg-primary/90 glow-effect group">
              <Link href="/auth/signup" className="flex items-center gap-2">
                Start Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-12 py-4 border-border hover:bg-card bg-transparent"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient">FITTRACK</span>
          </div>
          <p className="text-muted-foreground">© 2025 FitTrack. Built for champions, by champions.</p>
        </div>
      </footer>
    </div>
  )
}
