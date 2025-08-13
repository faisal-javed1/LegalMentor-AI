"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  DollarSign,
  Plus,
  Search,
  FileText,
  Send,
  Eye,
  Download,
  Edit,
  Trash2,
  Clock,
  TrendingUp,
  AlertCircle,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ProtectedRoute from "@/components/protected-route"
import { dataService, type Invoice, type ClientDashboard, type CaseDashboard } from "@/lib/data-service"
import { validateForm, type ValidationErrors } from "@/lib/validation"

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<ClientDashboard[]>([])
  const [cases, setCases] = useState<CaseDashboard[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("invoices")

  const [formData, setFormData] = useState({
    clientId: "",
    caseId: "",
    dueDate: "",
    items: [{ description: "", quantity: 1, rate: 0 }],
  })
  const [errors, setErrors] = useState<ValidationErrors>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [invoicesData, clientsData, casesData] = await Promise.all([
        dataService.getInvoices(),
        dataService.getClients(),
        dataService.getCases(),
      ])
      setInvoices(invoicesData)
      setClients(clientsData)
      setCases(casesData)
    } catch (error) {
      console.error("Error loading billing data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationRules = {
      clientId: { required: true },
      dueDate: { required: true },
    }

    const validationErrors = validateForm(formData, validationRules)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      const totalAmount = formData.items.reduce((sum, item) => sum + item.quantity * item.rate, 0)

      const newInvoice = await dataService.createInvoice({
        clientId: formData.clientId,
        caseId: formData.caseId || undefined,
        dueDate: formData.dueDate,
        amount: totalAmount,
        items: formData.items.map((item, index) => ({
          id: (index + 1).toString(),
          ...item,
          amount: item.quantity * item.rate,
        })),
      })

      setInvoices([...invoices, newInvoice])
      setShowCreateDialog(false)
      setFormData({
        clientId: "",
        caseId: "",
        dueDate: "",
        items: [{ description: "", quantity: 1, rate: 0 }],
      })
      setErrors({})
    } catch (error) {
      console.error("Error creating invoice:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData((prev) => ({ ...prev, items: newItems }))
  }

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, rate: 0 }],
    }))
  }

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }))
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const client = clients.find((c) => c.client_id === invoice.client_id)
    const matchesSearch =
      client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_id.toString().toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0)
  const paidInvoices = invoices.filter((inv) => inv.status === "paid")
  const pendingInvoices = invoices.filter((inv) => inv.status === "sent")
  const overdueInvoices = invoices.filter((inv) => inv.status === "overdue")

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
                <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                  <DollarSign className="h-8 w-8 mr-3 text-indigo-600" />
                  Billing & Invoices
                </h1>
                <p className="text-slate-600 mt-1">Manage invoices and track payments</p>
              </div>

              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>Generate a new invoice for your client.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateInvoice} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clientId">Client *</Label>
                        <Select
                          value={formData.clientId}
                          onValueChange={(value) => handleInputChange("clientId", value)}
                        >
                          <SelectTrigger className={errors.clientId ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients?.map((client) => (
                              <SelectItem key={`client-${client.client_id}`} value={client.client_id.toString()}>
                                {client.name}
                              </SelectItem>
                            )) || []}
                          </SelectContent>
                        </Select>
                        {errors.clientId && <p className="text-red-500 text-sm mt-1">{errors.clientId}</p>}
                      </div>
                      <div>
                        <Label htmlFor="caseId">Case (Optional)</Label>
                        <Select value={formData.caseId} onValueChange={(value) => handleInputChange("caseId", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select case" />
                          </SelectTrigger>
                          <SelectContent>
                            {cases?.map((caseItem) => (
                              <SelectItem key={`case-${caseItem.case_id}`} value={caseItem.case_id.toString()}>
                                {caseItem.title}
                              </SelectItem>
                            )) || []}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="dueDate">Due Date *</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => handleInputChange("dueDate", e.target.value)}
                        className={errors.dueDate ? "border-red-500" : ""}
                      />
                      {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label>Invoice Items</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addItem}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Item
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {formData.items.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2 items-end">
                            <div className="col-span-6">
                              <Input
                                placeholder="Description"
                                value={item.description}
                                onChange={(e) => handleItemChange(index, "description", e.target.value)}
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                placeholder="Qty"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleItemChange(index, "quantity", Number.parseInt(e.target.value) || 0)
                                }
                                min="1"
                              />
                            </div>
                            <div className="col-span-3">
                              <Input
                                type="number"
                                placeholder="Rate"
                                value={item.rate}
                                onChange={(e) =>
                                  handleItemChange(index, "rate", Number.parseFloat(e.target.value) || 0)
                                }
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div className="col-span-1">
                              {formData.items.length > 1 && (
                                <Button type="button" variant="outline" size="sm" onClick={() => removeItem(index)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Amount:</span>
                          <span className="text-lg font-bold">
                            {formatCurrency(formData.items.reduce((sum, item) => sum + item.quantity * item.rate, 0))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Create Invoice</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-500">Paid Invoices</p>
                    <p className="text-2xl font-bold text-slate-800">{paidInvoices.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-500">Pending</p>
                    <p className="text-2xl font-bold text-slate-800">{pendingInvoices.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-500">Overdue</p>
                    <p className="text-2xl font-bold text-slate-800">{overdueInvoices.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
              <CardDescription>Manage and track all your invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredInvoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => {
                        const client = clients.find((c) => c.client_id === invoice.client_id)
                        return (
                          <TableRow key={invoice.invoice_id}>
                            <TableCell className="font-medium">#{invoice.invoice_id}</TableCell>
                            <TableCell>{client?.name || "Unknown Client"}</TableCell>
                            <TableCell className="font-semibold">{formatCurrency(invoice.amount)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                            </TableCell>
                            <TableCell>{formatDate(invoice.due_date)}</TableCell>
                            <TableCell>{formatDate(invoice.created_at)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Send className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-800 mb-2">
                    {searchTerm || statusFilter !== "all" ? "No invoices found" : "No invoices yet"}
                  </h3>
                  <p className="text-slate-500 mb-4">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "Create your first invoice to start billing clients."}
                  </p>
                  {!searchTerm && statusFilter === "all" && (
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Invoice
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
