"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  FileText,
  MessageSquare,
  Edit,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ProtectedRoute from "@/components/protected-route"
import { dataService, type ClientDashboard } from "@/lib/data-service"
import { validateForm, commonRules, type ValidationErrors } from "@/lib/validation"

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientDashboard[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
  })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)
      const data = await dataService.getClients()
      setClients(data)
    } catch (error) {
      console.error("Error loading clients:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setErrors({});
  
    // Basic frontend validation
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      setErrors({
        ...(!formData.name && { name: 'Name is required' }),
        ...(!formData.email && { email: 'Email is required' }),
        ...(!formData.phone && { phone: 'Phone is required' }),
        ...(!formData.address && { address: 'Address is required' }),
      });
      return;
    }
  
    try {
      const newClient = await dataService.createClient({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        company: formData.company?.trim() || undefined
      });
  
      // Success case
      setClients([...clients, newClient]);
      setShowCreateDialog(false);
      setFormData({ name: '', email: '', phone: '', address: '', company: '' });
      
    } catch (error) {
      console.error('Client creation error:', error);
      
      if (error instanceof Error) {
        // Handle backend validation errors
        if (error.message.includes('Validation')) {
          try {
            const errorData = JSON.parse(error.message.split('Validation:')[1]);
            const backendErrors: Record<string, string> = {};
            
            // Handle different error formats
            if (Array.isArray(errorData)) {
              errorData.forEach((err: any) => {
                if (err.loc && err.msg) {
                  const field = err.loc[err.loc.length - 1];
                  backendErrors[field] = String(err.msg);
                }
              });
            } else if (typeof errorData === 'object') {
              Object.entries(errorData).forEach(([field, messages]) => {
                backendErrors[field] = Array.isArray(messages) 
                  ? messages.join(', ') 
                  : String(messages);
              });
            }
            
            setErrors(backendErrors);
          } catch (parseError) {
            setFormError('Failed to process validation errors');
          }
        } else {
          setFormError(String(error.message) || 'Failed to create client');
        }
      } else {
        setFormError('An unknown error occurred');
      }
    }
  }
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleDeleteClient = async (clientId: number) => {
    try {
      await dataService.deleteClient(clientId)
      setClients(clients.filter(client => client.client_id !== clientId))
    } catch (error) {
      console.error("Error deleting client:", error)
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
      month: "short",
      day: "numeric",
    })
  }

  const filteredAndSortedClients = clients
    .filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "dateAdded":
          return new Date(b.dateAdded || "").getTime() - new Date(a.dateAdded || "").getTime()
        case "totalBilled":
          return b.totalBilled - a.totalBilled
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["lawyer"]}>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Clients ({clients.length})</h1>
                <p className="text-slate-600 mt-1">Manage your client relationships</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-indigo-50 text-indigo-600" : ""}
                  >
                    Grid
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-indigo-50 text-indigo-600" : ""}
                  >
                    List
                  </Button>
                </div>

                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Client
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Client</DialogTitle>
                      <DialogDescription>Create a new client profile for your practice.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateClient} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Client's full name"
                          className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="Enter email address"
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className={errors.phone ? "border-red-500" : ""}
                        />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                      </div>

                      <div>
                        <Label htmlFor="company">Company (Optional)</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleInputChange("company", e.target.value)}
                          placeholder="Company name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="address">Address *</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          placeholder="Full address"
                          rows={3}
                          className={errors.address ? "border-red-500" : ""}
                        />
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                      </div>

                      {/* Form Error Display */}
                      {formError && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                          <p className="text-red-800 text-sm">{formError}</p>
                        </div>
                      )}

                      <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Add Client</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="dateAdded">Date Added</SelectItem>
                <SelectItem value="totalBilled">Total Billed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clients Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedClients.map((client) => (
                <Card key={`client-grid-${client.client_id}`} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-indigo-600 font-semibold text-lg">{client.name.charAt(0)}</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{client.name}</CardTitle>
                          {client.company && (
                            <CardDescription className="flex items-center mt-1">
                              <Building className="h-3 w-3 mr-1" />
                              {client.company}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteClient(client.client_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-slate-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <a href={`mailto:${client.email}`} className="hover:text-indigo-600">
                        {client.email}
                      </a>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <a href={`tel:${client.phone}`} className="hover:text-indigo-600">
                        {client.phone || "N/A"}
                      </a>
                    </div>
                    <div className="flex items-start text-sm text-slate-600">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                      <span className="line-clamp-2">{client.address || "N/A"}</span>
                    </div>

                    <div className="pt-3 border-t border-slate-200">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-slate-500">Total Billed</span>
                        <span className="font-semibold text-slate-800">{formatCurrency(client.totalBilled)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-slate-500">Active Cases</span>
                        <Badge variant="secondary">{client.cases_count}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Cases
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Total Billed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Date Added
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredAndSortedClients.map((client) => (
                      <tr key={`client-row-${client.client_id}`} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                              <span className="text-indigo-600 font-semibold">{client.name.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900">{client.name}</div>
                              {client.company && (
                                <div className="text-sm text-slate-500 flex items-center">
                                  <Building className="h-3 w-3 mr-1" />
                                  {client.company}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">{client.email}</div>
                          <div className="text-sm text-slate-500">{client.phone || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="secondary">{client.cases_count}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {formatCurrency(client.totalBilled)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {formatDate(client.dateAdded || "")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Calendar className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteClient(client.client_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredAndSortedClients.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                {searchTerm ? "No clients found" : "No clients yet"}
              </h3>
              <p className="text-slate-500 mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "Add your first client to get started with case management."}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Client
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}