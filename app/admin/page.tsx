import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Dumbbell, Calendar, TrendingUp, User, LogOut, Plus } from "lucide-react"
import Link from "next/link"

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

interface UserWorkout {
  id: string
  assigned_at: string
  completed_at: string | null
  user_id: string
  workout: {
    name: string
  }
  profile: {
    full_name: string
    email: string
  }
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  // Get user profile and check if admin
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Get all members (customers)
  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false })

  // Get all workouts
  const { data: workouts } = await supabase.from("workouts").select("*").order("created_at", { ascending: false })

  // Get all exercises
  const { data: exercises } = await supabase.from("exercises").select("*").order("created_at", { ascending: false })

  // Get recent workout assignments
  const { data: recentAssignments } = await supabase
    .from("user_workouts")
    .select(`
      id,
      assigned_at,
      completed_at,
      user_id,
      workout:workouts (name),
      profile:profiles!user_workouts_user_id_fkey (full_name, email)
    `)
    .order("assigned_at", { ascending: false })
    .limit(10)

  const totalMembers = members?.length || 0
  const totalWorkouts = workouts?.length || 0
  const totalExercises = exercises?.length || 0
  const completedAssignments = recentAssignments?.filter((a) => a.completed_at)?.length || 0
  const pendingAssignments = recentAssignments?.filter((a) => !a.completed_at)?.length || 0

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Dumbbell className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">POWERHOUSE GYM Pro Admin</h1>
                <p className="text-sm text-muted-foreground">Gym Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{profile?.full_name || user.email}</span>
                <Badge variant="secondary">Admin</Badge>
              </div>
              <form action={handleSignOut}>
                <Button variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name?.split(" ")[0] || "Admin"}!</h2>
          <p className="text-muted-foreground">Manage your gym members, workouts, and track overall progress.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMembers}</div>
              <p className="text-xs text-muted-foreground">Active gym members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWorkouts}</div>
              <p className="text-xs text-muted-foreground">Created workout plans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exercises</CardTitle>
              <Dumbbell className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalExercises}</div>
              <p className="text-xs text-muted-foreground">Exercise database</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentAssignments?.length ? Math.round((completedAssignments / recentAssignments.length) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Recent assignments</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild className="h-auto p-4 flex-col gap-2">
              <Link href="/admin/members">
                <Users className="w-6 h-6" />
                <span>Manage Members</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
              <Link href="/admin/workouts">
                <Calendar className="w-6 h-6" />
                <span>Manage Workouts</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
              <Link href="/admin/exercises">
                <Dumbbell className="w-6 h-6" />
                <span>Manage Exercises</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
              <Link href="/admin/assignments">
                <Plus className="w-6 h-6" />
                <span>Assign Workouts</span>
              </Link>
            </Button>
          </div>
          <div className="mt-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/assignments/history">View All Assignment History</Link>
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Members */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Recent Members</h3>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/members">View All</Link>
              </Button>
            </div>
            {members && members.length > 0 ? (
              <div className="space-y-3">
                {members.slice(0, 5).map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{member.full_name || "No name"}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">Member</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Joined {new Date(member.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No members yet</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Workout Assignments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Recent Assignments</h3>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/assignments">Assign More</Link>
              </Button>
            </div>
            {recentAssignments && recentAssignments.length > 0 ? (
              <div className="space-y-3">
                {recentAssignments.slice(0, 5).map((assignment) => (
                  <Card key={assignment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{assignment.workout.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Assigned to {assignment.profile.full_name || assignment.profile.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={assignment.completed_at ? "default" : "secondary"}>
                            {assignment.completed_at ? "Completed" : "Pending"}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(assignment.assigned_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No assignments yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
