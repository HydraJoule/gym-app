import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, Dumbbell, Target, Info } from "lucide-react"
import Link from "next/link"
import { CompleteWorkoutButton } from "@/components/complete-workout-button"

interface WorkoutExercise {
  id: string
  sets: number | null
  reps: number | null
  weight: number | null
  rest_seconds: number | null
  notes: string | null
  order_index: number
  exercise: {
    id: string
    name: string
    description: string
    muscle_groups: string[]
    equipment: string
    difficulty_level: string
    instructions: string
    media_url: string | null
  }
}

interface Workout {
  id: string
  name: string
  description: string
}

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  // Get workout details
  const { data: workout } = await supabase.from("workouts").select("*").eq("id", id).single()

  if (!workout) {
    redirect("/dashboard")
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
        difficulty_level,
        instructions,
        media_url
      )
    `)
    .eq("workout_id", id)
    .order("order_index")

  // Check if user has this workout assigned
  const { data: userWorkout } = await supabase
    .from("user_workouts")
    .select("*")
    .eq("user_id", user.id)
    .eq("workout_id", id)
    .single()

  if (!userWorkout) {
    redirect("/dashboard")
  }

  const isCompleted = !!userWorkout.completed_at

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <Dumbbell className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold">{workout.name}</h1>
              {isCompleted && <Badge className="bg-primary">Completed</Badge>}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Workout Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{workout.name}</CardTitle>
            <CardDescription className="text-base">{workout.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                {workoutExercises?.length || 0} exercises
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Est. {Math.ceil((workoutExercises?.length || 0) * 3)} minutes
              </div>
            </div>
            {!isCompleted && (
              <div className="mt-4">
                <CompleteWorkoutButton userWorkoutId={userWorkout.id} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exercises */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Exercises</h2>
          {workoutExercises && workoutExercises.length > 0 ? (
            <div className="space-y-4">
              {workoutExercises.map((workoutExercise, index) => (
                <Card key={workoutExercise.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <CardTitle className="text-lg">{workoutExercise.exercise.name}</CardTitle>
                        </div>
                        <CardDescription>{workoutExercise.exercise.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className="ml-4">
                        {workoutExercise.exercise.difficulty_level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Exercise Details */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Workout Details</h4>
                        <div className="space-y-2 text-sm">
                          {workoutExercise.sets && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Sets:</span>
                              <span className="font-medium">{workoutExercise.sets}</span>
                            </div>
                          )}
                          {workoutExercise.reps && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Reps:</span>
                              <span className="font-medium">{workoutExercise.reps}</span>
                            </div>
                          )}
                          {workoutExercise.weight && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Weight:</span>
                              <span className="font-medium">{workoutExercise.weight} lbs</span>
                            </div>
                          )}
                          {workoutExercise.rest_seconds && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Rest:</span>
                              <span className="font-medium">
                                {Math.floor(workoutExercise.rest_seconds / 60)}:
                                {(workoutExercise.rest_seconds % 60).toString().padStart(2, "0")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Exercise Info</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Equipment:</span>
                            <span className="font-medium">{workoutExercise.exercise.equipment || "None"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Muscle Groups:</span>
                            <span className="font-medium text-right">
                              {workoutExercise.exercise.muscle_groups?.join(", ") || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Instructions */}
                    {workoutExercise.exercise.instructions && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-4 h-4 text-primary" />
                          <h4 className="font-medium">Instructions</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{workoutExercise.exercise.instructions}</p>
                      </div>
                    )}

                    {/* Notes */}
                    {workoutExercise.notes && (
                      <div className="mt-4 p-4 bg-accent/10 rounded-lg">
                        <h4 className="font-medium mb-2">Trainer Notes</h4>
                        <p className="text-sm text-muted-foreground">{workoutExercise.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No exercises in this workout</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
