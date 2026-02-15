"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useServerAction } from "zsa-react"
import { toast } from "sonner"
import { useState } from "react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  createCoachFeedbackSchema,
  type CoachFeedbackFormData,
  type FeedbackQuestionConfig,
} from "@/schemas/coach-feedback.schema"
import { submitCoachFeedbackAction } from "./feedback.action"
import { CheckCircle2 } from "lucide-react"

interface CoachOption {
  id: string
  name: string
}

export function FeedbackForm({ coaches, questions }: { coaches: CoachOption[]; questions: FeedbackQuestionConfig[] }) {
  const [isSuccess, setIsSuccess] = useState(false)

  const coachFeedbackSchema = createCoachFeedbackSchema({
    coachIds: coaches.map((c) => c.id),
    questions,
  })

  const form = useForm<CoachFeedbackFormData>({
    resolver: zodResolver(coachFeedbackSchema),
    defaultValues: {
      reviewerCoachId: "",
      reviewedCoachId: "",
      ...Object.fromEntries(questions.map(q => [q.category, Array(q.itemCount).fill("")])),
    },
  })

  const selectedReviewer = form.watch("reviewerCoachId")

  const { execute: submitFeedback, isPending } = useServerAction(
    submitCoachFeedbackAction,
    {
      onError: (error) => {
        toast.dismiss()
        toast.error(error.err?.message || "Failed to submit feedback")
      },
      onStart: () => {
        toast.loading("Submitting feedback...")
      },
      onSuccess: () => {
        toast.dismiss()
        toast.success("Feedback submitted successfully!")
        setIsSuccess(true)
      },
    }
  )

  const handleSubmit = async (data: CoachFeedbackFormData) => {
    await submitFeedback(data)
  }

  if (isSuccess) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Thank You!</h2>
            <p className="text-muted-foreground">
              Your feedback has been submitted successfully.
            </p>
            <Button
              onClick={() => {
                setIsSuccess(false)
                form.reset()
              }}
              variant="outline"
            >
              Submit Another
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            {/* Coach Selection */}
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="reviewerCoachId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your name" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {coaches.map((coach) => (
                          <SelectItem key={coach.id} value={coach.id}>
                            {coach.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reviewedCoachId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coach Being Reviewed</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a coach" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {coaches
                          .filter(
                            (coach) => coach.id !== selectedReviewer
                          )
                          .map((coach) => (
                            <SelectItem key={coach.id} value={coach.id}>
                              {coach.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dynamic Feedback Sections */}
            {questions.map((question) => (
              <div key={question.category} className="space-y-4">
                <h3 className="text-lg font-semibold">{question.label}</h3>
                <p className="text-sm text-muted-foreground">{question.description}</p>
                {Array.from({ length: question.itemCount }).map((_, index) => (
                  <FormField
                    key={`${question.category}-${index}`}
                    control={form.control}
                    name={`${question.category}.${index}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>#{index + 1}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={question.placeholder}
                            className="resize-none"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            ))}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit Feedback"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
