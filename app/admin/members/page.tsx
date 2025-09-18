import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Mail, Calendar, Dumbbell } from "lucide-react"
import Link from "next/link"

interface Member {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

interface MemberWithStats extends Member {
  totalWorkouts: number
  completedWorkouts: number
}

export default async function MembersPage() {
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
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false })

  // Get workout stats for each member
  const membersWithStats: MemberWithStats[] = []
  if (members) {
    for (const member of members) {
      const { data: userWorkouts } = await supabase.from("user_workouts").select("*").eq("user_id", member.id)

      const totalWorkouts = userWorkouts?.length || 0
      const completedWorkouts = userWorkouts?.filter((w) => w.completed_at)?.length || 0

      membersWithStats.push({
        ...member,
        totalWorkouts,
        completedWorkouts,
      })
    }
  }

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
              <Users className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold">Member Management</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Gym Members</h2>
          <p className="text-muted-foreground">Manage and monitor your gym members' progress and activity.</p>
        </div>

        {/* Members List */}
        {membersWithStats.length > 0 ? (
          <div className="grid gap-6">
            {membersWithStats.map((member) => (
              <Card key={member.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{member.full_name || "No name provided"}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4" />
                        {member.email}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Member</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Joined</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(member.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Total Workouts</p>
                        <p className="text-sm text-muted-foreground">{member.totalWorkouts}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary rounded-full" />
                      <div>
                        <p className="text-sm font-medium">Completed</p>
                        <p className="text-sm text-muted-foreground">{member.completedWorkouts}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-muted rounded-full" />
                      <div>
                        <p className="text-sm font-medium">Completion Rate</p>
                        <p className="text-sm text-muted-foreground">
                          {member.totalWorkouts > 0
                            ? Math.round((member.completedWorkouts / member.totalWorkouts) * 100)
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button asChild size="sm">
                      <Link href={`/admin/assignments?member=${member.id}`}>Assign Workout</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/members/${member.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Members Yet</h3>
              <p className="text-muted-foreground mb-4">
                Members will appear here once they sign up for your gym. Share the signup link to get started!
              </p>
              <Button asChild>
                <Link href="/auth/signup">View Signup Page</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
