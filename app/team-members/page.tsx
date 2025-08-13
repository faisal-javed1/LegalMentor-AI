"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Minus, Plus, Users, Mail, Phone, MapPin, ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ProtectedRoute from "@/components/protected-route"
import Link from "next/link"
import { dataService } from "@/lib/data-service"

interface TeamMember {
  id?: number
  firstName: string
  lastName: string
  designation: string
  city: string
  email: string
  mobile: string
  userId?: number
  [key: string]: string | number | undefined
}

interface TeamMemberResponse {
  team_member_id: number
  user_id: number
  designation: string
  city: string
  mobile: string
  created_at: string
  updated_at: string
  user: {
    user_id: number
    email: string
    full_name: string
    phone_number?: string
  }
}

export default function AddTeamMember() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true)
      const response = await dataService.getTeamMembers()
      const formattedMembers = response.map((member: TeamMemberResponse) => ({
        id: member.team_member_id,
        firstName: member.user.full_name?.split(' ')[0] || '',
        lastName: member.user.full_name?.split(' ')[1] || '',
        designation: member.designation,
        city: member.city,
        email: member.user.email,
        mobile: member.mobile,
        userId: member.user_id
      }))
      setTeamMembers(formattedMembers)
    } catch (error) {
      console.error("Failed to fetch team members:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addMember = () => {
    setTeamMembers([
      ...teamMembers,
      {
        firstName: "",
        lastName: "",
        designation: "",
        city: "",
        email: "",
        mobile: "",
      },
    ])
  }

  const removeMember = async (index: number, memberId?: number) => {
    if (memberId) {
      try {
        await dataService.deleteTeamMember(memberId)
        fetchTeamMembers()
      } catch (error) {
        console.error("Failed to delete team member:", error)
      }
    } else {
      if (teamMembers.length > 1) {
        setTeamMembers(teamMembers.filter((_, i) => i !== index))
      }
    }
  }

  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    const newMembers = [...teamMembers]
    newMembers[index][field] = value
    setTeamMembers(newMembers)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Separate existing members and new members
      const existingMembers = teamMembers.filter(m => m.id)
      const newMembers = teamMembers.filter(m => !m.id)

      // Update existing members
      for (const member of existingMembers) {
        if (member.id) {
          await dataService.updateTeamMember(member.id, {
            designation: member.designation,
            city: member.city,
            mobile: member.mobile
          })
        }
      }

      // Create new members
      for (const member of newMembers) {
        await dataService.createTeamMember({
          firstName: member.firstName,
          lastName: member.lastName,
          designation: member.designation,
          city: member.city,
          email: member.email,
          mobile: member.mobile
        })
      }

      fetchTeamMembers()
    } catch (error) {
      console.error("Failed to save team members:", error)
    } finally {
      setIsSubmitting(false)
    }
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                  <Users className="h-8 w-8 mr-3" />
                  Team Members
                </h1>
                <p className="text-slate-600 mt-1">Manage your legal team members</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            {isLoading ? (
              <div className="text-center py-8">Loading team members...</div>
            ) : (
              teamMembers.map((member, index) => (
                <div
                  key={member.id || index}
                  className="relative grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 pb-8 border-b border-slate-200 last:border-0 pt-6"
                >
                  {/* Member Number Badge */}
                  <div className="absolute top-0 left-0 bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-full">
                    {member.id ? `Member #${member.id}` : `New Member ${index + 1}`}
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Personal Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                      <Input
                        value={member.firstName}
                        onChange={(e) => updateMember(index, "firstName", e.target.value)}
                        className="focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter first name"
                        disabled={!!member.id}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                      <Input
                        value={member.lastName}
                        onChange={(e) => updateMember(index, "lastName", e.target.value)}
                        className="focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter last name"
                        disabled={!!member.id}
                      />
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Professional Details</h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                      <Input
                        value={member.designation}
                        onChange={(e) => updateMember(index, "designation", e.target.value)}
                        className="focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., Associate Lawyer, Paralegal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        City
                      </label>
                      <Input
                        value={member.city}
                        onChange={(e) => updateMember(index, "city", e.target.value)}
                        className="focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter city"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Contact Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        <Mail className="h-4 w-4 inline mr-1" />
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={member.email}
                        onChange={(e) => updateMember(index, "email", e.target.value)}
                        className="focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter email address"
                        disabled={!!member.id}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        <Phone className="h-4 w-4 inline mr-1" />
                        Mobile Number
                      </label>
                      <Input
                        type="tel"
                        value={member.mobile}
                        onChange={(e) => updateMember(index, "mobile", e.target.value)}
                        className="focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter mobile number"
                      />
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-0 right-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-transparent z-10"
                    onClick={() => removeMember(index, member.id)}
                  >
                    {member.id ? (
                      <Trash2 className="h-4 w-4 mr-1" />
                    ) : (
                      <Minus className="h-4 w-4 mr-1" />
                    )}
                    {member.id ? "Delete" : "Remove"}
                  </Button>
                </div>
              ))
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-200">
              <div className="flex gap-4">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Save Team Members
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                  Cancel
                </Button>
              </div>

              <Button type="button" onClick={addMember} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Member
              </Button>
            </div>

            {/* Team Summary */}
            {teamMembers.length > 0 && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-indigo-700">
                  <strong>Team Summary:</strong> You have {teamMembers.length} team member(s) in your legal practice.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}