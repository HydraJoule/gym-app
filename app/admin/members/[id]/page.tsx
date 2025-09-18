import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Mail, Calendar, Dumbbell, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"

interface UserWorkout {
  id: string
  assigned_at: string
  completed_at: string | null
  notes: string | null
  workout: {
    id: string
    name: string
    description: string
  }
}

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Get member details
  const { data: member } = await supabase.from("profiles").select("*").eq("id", id).single()

  if (!member || member.role !== "customer") {
    redirect("/admin/members")
  }

  // Get member's workout assignments
  const { data: userWorkouts } = await supabase
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
      )
    `)
    .eq("user_id", id)
    .order("assigned_at", { ascending: false })

  const totalWorkouts = userWorkouts?.length || 0
  const completedWorkouts = userWorkouts?.filter((w) => w.completed_at)?.length || 0
  const pendingWorkouts = userWorkouts?.filter((w) => !w.completed_at)?.length || 0
  const completionRate = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/members">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Members
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-primary" />
                <div>
                  <h1 className="text-xl font-semibold">{member.full_name || "Member Profile"}</h1>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>
            </div>
            <Button asChild>
              <Link href={`/admin/assignments?member=${member.id}`}>
                <Plus className="w-4 h-4 mr-2" />
                Assign Workout
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Member Info */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
              <Dumbbell className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWorkouts}</div>
              <p className="text-xs text-muted-foreground">Assigned workouts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedWorkouts}</div>
              <p className="text-xs text-muted-foreground">Finished workouts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingWorkouts}</div>
              <p className="text-xs text-muted-foreground">To be completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">Overall progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Member Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Member Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Full Name</p>
                  <p className="text-sm text-muted-foreground">{member.full_name || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">{new Date(member.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workout History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Workout History</CardTitle>
                <CardDescription>All workouts assigned to this member</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href={`/admin/assignments?member=${member.id}`}>Assign New Workout</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {userWorkouts && userWorkouts.length > 0 ? (
              <div className="space-y-4">
                {userWorkouts.map((userWorkout) => (
                  <div key={userWorkout.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{userWorkout.workout.name}</h4>
                        <Badge variant={userWorkout.completed_at ? "default" : "secondary"}>
                          {userWorkout.completed_at ? "Completed" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{userWorkout.workout.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Assigned: {new Date(userWorkout.assigned_at).toLocaleDateString()}</span>
                        {userWorkout.completed_at && (
                          <span>Completed: {new Date(userWorkout.completed_at).toLocaleDateString()}</span>
                        )}
                      </div>
                      {userWorkout.notes && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                          <strong>Notes:</strong> {userWorkout.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/workout/${userWorkout.workout.id}`}>View Workout</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Workouts Assigned</h3>
                <p className="text-muted-foreground mb-4">This member hasn't been assigned any workouts yet.</p>
                <Button asChild>
                  <Link href={`/admin/assignments?member=${member.id}`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Assign First Workout
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
