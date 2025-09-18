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
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, CheckCircle, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "core",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "cardio",
]

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
]

interface Exercise {
  id: string
  name: string
  description: string | null
  muscle_groups: string[] | null
  equipment: string | null
  difficulty_level: string
  instructions: string | null
  media_url: string | null
}

interface EditExerciseFormProps {
  exercise: Exercise
}

export function EditExerciseForm({ exercise }: EditExerciseFormProps) {
  const [formData, setFormData] = useState({
    name: exercise.name,
    description: exercise.description || "",
    equipment: exercise.equipment || "",
    difficulty_level: exercise.difficulty_level,
    instructions: exercise.instructions || "",
    media_url: exercise.media_url || "",
  })
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>(exercise.muscle_groups || [])
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMuscleGroupChange = (muscleGroup: string, checked: boolean) => {
    setSelectedMuscleGroups((prev) =>
      checked ? [...prev, muscleGroup] : prev.filter((group) => group !== muscleGroup),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.difficulty_level) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("exercises")
        .update({
          name: formData.name,
          description: formData.description || null,
          muscle_groups: selectedMuscleGroups,
          equipment: formData.equipment || null,
          difficulty_level: formData.difficulty_level,
          instructions: formData.instructions || null,
          media_url: formData.media_url || null,
        })
        .eq("id", exercise.id)

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push("/admin/exercises")
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("Error updating exercise:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("exercises").delete().eq("id", exercise.id)

      if (error) throw error

      router.push("/admin/exercises")
      router.refresh()
    } catch (error) {
      console.error("Error deleting exercise:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Exercise Updated Successfully!</h3>
        <p className="text-muted-foreground">The exercise has been updated in your database.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Exercise Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Push-ups"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level *</Label>
            <Select
              value={formData.difficulty_level}
              onValueChange={(value) => handleInputChange("difficulty_level", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Brief description of the exercise..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="equipment">Equipment</Label>
          <Input
            id="equipment"
            placeholder="e.g., Barbell, Dumbbells, or leave empty for bodyweight"
            value={formData.equipment}
            onChange={(e) => handleInputChange("equipment", e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Label>Target Muscle Groups</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MUSCLE_GROUPS.map((group) => (
              <div key={group} className="flex items-center space-x-2">
                <Checkbox
                  id={group}
                  checked={selectedMuscleGroups.includes(group)}
                  onCheckedChange={(checked) => handleMuscleGroupChange(group, checked as boolean)}
                />
                <Label htmlFor={group} className="text-sm capitalize cursor-pointer">
                  {group}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions">Instructions</Label>
          <Textarea
            id="instructions"
            placeholder="Step-by-step instructions for performing the exercise..."
            value={formData.instructions}
            onChange={(e) => handleInputChange("instructions", e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="media_url">Media URL (Optional)</Label>
          <Input
            id="media_url"
            type="url"
            placeholder="https://example.com/exercise-demo.gif"
            value={formData.media_url}
            onChange={(e) => handleInputChange("media_url", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Add a link to a demonstration video or GIF to help members perform the exercise correctly.
          </p>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={!formData.name || !formData.difficulty_level || isLoading} className="flex-1">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isLoading ? "Updating Exercise..." : "Update Exercise"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{exercise.name}"? This action cannot be undone and will remove the
                  exercise from all existing workouts.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Delete Exercise
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </form>
    </div>
  )
}
