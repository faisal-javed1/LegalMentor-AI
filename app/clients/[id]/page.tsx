"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  FileText,
  MessageSquare,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  User,
  Scale,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProtectedRoute from "@/components/protected-route"
import { dataService, type ClientDashboard, type CaseDashboard } from "@/lib/data-service"

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<ClientDashboard | null>(null)
  const [clientCases, setClientCases] = useState<CaseDashboard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadClientData()
  }, [clientId])

  const loadClientData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get all clients and find the specific one
      const clients = await dataService.getClients()
      const foundClient = clients.find((c) => c.client_id.toString() === clientId)

      if (!foundClient) {
        setError("Client not found")
        return
      }

      setClient(foundClient)

      // Get all cases and filter by client
      const allCases = await dataService.getAllCases()
      const clientCases = allCases.filter((c) => c.client.client_id.toString() === clientId)
      setClientCases(clientCases)
    } catch (error) {
      console.error("Error loading client data:", error)
      setError("Failed to load client data")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["lawyer"]}>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !client) {
    return (
      <ProtectedRoute allowedRoles={["lawyer"]}>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">{error || "Client not found"}</h3>
            <p className="text-slate-500 mb-4">The client you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push("/clients")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
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
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/clients")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Clients
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Client Info */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 font-bold text-xl">{client.name.charAt(0)}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">{client.name}</h1>
                  {client.company && (
                    <p className="text-slate-600 flex items-center mt-1">
                      <Building className="h-4 w-4 mr-2" />
                      {client.company}
                    </p>
                  )}
                  <p className="text-slate-500 text-sm mt-1">Client since {formatDate(client.dateAdded || '')}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" className="text-red-600 hover:text-red-700 bg-transparent">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Billed</p>
                    <p className="text-2xl font-semibold text-slate-800">{formatCurrency(client.totalBilled)}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Active Cases</p>
                    <p className="text-2xl font-semibold text-slate-800">
                      {clientCases.filter((c) => c.status === "active").length}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Scale className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Cases</p>
                    <p className="text-2xl font-semibold text-slate-800">{clientCases.length}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Last Contact</p>
                    <p className="text-2xl font-semibold text-slate-800">
                      {clientCases.length > 0 ? "2 days" : "Never"}
                    </p>
                  </div>
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Client Details */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <a href={`mailto:${client.email}`} className="text-slate-800 hover:text-indigo-600">
                        {client.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Phone</p>
                      <a href={`tel:${client.phone}`} className="text-slate-800 hover:text-indigo-600">
                        {client.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-slate-400 mt-1" />
                    <div>
                      <p className="text-sm text-slate-500">Address</p>
                      <p className="text-slate-800">{client.address}</p>
                    </div>
                  </div>

                  {client.company && (
                    <div className="flex items-center gap-3">
                      <Building className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Company</p>
                        <p className="text-slate-800">{client.company}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Cases and Activity */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="cases" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="cases">Cases</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="cases" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Client Cases</h3>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Case
                    </Button>
                  </div>

                  {clientCases.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Scale className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-800 mb-2">No cases yet</h3>
                        <p className="text-slate-500 mb-4">This client doesn't have any cases assigned yet.</p>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Case
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {clientCases.map((caseItem) => (
                        <Card key={caseItem.case_id} className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="font-semibold text-slate-800 mb-1">{caseItem.title}</h4>
                                <p className="text-sm text-slate-500">Case #{caseItem.case_number}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(caseItem.status)}>{caseItem.status}</Badge>
                                <Badge className={getPriorityColor(caseItem.priority)}>{caseItem.priority}</Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-slate-500">Court</p>
                                <p className="text-slate-800">{caseItem.court}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Total Amount</p>
                                <p className="text-slate-800 font-medium">
                                  {formatCurrency(caseItem.billingInfo.totalAmount)}
                                </p>
                              </div>
                            </div>

                            {caseItem.nextHearing && (
                              <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                                <p className="text-sm text-amber-800">
                                  <Clock className="h-4 w-4 inline mr-1" />
                                  Next hearing: {formatDate(caseItem.nextHearing)}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Documents</h3>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>

                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-800 mb-2">No documents yet</h3>
                      <p className="text-slate-500 mb-4">Documents related to this client will appear here.</p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Upload First Document
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <h3 className="text-lg font-semibold">Recent Activity</h3>

                  <Card>
                    <CardContent className="p-8 text-center">
                      <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-800 mb-2">No activity yet</h3>
                      <p className="text-slate-500">Client activity and interactions will appear here.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
