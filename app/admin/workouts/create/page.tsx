import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import { CreateWorkoutForm } from "@/components/create-workout-form"

export default async function CreateWorkoutPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Get all exercises for the workout builder
  const { data: exercises } = await supabase.from("exercises").select("*").order("name")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/workouts">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Workouts
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold">Create New Workout</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Build Your Workout Plan</CardTitle>
            <CardDescription>
              Create a comprehensive workout by adding exercises with specific sets, reps, and instructions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateWorkoutForm exercises={exercises || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
