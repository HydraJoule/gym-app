import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Dumbbell, TrendingUp, User, LogOut } from "lucide-react"
import Link from "next/link"

interface UserWorkout {
  id: string
  assigned_at: string
  completed_at: string | null
  workout: {
    id: string
    name: string
    description: string
  }
}

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // If user is admin, redirect to admin dashboard
  if (profile?.role === "admin") {
    redirect("/admin")
  }

  // Get user's assigned workouts
  const { data: userWorkouts } = await supabase
    .from("user_workouts")
    .select(`
      id,
      assigned_at,
      completed_at,
      workout:workouts (
        id,
        name,
        description
      )
    `)
    .eq("user_id", user.id)
    .order("assigned_at", { ascending: false })

  const completedWorkouts = userWorkouts?.filter((w) => w.completed_at) || []
  const pendingWorkouts = userWorkouts?.filter((w) => !w.completed_at) || []

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
              <h1 className="text-2xl font-bold">FitTrack Pro</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{profile?.full_name || user.email}</span>
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
          <h2 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name?.split(" ")[0] || "Member"}!</h2>
          <p className="text-muted-foreground">Track your progress and stay on top of your fitness goals.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
              <Dumbbell className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userWorkouts?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Assigned to you</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedWorkouts.length}</div>
              <p className="text-xs text-muted-foreground">
                {userWorkouts?.length ? Math.round((completedWorkouts.length / userWorkouts.length) * 100) : 0}%
                completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingWorkouts.length}</div>
              <p className="text-xs text-muted-foreground">Workouts to complete</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pending Workouts */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Pending Workouts
            </h3>
            {pendingWorkouts.length > 0 ? (
              <div className="space-y-4">
                {pendingWorkouts.map((userWorkout) => (
                  <Card key={userWorkout.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{userWorkout.workout.name}</CardTitle>
                          <CardDescription className="mt-1">{userWorkout.workout.description}</CardDescription>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          Assigned {new Date(userWorkout.assigned_at).toLocaleDateString()}
                        </div>
                        <Button asChild size="sm">
                          <Link href={`/workout/${userWorkout.workout.id}`}>Start Workout</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending workouts</p>
                  <p className="text-sm text-muted-foreground mt-1">Your trainer will assign new workouts soon!</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Completed Workouts */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Completions
            </h3>
            {completedWorkouts.length > 0 ? (
              <div className="space-y-4">
                {completedWorkouts.slice(0, 5).map((userWorkout) => (
                  <Card key={userWorkout.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{userWorkout.workout.name}</CardTitle>
                          <CardDescription className="mt-1">{userWorkout.workout.description}</CardDescription>
                        </div>
                        <Badge variant="default" className="bg-primary">
                          Completed
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        Completed {new Date(userWorkout.completed_at!).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No completed workouts yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Complete your first workout to see it here!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
