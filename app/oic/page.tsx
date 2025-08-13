"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Shield, ArrowLeft } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import Link from "next/link"

export default function OICPage() {
  return (
    <ProtectedRoute allowedRoles={["lawyer"]}>
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center text-indigo-600 hover:text-indigo-500 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                  <Shield className="h-8 w-8 mr-3 text-indigo-600" />
                  OIC (0)
                </h1>
                <p className="text-slate-600 mt-1">Officer in Charge management</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <Users className="h-4 w-4 mr-2" />
                  Add OIC
                </Button>
              </div>
            </div>
          </div>

          {/* OIC Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-slate-200">
                  <TableHead className="text-slate-700">#</TableHead>
                  <TableHead className="text-slate-700">First Name</TableHead>
                  <TableHead className="text-slate-700">Last Name</TableHead>
                  <TableHead className="text-slate-700">Email Address</TableHead>
                  <TableHead className="text-slate-700">Mobile Number</TableHead>
                  <TableHead className="text-slate-700">Designation</TableHead>
                  <TableHead className="text-right text-slate-700">Action(s)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="text-slate-500">No results found.</div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
