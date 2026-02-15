"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ClipboardCopy, Download, Mail } from "lucide-react"
import { toast } from "sonner"
import { useServerAction } from "zsa-react"
import { sendCoachFeedbackEmailAction } from "../../_actions/send-coach-feedback-email.action"

interface FeedbackEntry {
  categories: Record<string, string[]>
  createdAt: Date
}

interface CoachFeedbackActionsProps {
  coachName: string
  questions: { category: string; label: string }[]
  feedbackEntries: FeedbackEntry[]
}

export function CoachFeedbackActions({ coachName, questions, feedbackEntries }: CoachFeedbackActionsProps) {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState("")

  const { execute: sendEmail, status: emailStatus } = useServerAction(sendCoachFeedbackEmailAction, {
    onSuccess: () => {
      toast.success("Email sent successfully")
      setEmailDialogOpen(false)
      setRecipientEmail("")
    },
    onError: () => {
      toast.error("Failed to send email")
    },
  })

  function handleCopyAsText() {
    const lines: string[] = [`Feedback Summary: ${coachName}`, `${feedbackEntries.length} review${feedbackEntries.length !== 1 ? "s" : ""}`, ""]

    for (let i = 0; i < feedbackEntries.length; i++) {
      const entry = feedbackEntries[i]
      lines.push(`Review #${i + 1}`)
      lines.push("---")

      for (const question of questions) {
        const items = entry.categories[question.category] ?? []
        if (items.length === 0) continue
        lines.push(`${question.label}:`)
        for (const item of items) {
          lines.push(`  - ${item}`)
        }
        lines.push("")
      }
      lines.push("")
    }

    navigator.clipboard.writeText(lines.join("\n")).then(
      () => toast.success("Copied to clipboard"),
      () => toast.error("Failed to copy to clipboard")
    )
  }

  async function handleDownloadPdf() {
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const maxWidth = pageWidth - margin * 2
    let y = 20

    function checkPageBreak(needed: number) {
      if (y + needed > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage()
        y = 20
      }
    }

    // Title
    doc.setFontSize(18)
    doc.text(`Feedback Summary: ${coachName}`, margin, y)
    y += 10

    doc.setFontSize(11)
    doc.text(`${feedbackEntries.length} review${feedbackEntries.length !== 1 ? "s" : ""}`, margin, y)
    y += 12

    // Anonymous feedback entries - no reviewer names shown
    for (let i = 0; i < feedbackEntries.length; i++) {
      const entry = feedbackEntries[i]
      checkPageBreak(30)

      doc.setFontSize(13)
      doc.setFont("helvetica", "bold")
      doc.text(`Review #${i + 1}`, margin, y)
      y += 8

      for (const question of questions) {
        const items = entry.categories[question.category] ?? []
        if (items.length === 0) continue

        checkPageBreak(10 + items.length * 7)
        doc.setFontSize(11)
        doc.setFont("helvetica", "bold")
        doc.text(`${question.label}:`, margin, y)
        y += 6

        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        for (const item of items) {
          const lines = doc.splitTextToSize(`- ${item}`, maxWidth - 5)
          checkPageBreak(lines.length * 5 + 2)
          doc.text(lines, margin + 5, y)
          y += lines.length * 5 + 2
        }
        y += 2
      }

      y += 6
    }

    doc.save(`feedback-${coachName.toLowerCase().replace(/\s+/g, "-")}.pdf`)
  }

  return (
    <div className="flex gap-3">
      <Button variant="outline" onClick={handleCopyAsText}>
        <ClipboardCopy className="h-4 w-4 mr-2" />
        Copy as Text
      </Button>

      <Button variant="outline" onClick={handleDownloadPdf}>
        <Download className="h-4 w-4 mr-2" />
        Download PDF
      </Button>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Email Summary
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Feedback Summary</DialogTitle>
            <DialogDescription>
              Send {coachName}&apos;s anonymous feedback summary to an email address.
              Reviewer names are not included.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="coach@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => sendEmail({ coachName, recipientEmail })}
              disabled={!recipientEmail || emailStatus === "pending"}
            >
              {emailStatus === "pending" ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
