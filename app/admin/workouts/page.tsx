import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Plus, Dumbbell, Users } from "lucide-react"
import Link from "next/link"

interface Workout {
  id: string
  name: string
  description: string
  created_at: string
}

interface WorkoutWithStats extends Workout {
  exerciseCount: number
  assignmentCount: number
}

export default async function WorkoutsPage() {
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

  // Get all workouts
  const { data: workouts } = await supabase.from("workouts").select("*").order("created_at", { ascending: false })

  // Get stats for each workout
  const workoutsWithStats: WorkoutWithStats[] = []
  if (workouts) {
    for (const workout of workouts) {
      // Get exercise count
      const { data: workoutExercises } = await supabase
        .from("workout_exercises")
        .select("*")
        .eq("workout_id", workout.id)

      // Get assignment count
      const { data: userWorkouts } = await supabase.from("user_workouts").select("*").eq("workout_id", workout.id)

      workoutsWithStats.push({
        ...workout,
        exerciseCount: workoutExercises?.length || 0,
        assignmentCount: userWorkouts?.length || 0,
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-semibold">Workout Management</h1>
              </div>
            </div>
            <Button asChild>
              <Link href="/admin/workouts/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Workout
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Workout Plans</h2>
          <p className="text-muted-foreground">Create and manage workout plans for your gym members.</p>
        </div>

        {/* Workouts List */}
        {workoutsWithStats.length > 0 ? (
          <div className="grid gap-6">
            {workoutsWithStats.map((workout) => (
              <Card key={workout.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{workout.name}</CardTitle>
                      <CardDescription className="mt-1">{workout.description}</CardDescription>
                    </div>
                    <Badge variant="outline">
                      {workout.exerciseCount} exercise{workout.exerciseCount !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Exercises</p>
                        <p className="text-sm text-muted-foreground">{workout.exerciseCount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Assignments</p>
                        <p className="text-sm text-muted-foreground">{workout.assignmentCount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Created</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(workout.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm">
                      <Link href={`/admin/workouts/${workout.id}/edit`}>Edit Workout</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/workout/${workout.id}`}>Preview</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/assignments?workout=${workout.id}`}>Assign to Members</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Workouts Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first workout plan to start assigning exercises to your members.
              </p>
              <Button asChild>
                <Link href="/admin/workouts/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Workout
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
