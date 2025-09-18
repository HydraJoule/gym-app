import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import { EditWorkoutForm } from "@/components/edit-workout-form"

export default async function EditWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  // Get workout details
  const { data: workout } = await supabase.from("workouts").select("*").eq("id", id).single()

  if (!workout) {
    redirect("/admin/workouts")
  }

  // Get workout exercises
  const { data: workoutExercises } = await supabase
    .from("workout_exercises")
    .select(`
      id,
      sets,
      reps,
      weight,
      rest_seconds,
      notes,
      order_index,
      exercise:exercises (
        id,
        name,
        description,
        muscle_groups,
        equipment,
        difficulty_level
      )
    `)
    .eq("workout_id", id)
    .order("order_index")

  // Get all exercises for adding new ones
  const { data: allExercises } = await supabase.from("exercises").select("*").order("name")

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
              <h1 className="text-xl font-semibold">Edit Workout</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit {workout.name}</CardTitle>
            <CardDescription>Update the workout details and modify exercises as needed.</CardDescription>
          </CardHeader>
          <CardContent>
            <EditWorkoutForm
              workout={workout}
              workoutExercises={workoutExercises || []}
              allExercises={allExercises || []}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
