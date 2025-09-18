import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Users, Dumbbell, Filter } from "lucide-react"
import Link from "next/link"

interface Assignment {
  id: string
  assigned_at: string
  completed_at: string | null
  notes: string | null
  workout: {
    id: string
    name: string
    description: string
  }
  profile: {
    id: string
    full_name: string
    email: string
  }
}

export default async function AssignmentHistoryPage() {
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

  // Get all workout assignments
  const { data: assignments } = await supabase
    .from("user_workouts")
    .select(`
      id,
      assigned_at,
      completed_at,
      notes,
      workout:workouts (
        id,
        name,
        description
      ),
      profile:profiles!user_workouts_user_id_fkey (
        id,
        full_name,
        email
      )
    `)
    .order("assigned_at", { ascending: false })

  const totalAssignments = assignments?.length || 0
  const completedAssignments = assignments?.filter((a) => a.completed_at)?.length || 0
  const pendingAssignments = assignments?.filter((a) => !a.completed_at)?.length || 0
  const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold">Assignment History</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Workout Assignments</h2>
          <p className="text-muted-foreground">Track all workout assignments and member progress.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAssignments}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Dumbbell className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedAssignments}</div>
              <p className="text-xs text-muted-foreground">Finished workouts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAssignments}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Filter className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">Overall success</p>
            </CardContent>
          </Card>
        </div>

        {/* Assignments List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Assignments</CardTitle>
                <CardDescription>Complete history of workout assignments to members</CardDescription>
              </div>
              <Button asChild>
                <Link href="/admin/assignments">Create New Assignment</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {assignments && assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{assignment.workout.name}</h4>
                        <Badge variant={assignment.completed_at ? "default" : "secondary"}>
                          {assignment.completed_at ? "Completed" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Assigned to {assignment.profile.full_name || assignment.profile.email}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">{assignment.workout.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}</span>
                        {assignment.completed_at && (
                          <span>Completed: {new Date(assignment.completed_at).toLocaleDateString()}</span>
                        )}
                      </div>
                      {assignment.notes && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                          <strong>Notes:</strong> {assignment.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/members/${assignment.profile.id}`}>View Member</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/workout/${assignment.workout.id}`}>View Workout</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Assignments Yet</h3>
                <p className="text-muted-foreground mb-4">Start assigning workouts to your members to see them here.</p>
                <Button asChild>
                  <Link href="/admin/assignments">Create First Assignment</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
