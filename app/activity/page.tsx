"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"
import Link from "next/link"
import { dataService, type CaseActivityDetails, type CaseActivityType } from "@/lib/data-service"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"

interface CaseActivityFormData {
  case_id: number
  type: CaseActivityType
  title: string
  description: string
  activity_date: string
  location: string
  notes: string
}

export default function AddEditCaseActivityPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cases, setCases] = useState<{ case_id: number; title: string; case_number: string | null }[]>([])
  const [date, setDate] = useState<Date | undefined>(new Date())

  const [formData, setFormData] = useState<CaseActivityFormData>({
    case_id: 0,
    type: "hearing",
    title: "",
    description: "",
    activity_date: new Date().toISOString(),
    location: "",
    notes: "",
  })

  const isEditMode = params.id && params.id !== "add"

  useEffect(() => {
    if (!authLoading && user) {
      const loadData = async () => {
        try {
          setLoading(true)
          
          // Load cases for dropdown
          const fetchedCases = await dataService.getAllCases()
          setCases(fetchedCases.map(c => ({
            case_id: c.case_id,
            title: c.title,
            case_number: c.case_number || null
          })))

          // If edit mode, load the activity data
          if (isEditMode && params.id && params.id !== "add") {
            const activity = await dataService.getCaseActivityDetails(params.id as string)
            setFormData({
              case_id: activity.case_id,
              type: activity.type as CaseActivityType,
              title: activity.title,
              description: activity.description || "",
              activity_date: activity.activity_date,
              location: activity.location || "",
              notes: activity.notes || "",
            })
            setDate(new Date(activity.activity_date))
          }
        } catch (err: any) {
          console.error("Failed to load data:", err)
          setError(err.message || "Failed to load data")
          toast.error("Failed to load data", {
            description: err.message || "Please try again later.",
          })
        } finally {
          setLoading(false)
        }
      }

      loadData()
    }
  }, [authLoading, user, isEditMode, params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      if (!date) {
        throw new Error("Please select a date")
      }

      const activityData = {
        case_id: formData.case_id,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        activity_date: date.toISOString(),
        location: formData.location,
        notes: formData.notes,
      }

      if (isEditMode) {
        await dataService.updateCaseActivity(params.id as string, activityData)
        toast.success("Activity updated successfully")
      } else {
        await dataService.createCaseActivity(activityData)
        toast.success("Activity created successfully")
      }

      router.push("/case-diary")
    } catch (err: any) {
      console.error("Failed to submit activity:", err)
      setError(err.message || "Failed to submit activity")
      toast.error("Failed to submit activity", {
        description: err.message || "Please try again.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (authLoading || loading) {
    return (
      <ProtectedRoute allowedRoles={["lawyer"]}>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={["lawyer"]}>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center text-red-600">
            <p className="text-lg font-medium mb-2">Error loading page:</p>
            <p>{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Reload
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["lawyer"]}>
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          {/* Back button */}
          <div className="mb-6">
            <Link href="/case-diary" className="inline-flex items-center text-indigo-600 hover:text-indigo-500">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Case Diary
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              {isEditMode ? "Edit Case Activity" : "Add New Case Activity"}
            </h1>
            <p className="text-slate-600 mt-1">
              {isEditMode ? "Update the details of this case activity" : "Create a new case activity or event"}
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Details</CardTitle>
              <CardDescription>
                Fill in the details of the case activity. All fields are required unless marked optional.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Case Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="case_id">Case</Label>
                    <Select
                      value={formData.case_id.toString()}
                      onValueChange={(value) => setFormData({ ...formData, case_id: Number(value) })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a case" />
                      </SelectTrigger>
                      <SelectContent>
                        {cases.map((caseItem) => (
                          <SelectItem key={caseItem.case_id} value={caseItem.case_id.toString()}>
                            {caseItem.title} ({caseItem.case_number || "No case number"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Activity Type */}
                  <div className="space-y-2">
                    <Label htmlFor="type">Activity Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as CaseActivityType })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hearing">Hearing</SelectItem>
                        <SelectItem value="filing">Filing</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Title */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter activity title"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter detailed description of the activity"
                      rows={4}
                      required
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <Label>Date & Time</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location (Optional)</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter location if applicable"
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Enter any additional notes"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/case-diary")}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditMode ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isEditMode ? "Update Activity" : "Create Activity"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}