import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Dumbbell } from "lucide-react"
import Link from "next/link"
import { EditExerciseForm } from "@/components/edit-exercise-form"

export default async function EditExercisePage({ params }: { params: Promise<{ id: string }> }) {
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

  // Get exercise details
  const { data: exercise } = await supabase.from("exercises").select("*").eq("id", id).single()

  if (!exercise) {
    redirect("/admin/exercises")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/exercises">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Exercises
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <Dumbbell className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold">Edit Exercise</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit {exercise.name}</CardTitle>
            <CardDescription>Update the exercise details and instructions.</CardDescription>
          </CardHeader>
          <CardContent>
            <EditExerciseForm exercise={exercise} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
