"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, X, Users, ArrowLeft } from "lucide-react"
import { useState } from "react"
import ProtectedRoute from "@/components/protected-route"
import Link from "next/link"

interface TeamMember {
  id: number
  name: string
  selected: boolean
}

export default function GroupsPage() {
  const [showMemberSelect, setShowMemberSelect] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [teamMembers] = useState<TeamMember[]>([{ id: 1, name: "faisal javed", selected: false }])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
  }

  return (
    <ProtectedRoute allowedRoles={["lawyer"]}>
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center text-indigo-600 hover:text-indigo-500 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                  <Users className="h-8 w-8 mr-3 text-indigo-600" />
                  Groups (0)
                </h1>
                <p className="text-slate-600 mt-1">Organize your team into groups</p>
              </div>
              <Button className="bg-indigo-600 text-white hover:bg-indigo-700">Add New</Button>
            </div>
          </div>

          {/* Group Form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Group Name</label>
                <Input className="focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Team Members</label>
                <div className="relative">
                  <Button
                    type="button"
                    onClick={() => setShowMemberSelect(true)}
                    className="w-full justify-start bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Select Team Members
                  </Button>

                  {showMemberSelect && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg">
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div className="text-sm text-slate-700">You have selected 1 Team Member(s)</div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowMemberSelect(false)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="relative mb-4">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-2">
                          {teamMembers.map((member) => (
                            <label key={member.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={member.selected}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="text-slate-700">{member.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                  Submit
                </Button>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </div>

          {/* Groups Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-slate-200">
                  <TableHead className="text-slate-700">Group Name</TableHead>
                  <TableHead className="text-slate-700"># of member(s)</TableHead>
                  <TableHead className="text-slate-700">Created By</TableHead>
                  <TableHead className="text-slate-700">Created At</TableHead>
                  <TableHead className="text-right text-slate-700">Action(s)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="text-slate-500">
                      You haven't created any group.{" "}
                      <button className="text-indigo-600 hover:underline">Click here</button> to add first one.
                    </div>
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
