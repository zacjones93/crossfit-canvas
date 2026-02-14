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
import { coaches } from "@/constants/coaches"
import {
  coachFeedbackSchema,
  type CoachFeedbackFormData,
  ITEMS_PER_CATEGORY,
} from "@/schemas/coach-feedback.schema"
import { submitCoachFeedbackAction } from "./feedback.action"
import { CheckCircle2 } from "lucide-react"

export function FeedbackForm() {
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<CoachFeedbackFormData>({
    resolver: zodResolver(coachFeedbackSchema),
    defaultValues: {
      reviewerCoachName: "",
      reviewedCoachName: "",
      liked: Array(ITEMS_PER_CATEGORY).fill(""),
      improvements: Array(ITEMS_PER_CATEGORY).fill(""),
    },
  })

  const selectedReviewer = form.watch("reviewerCoachName")

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
                name="reviewerCoachName"
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
                          <SelectItem key={coach.name} value={coach.name}>
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
                name="reviewedCoachName"
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
                            (coach) => coach.name !== selectedReviewer
                          )
                          .map((coach) => (
                            <SelectItem key={coach.name} value={coach.name}>
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

            {/* Things Liked */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Things You Liked
              </h3>
              <p className="text-sm text-muted-foreground">
                Share {ITEMS_PER_CATEGORY} things this coach did well
              </p>
              {Array.from({ length: ITEMS_PER_CATEGORY }).map((_, index) => (
                <FormField
                  key={`liked-${index}`}
                  control={form.control}
                  name={`liked.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>#{index + 1}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`Something you liked...`}
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

            {/* Things to Improve */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Areas for Improvement
              </h3>
              <p className="text-sm text-muted-foreground">
                Share {ITEMS_PER_CATEGORY} areas where this coach could improve
              </p>
              {Array.from({ length: ITEMS_PER_CATEGORY }).map((_, index) => (
                <FormField
                  key={`improvement-${index}`}
                  control={form.control}
                  name={`improvements.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>#{index + 1}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`An area for improvement...`}
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

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit Feedback"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
