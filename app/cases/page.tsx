"use client"
import { useState, useEffect } from "react"
import { Filter, Plus, Search, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ProtectedRoute from "@/components/protected-route"
import Link from "next/link"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { dataService, type CaseDashboard } from "@/lib/data-service"

export default function CasesPage() {
  const [cases, setCases] = useState<CaseDashboard[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true)
        const fetchedCases = await dataService.getAllCases()
        setCases(fetchedCases)
      } catch (err: any) {
        console.error("Failed to fetch cases:", err)
        setError(err.message || "Failed to load cases. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchCases()
  }, [])

  const filteredCases = cases.filter(
    (caseItem) =>
      caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.client.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
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
            <p className="text-lg font-medium mb-2">Error loading cases:</p>
            <p>{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
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
            <BreadcrumbNav items={[{ label: "Cases" }]} />
          </div>

          {/* Header */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Running Cases ({filteredCases.length})</h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">Manage and track your legal cases</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <Button variant="outline" className="flex items-center justify-center gap-2 bg-transparent">
                <Filter className="h-4 w-4 flex-shrink-0" />
                Filter
              </Button>
              <Link href="/add-case" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4 flex-shrink-0" />
                  Add Case
                </Button>
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-full sm:max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 flex-shrink-0" />
              <Input
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
          </div>

          {/* Cases Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Mobile View */}
            <div className="block sm:hidden">
              {filteredCases.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="text-slate-500">
                    <div className="mb-4">
                      <div className="mx-auto h-12 w-12 text-slate-400">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-lg font-medium text-slate-900 mb-2">No cases yet</p>
                    <p className="text-slate-500 mb-4 text-sm">
                      You haven't added any cases yet.{" "}
                      <Link href="/add-case" className="text-indigo-600 hover:text-indigo-500 font-medium">
                        Click here
                      </Link>{" "}
                      to add your first one.
                    </p>
                    <Link href="/add-case">
                      <Button className="bg-indigo-600 hover:bg-indigo-700 w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Case
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredCases.map((caseItem) => (
                    <div key={caseItem.case_id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-900 truncate">{caseItem.title}</h3>
                            <p className="text-sm text-slate-500">Case: {caseItem.case_number || "N/A"}</p>
                          </div>
                          <Link href={`/cases/${caseItem.case_id}`}>
                            <Button variant="outline" size="sm" className="ml-2 flex-shrink-0 bg-transparent">
                              View
                            </Button>
                          </Link>
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-slate-700">Court:</span>
                            <span className="ml-2 text-slate-600">{caseItem.court}</span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">Client:</span>
                            <span className="ml-2 text-slate-600">{caseItem.client.name}</span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">Status:</span>
                            <span className="ml-2 text-slate-600">{caseItem.status}</span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">Priority:</span>
                            <span className="ml-2 text-slate-600">{caseItem.priority}</span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">Next Hearing:</span>
                            <span className="ml-2 text-slate-600">{caseItem.nextHearing || "Not scheduled"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Court
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Case
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Next Hearing
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Action(s)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredCases.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <div className="text-slate-500">
                          <div className="mb-4">
                            <div className="mx-auto h-12 w-12 text-slate-400">
                              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                          </div>
                          <p className="text-lg font-medium text-slate-900 mb-2">No cases yet</p>
                          <p className="text-slate-500 mb-4">
                            You haven't added any cases yet.{" "}
                            <Link href="/add-case" className="text-indigo-600 hover:text-indigo-500 font-medium">
                              Click here
                            </Link>{" "}
                            to add your first one.
                          </p>
                          <Link href="/add-case">
                            <Button className="bg-indigo-600 hover:bg-indigo-700">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Your First Case
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCases.map((caseItem) => (
                      <tr key={caseItem.case_id} className="hover:bg-slate-50">
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-slate-900">{caseItem.court}</td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {caseItem.case_number || "N/A"}
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-sm text-slate-900 max-w-xs">
                          <div className="truncate" title={caseItem.title}>
                            {caseItem.title}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-sm text-slate-900 max-w-xs">
                          <div className="truncate" title={caseItem.client.name}>
                            {caseItem.client.name}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-sm text-slate-900 max-w-xs">
                          <div className="truncate" title={caseItem.status}>
                            {caseItem.status}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {caseItem.nextHearing || "Not scheduled"}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-slate-900">{caseItem.priority}</td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          <Link href={`/cases/${caseItem.case_id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
