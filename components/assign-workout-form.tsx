"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle } from "lucide-react"

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

interface AssignWorkoutFormProps {
  members: Member[]
  workouts: Workout[]
  preselectedMember?: string
  preselectedWorkout?: string
}

export function AssignWorkoutForm({
  members,
  workouts,
  preselectedMember,
  preselectedWorkout,
}: AssignWorkoutFormProps) {
  const [selectedMember, setSelectedMember] = useState(preselectedMember || "")
  const [selectedWorkout, setSelectedWorkout] = useState(preselectedWorkout || "")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember || !selectedWorkout) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("user_workouts").insert({
        user_id: selectedMember,
        workout_id: selectedWorkout,
        notes: notes || null,
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push("/admin")
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("Error assigning workout:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Workout Assigned Successfully!</h3>
        <p className="text-muted-foreground">The member will see their new workout in their dashboard.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="member">Select Member</Label>
        <Select value={selectedMember} onValueChange={setSelectedMember}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a member" />
          </SelectTrigger>
          <SelectContent>
            {members.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.full_name || member.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="workout">Select Workout</Label>
        <Select value={selectedWorkout} onValueChange={setSelectedWorkout}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a workout" />
          </SelectTrigger>
          <SelectContent>
            {workouts.map((workout) => (
              <SelectItem key={workout.id} value={workout.id}>
                <div>
                  <div className="font-medium">{workout.name}</div>
                  <div className="text-sm text-muted-foreground">{workout.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any specific instructions or notes for this assignment..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <Button type="submit" disabled={!selectedMember || !selectedWorkout || isLoading} className="w-full">
        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {isLoading ? "Assigning Workout..." : "Assign Workout"}
      </Button>
    </form>
  )
}
