"use client"

import { useState, useEffect, useRef } from "react"
import { Search, FileText, Users, Calendar, DollarSign, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { dataService } from "@/lib/data-service"
import { useRouter } from "next/navigation"

interface SearchResult {
  cases: any[]
  clients: any[]
  appointments: any[]
  invoices: any[]
}

interface GlobalSearchProps {
  onClose?: () => void
  className?: string
}

export function GlobalSearch({ onClose, className }: GlobalSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length > 2) {
        setLoading(true)
        try {
          const searchResults = await dataService.globalSearch(query)
          setResults(searchResults)
          setIsOpen(true)
        } catch (error) {
          console.error("Search error:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setResults(null)
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query])

  const handleResultClick = (type: string, id: string) => {
    setIsOpen(false)
    setQuery("")
    onClose?.()

    switch (type) {
      case "case":
        router.push(`/cases/${id}`)
        break
      case "client":
        router.push(`/clients/${id}`)
        break
      case "appointment":
        router.push(`/calendar?appointment=${id}`)
        break
      case "invoice":
        router.push(`/billing?invoice=${id}`)
        break
    }
  }

  const getTotalResults = () => {
    if (!results) return 0
    return results.cases.length + results.clients.length + results.appointments.length + results.invoices.length
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search cases, clients, appointments..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 2 && setIsOpen(true)}
          className="pl-9 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0"
            onClick={() => {
              setQuery("")
              setResults(null)
              setIsOpen(false)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-sm text-slate-500 mt-2">Searching...</p>
              </div>
            ) : results && getTotalResults() > 0 ? (
              <div className="py-2">
                <div className="px-4 py-2 border-b border-slate-200">
                  <p className="text-sm font-medium text-slate-700">
                    {getTotalResults()} result{getTotalResults() !== 1 ? "s" : ""} found
                  </p>
                </div>

                {/* Cases */}
                {results.cases.length > 0 && (
                  <div className="py-2">
                    <div className="px-4 py-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        Cases ({results.cases.length})
                      </p>
                    </div>
                    {results.cases.map((case_) => (
                      <button
                        key={case_.id}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors"
                        onClick={() => handleResultClick("case", case_.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-800">{case_.title}</p>
                            <p className="text-sm text-slate-500">#{case_.caseNumber}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {case_.status}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Clients */}
                {results.clients.length > 0 && (
                  <div className="py-2">
                    <div className="px-4 py-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        Clients ({results.clients.length})
                      </p>
                    </div>
                    {results.clients.map((client) => (
                      <button
                        key={client.id}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors"
                        onClick={() => handleResultClick("client", client.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-800">{client.name}</p>
                            <p className="text-sm text-slate-500">{client.email}</p>
                          </div>
                          {client.company && (
                            <Badge variant="outline" className="text-xs">
                              {client.company}
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Appointments */}
                {results.appointments.length > 0 && (
                  <div className="py-2">
                    <div className="px-4 py-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Appointments ({results.appointments.length})
                      </p>
                    </div>
                    {results.appointments.map((appointment) => (
                      <button
                        key={appointment.id}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors"
                        onClick={() => handleResultClick("appointment", appointment.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-800">{appointment.title}</p>
                            <p className="text-sm text-slate-500">
                              {new Date(appointment.startDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {appointment.type}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Invoices */}
                {results.invoices.length > 0 && (
                  <div className="py-2">
                    <div className="px-4 py-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Invoices ({results.invoices.length})
                      </p>
                    </div>
                    {results.invoices.map((invoice) => (
                      <button
                        key={invoice.id}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors"
                        onClick={() => handleResultClick("invoice", invoice.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-800">#{invoice.invoiceNumber}</p>
                            <p className="text-sm text-slate-500">${invoice.totalAmount.toLocaleString()}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {invoice.status}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : query.length > 2 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-slate-500">No results found for "{query}"</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
