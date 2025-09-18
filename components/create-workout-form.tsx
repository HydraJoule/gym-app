"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, Plus, X, GripVertical } from "lucide-react"

interface Exercise {
  id: string
  name: string
  description: string | null
  muscle_groups: string[] | null
  equipment: string | null
  difficulty_level: string
}

interface WorkoutExercise {
  exercise_id: string
  exercise: Exercise
  sets: number | null
  reps: number | null
  weight: number | null
  rest_seconds: number | null
  notes: string
  order_index: number
}

interface CreateWorkoutFormProps {
  exercises: Exercise[]
}

export function CreateWorkoutForm({ exercises }: CreateWorkoutFormProps) {
  const [workoutData, setWorkoutData] = useState({
    name: "",
    description: "",
  })
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])
  const [selectedExerciseId, setSelectedExerciseId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleWorkoutDataChange = (field: string, value: string) => {
    setWorkoutData((prev) => ({ ...prev, [field]: value }))
  }

  const addExercise = () => {
    if (!selectedExerciseId) return

    const exercise = exercises.find((e) => e.id === selectedExerciseId)
    if (!exercise) return

    const newWorkoutExercise: WorkoutExercise = {
      exercise_id: selectedExerciseId,
      exercise,
      sets: null,
      reps: null,
      weight: null,
      rest_seconds: null,
      notes: "",
      order_index: workoutExercises.length,
    }

    setWorkoutExercises((prev) => [...prev, newWorkoutExercise])
    setSelectedExerciseId("")
  }

  const removeExercise = (index: number) => {
    setWorkoutExercises((prev) => prev.filter((_, i) => i !== index).map((ex, i) => ({ ...ex, order_index: i })))
  }

  const updateExercise = (index: number, field: keyof WorkoutExercise, value: any) => {
    setWorkoutExercises((prev) => prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workoutData.name || workoutExercises.length === 0) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      // Create workout
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert({
          name: workoutData.name,
          description: workoutData.description || null,
        })
        .select()
        .single()

      if (workoutError) throw workoutError

      // Create workout exercises
      const workoutExerciseData = workoutExercises.map((we) => ({
        workout_id: workout.id,
        exercise_id: we.exercise_id,
        sets: we.sets,
        reps: we.reps,
        weight: we.weight,
        rest_seconds: we.rest_seconds,
        notes: we.notes || null,
        order_index: we.order_index,
      }))

      const { error: exercisesError } = await supabase.from("workout_exercises").insert(workoutExerciseData)

      if (exercisesError) throw exercisesError

      setSuccess(true)
      setTimeout(() => {
        router.push("/admin/workouts")
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("Error creating workout:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Workout Created Successfully!</h3>
        <p className="text-muted-foreground">The new workout plan has been added to your library.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Workout Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Workout Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workout Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Upper Body Strength"
              value={workoutData.name}
              onChange={(e) => handleWorkoutDataChange("name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Brief description of the workout"
              value={workoutData.description}
              onChange={(e) => handleWorkoutDataChange("description", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Add Exercise */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Add Exercises</h3>
        <div className="flex gap-2">
          <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select an exercise to add" />
            </SelectTrigger>
            <SelectContent>
              {exercises
                .filter((ex) => !workoutExercises.some((we) => we.exercise_id === ex.id))
                .map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    <div>
                      <div className="font-medium">{exercise.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {exercise.muscle_groups?.join(", ")} • {exercise.difficulty_level}
                      </div>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button type="button" onClick={addExercise} disabled={!selectedExerciseId}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Workout Exercises */}
      {workoutExercises.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Workout Exercises ({workoutExercises.length})</h3>
          <div className="space-y-4">
            {workoutExercises.map((workoutExercise, index) => (
              <Card key={`${workoutExercise.exercise_id}-${index}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                      </div>
                      <div>
                        <CardTitle className="text-base">{workoutExercise.exercise.name}</CardTitle>
                        <CardDescription>{workoutExercise.exercise.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{workoutExercise.exercise.difficulty_level}</Badge>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeExercise(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Sets</Label>
                      <Input
                        type="number"
                        placeholder="3"
                        value={workoutExercise.sets || ""}
                        onChange={(e) =>
                          updateExercise(index, "sets", e.target.value ? Number.parseInt(e.target.value) : null)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Reps</Label>
                      <Input
                        type="number"
                        placeholder="12"
                        value={workoutExercise.reps || ""}
                        onChange={(e) =>
                          updateExercise(index, "reps", e.target.value ? Number.parseInt(e.target.value) : null)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Weight (lbs)</Label>
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="135"
                        value={workoutExercise.weight || ""}
                        onChange={(e) =>
                          updateExercise(index, "weight", e.target.value ? Number.parseFloat(e.target.value) : null)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Rest (seconds)</Label>
                      <Input
                        type="number"
                        placeholder="60"
                        value={workoutExercise.rest_seconds || ""}
                        onChange={(e) =>
                          updateExercise(index, "rest_seconds", e.target.value ? Number.parseInt(e.target.value) : null)
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Notes (Optional)</Label>
                    <Textarea
                      placeholder="Special instructions for this exercise..."
                      value={workoutExercise.notes}
                      onChange={(e) => updateExercise(index, "notes", e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={!workoutData.name || workoutExercises.length === 0 || isLoading}
        className="w-full"
      >
        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {isLoading ? "Creating Workout..." : "Create Workout"}
      </Button>
    </form>
  )
}
