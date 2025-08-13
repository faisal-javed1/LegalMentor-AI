"use client"

import { useState, useEffect } from "react"
import { Upload, Search, Filter, Download, Eye, Trash2, ArrowLeft, FileText, ImageIcon, File, Users, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import ProtectedRoute from "@/components/protected-route"
import Link from "next/link"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { dataService, type ClientDashboard, type CaseDashboard } from "@/lib/data-service"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface Document {
  document_id: number
  title: string
  file_type: string
  file_size: number
  created_at: string
  description: string | null
  case_id: number | null
  case_title: string | null
  client_id?: number | null
  client_name?: string | null
  file_path: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [clients, setClients] = useState<ClientDashboard[]>([])
  const [cases, setCases] = useState<CaseDashboard[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedClient, setSelectedClient] = useState("all")
  const [selectedCase, setSelectedCase] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState("")
  const [uploadDescription, setUploadDescription] = useState("")
  const [selectedUploadClient, setSelectedUploadClient] = useState("")
  const [selectedUploadCase, setSelectedUploadCase] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const categories = [
    { value: "all", label: "All Documents" },
    { value: "contracts", label: "Contracts" },
    { value: "evidence", label: "Evidence" },
    { value: "correspondence", label: "Correspondence" },
    { value: "court-filings", label: "Court Filings" },
    { value: "research", label: "Research" },
    { value: "bills", label: "Bills & Invoices" },
    { value: "other", label: "Other" },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        console.log("Fetching documents, clients, and cases...")
        const [docs, clientsData, casesData] = await Promise.all([
          dataService.getDocuments(),
          dataService.getClients(),
          dataService.getCases(),
        ])
        console.log("Fetched data:", { docs: docs.length, clients: clientsData.length, cases: casesData.length })
        setDocuments(docs)
        setClients(clientsData)
        setCases(casesData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch documents and data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileToUpload(e.target.files[0])
      setUploadTitle(e.target.files[0].name.split('.')[0])
    }
  }

  const handleUpload = async () => {
    if (!fileToUpload || !uploadTitle) {
      toast({
        title: "Error",
        description: "Please select a file and provide a title",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)
      
      const newDoc = await dataService.uploadDocument({
        file: fileToUpload,
        title: uploadTitle,
        description: uploadDescription,
        case_id: selectedUploadCase && selectedUploadCase !== "none" ? parseInt(selectedUploadCase) : undefined,
        client_id: selectedUploadClient && selectedUploadClient !== "none" ? parseInt(selectedUploadClient) : undefined,
      })

      setDocuments([newDoc, ...documents])
      setShowUploadDialog(false)
      setFileToUpload(null)
      setUploadTitle("")
      setUploadDescription("")
      setSelectedUploadClient("")
      setSelectedUploadCase("")
      
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (documentId: number) => {
    try {
      await dataService.deleteDocument(documentId)
      setDocuments(documents.filter(doc => doc.document_id !== documentId))
      
      toast({
        title: "Success",
        description: "Document deleted successfully",
      })
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async (documentId: number, fileName: string) => {
    try {
      const blob = await dataService.downloadDocument(documentId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Download",
        description: `Downloading ${fileName}`,
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      })
    }
  }

  const handleView = (documentId: number) => {
    router.push(`/documents/${documentId}`)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) return <ImageIcon size={16} className="text-blue-500" />
    if (fileType.includes("pdf")) return <FileText size={16} className="text-red-500" />
    return <File size={16} className="text-slate-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Filter cases based on selected client
  const filteredCases = cases.filter(caseItem => 
    selectedClient === "all" || caseItem.client.client_id.toString() === selectedClient
  )

  const filteredDocuments = documents.filter(doc => {
    // Filter by search term
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    // Filter by client
    const matchesClient = selectedClient === "all" || 
      (doc.client_id && doc.client_id.toString() === selectedClient)
    
    // Filter by case
    const matchesCase = selectedCase === "all" || 
      (doc.case_id && doc.case_id.toString() === selectedCase)
    
    // Filter by category (mock implementation)
    const matchesCategory = 
      selectedCategory === "all" ||
      (selectedCategory === "contracts" && doc.file_type.includes("pdf")) ||
      (selectedCategory === "evidence" && doc.file_type.includes("image")) ||
      (selectedCategory === "correspondence" && doc.title.includes("Email")) ||
      (selectedCategory === "court-filings" && doc.title.includes("Filing")) ||
      (selectedCategory === "research" && doc.title.includes("Research")) ||
      (selectedCategory === "bills" && doc.title.includes("Bill")) ||
      (selectedCategory === "other" && !doc.title.includes("Contract") && !doc.title.includes("Evidence") && !doc.title.includes("Email") && !doc.title.includes("Filing") && !doc.title.includes("Research") && !doc.title.includes("Bill"))
    
    return matchesSearch && matchesClient && matchesCase && matchesCategory
  })

  return (
    <ProtectedRoute allowedRoles={["lawyer"]}>
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Back to Dashboard Link */}
          <div className="mb-4 sm:mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200 text-sm sm:text-base"
            >
              <ArrowLeft size={16} className="mr-2 flex-shrink-0" />
              Back to Dashboard
            </Link>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="mb-4 sm:mb-6">
            <BreadcrumbNav items={[{ label: "Documents" }]} />
          </div>

          {/* Header */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Documents ({filteredDocuments.length})</h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">Manage your legal documents and files</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <Button variant="outline" className="flex items-center justify-center gap-2 bg-transparent">
                <Filter className="h-4 w-4 flex-shrink-0" />
                Filter
              </Button>
              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2">
                    <Upload className="h-4 w-4 flex-shrink-0" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Upload New Document</DialogTitle>
                    <DialogDescription>Upload a document and associate it with a client and case.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* File Upload */}
                    <div>
                      <Label htmlFor="file-upload">Select File</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                        className="mt-1"
                      />
                      {fileToUpload && (
                        <p className="text-xs text-slate-500 mt-1">
                          {fileToUpload.name} • {formatFileSize(fileToUpload.size)}
                        </p>
                      )}
                    </div>

                    {/* Document Title */}
                    <div>
                      <Label htmlFor="upload-title">Document Title *</Label>
                      <Input
                        id="upload-title"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="Enter document title"
                        className="mt-1"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="upload-description">Description (Optional)</Label>
                      <Textarea
                        id="upload-description"
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                        placeholder="Brief description of the document"
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    {/* Client Selection */}
                    <div>
                      <Label htmlFor="upload-client">Client (Optional)</Label>
                      <Select value={selectedUploadClient} onValueChange={setSelectedUploadClient}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Client</SelectItem>
                          {clients.map((client) => (
                            <SelectItem key={`upload-client-${client.client_id}`} value={client.client_id.toString()}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Case Selection */}
                    <div>
                      <Label htmlFor="upload-case">Case (Optional)</Label>
                      <Select value={selectedUploadCase} onValueChange={setSelectedUploadCase}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a case" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Case</SelectItem>
                          {filteredCases.map((caseItem) => (
                            <SelectItem key={`upload-case-${caseItem.case_id}`} value={caseItem.case_id.toString()}>
                              {caseItem.title} - {caseItem.client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowUploadDialog(false)}
                        disabled={isUploading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpload}
                        disabled={isUploading || !uploadTitle || !fileToUpload}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {isUploading ? "Uploading..." : "Upload Document"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 flex-shrink-0" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Client Filter */}
            <div>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={`filter-client-${client.client_id}`} value={client.client_id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Case Filter */}
            <div>
              <Select value={selectedCase} onValueChange={setSelectedCase}>
                <SelectTrigger>
                  <SelectValue placeholder="Case" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cases</SelectItem>
                  {filteredCases.map((caseItem) => (
                    <SelectItem key={`filter-case-${caseItem.case_id}`} value={caseItem.case_id.toString()}>
                      {caseItem.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Documents Grid/List */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-slate-400 mb-4">
                  <Upload size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No documents found</h3>
                <p className="text-slate-500 mb-6 text-sm sm:text-base">
                  {searchTerm || selectedClient !== "all" || selectedCase !== "all" || selectedCategory !== "all" 
                    ? "No documents match your filters." 
                    : "Upload your first document to get started."}
                </p>
                <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Mobile View - List */}
              <div className="block sm:hidden space-y-4">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.document_id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">{getFileIcon(doc.file_type)}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900 truncate">{doc.title}</h3>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm text-slate-500">
                              {formatFileSize(doc.file_size)} • {formatDate(doc.created_at)}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {doc.file_type.split('/')[1] || doc.file_type}
                              </Badge>
                              {doc.client_name && (
                                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                  <Users size={10} />
                                  {doc.client_name}
                                </Badge>
                              )}
                              {doc.case_title && (
                                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                  <Scale size={10} />
                                  {doc.case_title}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-8 w-8"
                            onClick={() => handleView(doc.document_id)}
                          >
                            <Eye size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-8 w-8"
                            onClick={() => handleDownload(doc.document_id, doc.title)}
                          >
                            <Download size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-8 w-8 text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(doc.document_id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop View - Grid */}
              <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.document_id} className="hover:shadow-md transition-shadow group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          {getFileIcon(doc.file_type)}
                          <CardTitle className="text-sm font-medium truncate" title={doc.title}>
                            {doc.title}
                          </CardTitle>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-6 w-6"
                            onClick={() => handleView(doc.document_id)}
                          >
                            <Eye size={12} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-6 w-6"
                            onClick={() => handleDownload(doc.document_id, doc.title)}
                          >
                            <Download size={12} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-6 w-6 text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(doc.document_id)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500">
                          {formatFileSize(doc.file_size)} • {formatDate(doc.created_at)}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {doc.file_type.split('/')[1] || doc.file_type}
                          </Badge>
                          {doc.client_name && (
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              <Users size={10} />
                              {doc.client_name}
                            </Badge>
                          )}
                          {doc.case_title && (
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              <Scale size={10} />
                              {doc.case_title}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}