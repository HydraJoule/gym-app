"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"

interface CompleteWorkoutButtonProps {
  userWorkoutId: string
}

export function CompleteWorkoutButton({ userWorkoutId }: CompleteWorkoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleComplete = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("user_workouts")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", userWorkoutId)

      if (error) throw error

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Error completing workout:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleComplete} disabled={isLoading} className="w-full sm:w-auto">
      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
      {isLoading ? "Completing..." : "Mark as Complete"}
    </Button>
  )
}
