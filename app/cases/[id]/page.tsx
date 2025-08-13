"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Scale,
  User,
  XCircle,
  Activity,
  MessageSquare,
  Download,
  Share,
  Archive,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProtectedRoute from "@/components/protected-route"
import { dataService, type CaseDetails } from "@/lib/data-service"
import { toast } from "sonner"

export default function CaseDetailsPage() {
  const params = useParams()
  console.log(params)
  const router = useRouter()
  const [caseData, setCaseData] = useState<CaseDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    court: "",
    priority: "",
    status: "",
    case_number: "",
    before_judge: "",
    referred_by: "",
    section_category: "",
    under_acts: "",
    under_sections: "",
    fir_police_station: "",
    fir_number: "",
    fir_year: "",
    is_affidavit_filed: "",
    court_hall: "",
    floor_no: "",
    classification: "",
    year: "",
    date_of_filing: "",
  })
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    const loadCaseData = async () => {
      try {
        setLoading(true)
        const data = await dataService.getCaseDetails(params.id as string)
        setCaseData(data)
      } catch (err: any) {
        console.error("Error loading case data:", err)
        setError(err.message || "Failed to load case details.")
      } finally {
        setLoading(false)
      }
    }
    loadCaseData()
  }, [params.case_id])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || dateString === "N/A") return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (e) {
      console.error("Invalid date string:", dateString, e)
      return "Invalid Date"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "on-hold":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleEditClick = () => {
    if (caseData) {
      setEditFormData({
        title: caseData.title || "",
        description: caseData.description || "",
        court: caseData.court || "",
        priority: caseData.priority || "",
        status: caseData.status || "",
        case_number: caseData.case_number || "",
        before_judge: caseData.before_judge || "",
        referred_by: caseData.referred_by || "",
        section_category: caseData.section_category || "",
        under_acts: caseData.under_acts || "",
        under_sections: caseData.under_sections || "",
        fir_police_station: caseData.fir_police_station || "",
        fir_number: caseData.fir_number || "",
        fir_year: caseData.fir_year?.toString() || "",
        is_affidavit_filed: caseData.is_affidavit_filed || "",
        court_hall: caseData.court_hall || "",
        floor_no: caseData.floor_no || "",
        classification: caseData.classification || "",
        year: caseData.year?.toString() || "",
        date_of_filing: caseData.date_of_filing || "",
      })
      setShowEditDialog(true)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditLoading(true)

    try {
      // Convert string values to appropriate types for the API
      const submitData = {
        ...editFormData,
        fir_year: editFormData.fir_year ? parseInt(editFormData.fir_year) : undefined,
        year: editFormData.year ? parseInt(editFormData.year) : undefined,
      }
      
      const updatedCase = await dataService.updateCase(params.id as string, submitData)
      setCaseData(updatedCase)
      setShowEditDialog(false)
      toast.success("Case updated successfully")
    } catch (error: any) {
      console.error("Error updating case:", error)
      toast.error(error.message || "Failed to update case")
    } finally {
      setEditLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["lawyer"]}>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !caseData) {
    return (
      <ProtectedRoute allowedRoles={["lawyer"]}>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Case Not Found</h2>
            <p className="text-slate-600 mb-4">{error || "The case you're looking for doesn't exist."}</p>
            <Link href="/cases">
              <Button>Back to Cases</Button>
            </Link>
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
            <Link href="/cases" className="inline-flex items-center text-indigo-600 hover:text-indigo-500 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cases
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-slate-800">{caseData.title}</h1>
                  <Badge className={getStatusColor(caseData.status)}>{caseData.status}</Badge>
                  <Badge className={getPriorityColor(caseData.priority)}>{caseData.priority} priority</Badge>
                </div>
                <p className="text-slate-600">Case #{caseData.case_number}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleEditClick}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Case
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-500">Created</p>
                    <p className="text-lg font-semibold text-slate-800">{formatDate(caseData.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-500">Hours Logged</p>
                    <p className="text-lg font-semibold text-slate-800">{caseData.billingInfo.totalHours}h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-500">Total Billed</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {formatCurrency(caseData.billingInfo.totalAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <Scale className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-500">Court</p>
                    <p className="text-lg font-semibold text-slate-800">{caseData.court}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="client">Client</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Case Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 leading-relaxed">{caseData.description}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Case Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-500">Status</label>
                        <p className="text-slate-800 capitalize">{caseData.status}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-500">Priority</label>
                        <p className="text-slate-800 capitalize">{caseData.priority}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-500">Court</label>
                        <p className="text-slate-800">{caseData.court}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-500">Last Updated</label>
                        <p className="text-slate-800">{formatDate(caseData.updated_at)}</p>
                      </div>
                      {caseData.nextHearing && (
                        <div>
                          <label className="text-sm font-medium text-slate-500">Next Hearing</label>
                          <p className="text-slate-800">{formatDate(caseData.nextHearing)}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Assigned Lawyers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {caseData.assignedLawyers.map((lawyer, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                              <User className="h-4 w-4 text-indigo-600" />
                            </div>
                            <span className="text-slate-800">{lawyer}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="client" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                  <CardDescription>Details about the client for this case</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-500">Name</label>
                        <p className="text-lg font-semibold text-slate-800">{caseData.client.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-500">Email</label>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-slate-400 mr-2" />
                          <a href={`mailto:${caseData.client.email}`} className="text-indigo-600 hover:text-indigo-800">
                            {caseData.client.email}
                          </a>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-500">Phone</label>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-slate-400 mr-2" />
                          <a href={`tel:${caseData.client.phone}`} className="text-indigo-600 hover:text-indigo-800">
                            {caseData.client.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-500">Address</label>
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-slate-400 mr-2 mt-1" />
                          <p className="text-slate-800">{caseData.client.address}</p>
                        </div>
                      </div>
                      {caseData.client.company && (
                        <div>
                          <label className="text-sm font-medium text-slate-500">Company</label>
                          <p className="text-slate-800">{caseData.client.company}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-slate-500">Total Billed</label>
                        <p className="text-lg font-semibold text-slate-800">
                          {formatCurrency(caseData.client.totalBilled)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <Button>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Case Documents</CardTitle>
                      <CardDescription>All documents related to this case</CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 mb-2">No documents yet</h3>
                    <p className="text-slate-500 mb-4">Upload documents related to this case to get started.</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Upload First Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Case Activities</CardTitle>
                      <CardDescription>Timeline of all activities for this case</CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Activity
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 mb-2">No activities yet</h3>
                    <p className="text-slate-500 mb-4">Start tracking activities for this case.</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Activity
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-500">Hourly Rate</p>
                        <p className="text-lg font-semibold text-slate-800">
                          {formatCurrency(caseData.billingInfo.hourlyRate)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-500">Total Hours</p>
                        <p className="text-lg font-semibold text-slate-800">{caseData.billingInfo.totalHours}h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <DollarSign className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-500">Total Amount</p>
                        <p className="text-lg font-semibold text-slate-800">
                          {formatCurrency(caseData.billingInfo.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Time Entries</CardTitle>
                      <CardDescription>Detailed breakdown of billable hours</CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time Entry
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 mb-2">No time entries yet</h3>
                    <p className="text-slate-500 mb-4">Start tracking your time on this case.</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Time Entry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Team Members</CardTitle>
                      <CardDescription>People working on this case</CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Team Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {caseData.assignedLawyers.map((lawyer, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                            <User className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{lawyer}</p>
                            <p className="text-sm text-slate-500">Attorney</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Edit Case Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Case</DialogTitle>
              <DialogDescription>Update the case information below.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Case Title *</Label>
                  <Input
                    id="title"
                    value={editFormData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter case title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="case_number">Case Number</Label>
                  <Input
                    id="case_number"
                    value={editFormData.case_number}
                    onChange={(e) => handleInputChange("case_number", e.target.value)}
                    placeholder="Enter case number"
                  />
                </div>
                <div>
                  <Label htmlFor="court">Court *</Label>
                  <Input
                    id="court"
                    value={editFormData.court}
                    onChange={(e) => handleInputChange("court", e.target.value)}
                    placeholder="Enter court name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={editFormData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={editFormData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={editFormData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    placeholder="Enter year"
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_filing">Date of Filing</Label>
                  <Input
                    id="date_of_filing"
                    type="date"
                    value={editFormData.date_of_filing}
                    onChange={(e) => handleInputChange("date_of_filing", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="before_judge">Before Judge</Label>
                  <Input
                    id="before_judge"
                    value={editFormData.before_judge}
                    onChange={(e) => handleInputChange("before_judge", e.target.value)}
                    placeholder="Enter judge name"
                  />
                </div>
                <div>
                  <Label htmlFor="referred_by">Referred By</Label>
                  <Input
                    id="referred_by"
                    value={editFormData.referred_by}
                    onChange={(e) => handleInputChange("referred_by", e.target.value)}
                    placeholder="Enter referral source"
                  />
                </div>
                <div>
                  <Label htmlFor="section_category">Section Category</Label>
                  <Input
                    id="section_category"
                    value={editFormData.section_category}
                    onChange={(e) => handleInputChange("section_category", e.target.value)}
                    placeholder="Enter section category"
                  />
                </div>
                <div>
                  <Label htmlFor="under_acts">Under Acts</Label>
                  <Input
                    id="under_acts"
                    value={editFormData.under_acts}
                    onChange={(e) => handleInputChange("under_acts", e.target.value)}
                    placeholder="Enter acts"
                  />
                </div>
                <div>
                  <Label htmlFor="under_sections">Under Sections</Label>
                  <Input
                    id="under_sections"
                    value={editFormData.under_sections}
                    onChange={(e) => handleInputChange("under_sections", e.target.value)}
                    placeholder="Enter sections"
                  />
                </div>
                <div>
                  <Label htmlFor="fir_police_station">FIR Police Station</Label>
                  <Input
                    id="fir_police_station"
                    value={editFormData.fir_police_station}
                    onChange={(e) => handleInputChange("fir_police_station", e.target.value)}
                    placeholder="Enter police station"
                  />
                </div>
                <div>
                  <Label htmlFor="fir_number">FIR Number</Label>
                  <Input
                    id="fir_number"
                    value={editFormData.fir_number}
                    onChange={(e) => handleInputChange("fir_number", e.target.value)}
                    placeholder="Enter FIR number"
                  />
                </div>
                <div>
                  <Label htmlFor="fir_year">FIR Year</Label>
                  <Input
                    id="fir_year"
                    type="number"
                    value={editFormData.fir_year}
                    onChange={(e) => handleInputChange("fir_year", e.target.value)}
                    placeholder="Enter FIR year"
                  />
                </div>
                <div>
                  <Label htmlFor="is_affidavit_filed">Affidavit Filed</Label>
                  <Select value={editFormData.is_affidavit_filed} onValueChange={(value) => handleInputChange("is_affidavit_filed", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="notapplicable">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="court_hall">Court Hall</Label>
                  <Input
                    id="court_hall"
                    value={editFormData.court_hall}
                    onChange={(e) => handleInputChange("court_hall", e.target.value)}
                    placeholder="Enter court hall"
                  />
                </div>
                <div>
                  <Label htmlFor="floor_no">Floor Number</Label>
                  <Input
                    id="floor_no"
                    value={editFormData.floor_no}
                    onChange={(e) => handleInputChange("floor_no", e.target.value)}
                    placeholder="Enter floor number"
                  />
                </div>
                <div>
                  <Label htmlFor="classification">Classification</Label>
                  <Input
                    id="classification"
                    value={editFormData.classification}
                    onChange={(e) => handleInputChange("classification", e.target.value)}
                    placeholder="Enter classification"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Case Description</Label>
                <Textarea
                  id="description"
                  value={editFormData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter case description"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editLoading}>
                  {editLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
