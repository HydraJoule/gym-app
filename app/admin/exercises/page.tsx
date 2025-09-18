import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Dumbbell, Plus, Target, Zap } from "lucide-react"
import Link from "next/link"

interface Exercise {
  id: string
  name: string
  description: string
  muscle_groups: string[]
  equipment: string
  difficulty_level: string
  instructions: string
  created_at: string
}

export default async function ExercisesPage() {
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

  // Get all exercises
  const { data: exercises } = await supabase.from("exercises").select("*").order("created_at", { ascending: false })

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
                <Dumbbell className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-semibold">Exercise Management</h1>
              </div>
            </div>
            <Button asChild>
              <Link href="/admin/exercises/create">
                <Plus className="w-4 h-4 mr-2" />
                Add Exercise
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Exercise Database</h2>
          <p className="text-muted-foreground">Manage your exercise library and create new exercises for workouts.</p>
        </div>

        {/* Exercises List */}
        {exercises && exercises.length > 0 ? (
          <div className="grid gap-6">
            {exercises.map((exercise) => (
              <Card key={exercise.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{exercise.name}</CardTitle>
                      <CardDescription className="mt-1">{exercise.description}</CardDescription>
                    </div>
                    <Badge className={getDifficultyColor(exercise.difficulty_level)}>{exercise.difficulty_level}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Muscle Groups</p>
                        <p className="text-sm text-muted-foreground">
                          {exercise.muscle_groups?.join(", ") || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Equipment</p>
                        <p className="text-sm text-muted-foreground">{exercise.equipment || "None"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Difficulty</p>
                        <p className="text-sm text-muted-foreground capitalize">{exercise.difficulty_level}</p>
                      </div>
                    </div>
                  </div>

                  {exercise.instructions && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Instructions</p>
                      <p className="text-sm text-muted-foreground">{exercise.instructions}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button asChild size="sm">
                      <Link href={`/admin/exercises/${exercise.id}/edit`}>Edit Exercise</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/exercises/${exercise.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Dumbbell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Exercises Yet</h3>
              <p className="text-muted-foreground mb-4">
                Add exercises to your database to start building comprehensive workout plans.
              </p>
              <Button asChild>
                <Link href="/admin/exercises/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Exercise
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
