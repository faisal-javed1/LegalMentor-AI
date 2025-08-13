"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Calendar, FileText, Filter, ArrowLeft, Plus, Edit, Trash2, Scale, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ProtectedRoute from "@/components/protected-route"
import Link from "next/link"
import { dataService, type CaseActivityDetails, type CaseActivityType } from "@/lib/data-service"
import { format } from "date-fns"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function CaseDiaryPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [caseActivities, setCaseActivities] = useState<CaseActivityDetails[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<CaseActivityType | "all">("all")
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "quarter" | "all">("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCaseActivities = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const filters: {
        activity_type?: CaseActivityType
        date_range?: "today" | "week" | "month" | "quarter" | "all"
        search_term?: string
      } = {}

      if (filterType !== "all") filters.activity_type = filterType
      if (dateRange !== "all") filters.date_range = dateRange
      if (searchTerm.trim() !== "") filters.search_term = searchTerm.trim()

      const fetchedActivities = await dataService.getAllCaseActivities(filters)
      setCaseActivities(fetchedActivities)
    } catch (err: any) {
      console.error("Failed to fetch case activities:", err)
      setError(err.message || "Failed to load case diary. Please try again.")
      toast.error("Failed to load case diary", {
        description: err.message || "Please try again later.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteActivity = async (activityId: number) => {
    try {
      await dataService.deleteCaseActivity(activityId.toString())
      toast.success("Activity deleted successfully")
      fetchCaseActivities() // Refresh the list
    } catch (err: any) {
      console.error("Failed to delete activity:", err)
      toast.error("Failed to delete activity", {
        description: err.message || "Please try again.",
      })
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      fetchCaseActivities()
    }
  }, [user, authLoading, filterType, dateRange, searchTerm])

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP 'at' p")
    } catch (e) {
      return "Invalid Date"
    }
  }

  const getTimelineIcon = (type: CaseActivityType) => {
    switch (type) {
      case "hearing":
        return <Scale className="h-5 w-5 text-indigo-600" />
      case "filing":
        return <FileText className="h-5 w-5 text-green-600" />
      case "meeting":
        return <Calendar className="h-5 w-5 text-blue-600" />
      case "deadline":
        return <Clock className="h-5 w-5 text-red-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalActivities = caseActivities.length
  const upcomingActivities = useMemo(() => {
    const now = new Date()
    return caseActivities.filter((activity) => new Date(activity.activity_date) > now).length
  }, [caseActivities])

  const casesWithActivities = useMemo(() => {
    const uniqueCaseIds = new Set(caseActivities.map((activity) => activity.case_id))
    return uniqueCaseIds.size
  }, [caseActivities])

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
            <p className="text-lg font-medium mb-2">Error loading case diary:</p>
            <p>{error}</p>
            <Button onClick={fetchCaseActivities} className="mt-4">
              Retry
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
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center text-indigo-600 hover:text-indigo-500 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                  <FileText className="h-8 w-8 mr-3 text-indigo-600" />
                  Case Diary
                </h1>
                <p className="text-slate-600 mt-1">Track and manage case activities and events</p>
              </div>
              <Link href="/activity">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activity
                </Button>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={(value) => setFilterType(value as CaseActivityType | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="hearing">Hearings</SelectItem>
                <SelectItem value="filing">Filings</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="deadline">Deadlines</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={dateRange}
              onValueChange={(value) => setDateRange(value as "today" | "week" | "month" | "quarter" | "all")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>

          {/* Case Diary Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timeline */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Case Timeline
                  </CardTitle>
                  <CardDescription>Chronological view of case activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {caseActivities.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-800 mb-2">No case activities yet</h3>
                      <p className="text-slate-500 mb-4">
                        Case activities and events will appear here as they are added to your cases.
                      </p>
                      <Link href="/case-diary/add">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Activity
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="relative pl-8 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-slate-200">
                      {caseActivities.map((activity) => (
                        <div key={activity.activity_id} className="mb-8 last:mb-0">
                          <div className="absolute -left-3 mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-8 ring-slate-50">
                            {getTimelineIcon(activity.type)}
                          </div>
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800 text-lg">{activity.title}</h3>
                            <span className="text-sm text-slate-500">{formatDate(activity.activity_date)}</span>
                          </div>
                          <p className="text-slate-700 mt-1">{activity.description}</p>
                          <div className="mt-2 text-sm text-slate-600">
                            <div>
                              Case:{" "}
                              <Link href={`/case/${activity.case_id}`} className="text-indigo-600 hover:underline">
                                {activity.case_title} ({activity.case_number || "No case number"})
                              </Link>
                              <Badge
                                variant="secondary"
                                className={`ml-2 ${getStatusBadgeColor(activity.case_status)}`}
                              >
                                {activity.case_status}
                              </Badge>
                            </div>
                            {activity.location && <p>Location: {activity.location}</p>}
                            {activity.notes && <p>Notes: {activity.notes}</p>}
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => router.push(`/case-diary/edit/${activity.activity_id}`)}
                            >
                              <Edit className="h-3 w-3 mr-1" /> Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-800 bg-transparent"
                              onClick={() => handleDeleteActivity(activity.activity_id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" /> Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Activities</span>
                    <span className="font-semibold">{totalActivities}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Upcoming Activities</span>
                    <span className="font-semibold">{upcomingActivities}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Cases with Activities</span>
                    <span className="font-semibold">{casesWithActivities}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity (Top 5 from fetched activities) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {caseActivities.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500 text-sm">No recent activity</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {caseActivities.slice(0, 5).map((activity) => (
                        <li key={activity.activity_id} className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">{getTimelineIcon(activity.type)}</div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{activity.title}</p>
                            <p className="text-xs text-slate-500">
                              Case: {activity.case_title} - {formatDate(activity.activity_date)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Events (Top 5 upcoming activities) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingActivities === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500 text-sm">No upcoming events</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {caseActivities
                        .filter((activity) => new Date(activity.activity_date) > new Date())
                        .sort((a, b) => new Date(a.activity_date).getTime() - new Date(b.activity_date).getTime())
                        .slice(0, 5)
                        .map((activity) => (
                          <li key={activity.activity_id} className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">{getTimelineIcon(activity.type)}</div>
                            <div>
                              <p className="text-sm font-medium text-slate-800">{activity.title}</p>
                              <p className="text-xs text-slate-500">
                                Case: {activity.case_title} - {formatDate(activity.activity_date)}
                              </p>
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}