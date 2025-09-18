import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Users, Calendar } from "lucide-react"
import Link from "next/link"
import { AssignWorkoutForm } from "@/components/assign-workout-form"

interface Member {
  id: string
  full_name: string
  email: string
}

interface Workout {
  id: string
  name: string
  description: string
}

export default async function AssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ member?: string; workout?: string }>
}) {
  const params = await searchParams
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

  // Get all members
  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "customer")
    .order("full_name")

  // Get all workouts
  const { data: workouts } = await supabase.from("workouts").select("id, name, description").order("name")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <Plus className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold">Assign Workouts</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Workout Assignment</h2>
          <p className="text-muted-foreground">
            Assign workout plans to your gym members to help them reach their goals.
          </p>
        </div>

        {members && workouts && members.length > 0 && workouts.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Assign Workout to Member</CardTitle>
              <CardDescription>Select a member and workout to create a new assignment.</CardDescription>
            </CardHeader>
            <CardContent>
              <AssignWorkoutForm
                members={members}
                workouts={workouts}
                preselectedMember={params.member}
                preselectedWorkout={params.workout}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Users className="w-12 h-12 text-muted-foreground" />
                <Calendar className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Setup Required</h3>
              <p className="text-muted-foreground mb-4">
                You need both members and workouts before you can make assignments.
              </p>
              <div className="flex gap-2 justify-center">
                {(!members || members.length === 0) && (
                  <Button asChild variant="outline">
                    <Link href="/admin/members">View Members</Link>
                  </Button>
                )}
                {(!workouts || workouts.length === 0) && (
                  <Button asChild>
                    <Link href="/admin/workouts/create">Create Workout</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
