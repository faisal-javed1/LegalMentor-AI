"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Users, Search } from "lucide-react"
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
import ProtectedRoute from "@/components/protected-route"
import { dataService, type AppointmentDashboard, type ClientDashboard } from "@/lib/data-service"
import { validateForm, type ValidationErrors } from "@/lib/validation"
import { useToast } from "@/components/ui/use-toast"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const [appointments, setAppointments] = useState<AppointmentDashboard[]>([])
  const [clients, setClients] = useState<ClientDashboard[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    type: "meeting" as const,
    clientId: "0",
    location: "",
    attendees: "",
  })
  const [errors, setErrors] = useState<ValidationErrors>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [appointmentsData, clientsData] = await Promise.all([
        dataService.getAppointments(),
        dataService.getClients(),
      ])
      setAppointments(appointmentsData)
      setClients(clientsData)
    } catch (error) {
      console.error("Error loading calendar data:", error)
      toast({
        title: "Error",
        description: "Failed to load calendar data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const validationRules = {
      title: { required: true, minLength: 3 },
      startDate: { required: true },
      endDate: { required: true },
      location: { required: true },
    };
  
    const validationErrors = validateForm(formData, validationRules);
  
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    try {
      const newAppointment = await dataService.createAppointment({
        title: formData.title,
        description: formData.description,
        start_date: formData.startDate,
        end_date: formData.endDate,
        type: formData.type,
        client_id: formData.clientId === "0" ? undefined : Number(formData.clientId),
        location: formData.location,
        attendees: formData.attendees
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean)
          .map(name => ({ name }))
      });
  
      setAppointments([...appointments, newAppointment]);
      setShowCreateDialog(false);
      resetForm();
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      type: "meeting",
      clientId: "0",
      location: "",
      attendees: "",
    });
    setErrors({});
  }

  const handleDeleteAppointment = async (appointmentId: number) => {
    try {
      await dataService.deleteAppointment(appointmentId)
      setAppointments(appointments.filter(a => a.appointment_id !== appointmentId))
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting appointment:", error)
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      });
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.start_date)
      return aptDate.toDateString() === date.toDateString()
    })
  }

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || apt.type === filterType
    return matchesSearch && matchesFilter
  })

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
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

  return (
    <ProtectedRoute allowedRoles={["lawyer"]}>
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                  <CalendarIcon className="h-8 w-8 mr-3 text-indigo-600" />
                  Calendar
                </h1>
                <p className="text-slate-600 mt-1">Manage your appointments and schedule</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setView("month")}
                    className={view === "month" ? "bg-indigo-50 text-indigo-600" : ""}
                  >
                    Month
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setView("week")}
                    className={view === "week" ? "bg-indigo-50 text-indigo-600" : ""}
                  >
                    Week
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setView("day")}
                    className={view === "day" ? "bg-indigo-50 text-indigo-600" : ""}
                  >
                    Day
                  </Button>
                </div>

                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="h-4 w-4 mr-2" />
                      New Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Create New Appointment</DialogTitle>
                      <DialogDescription>Schedule a new appointment or meeting.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateAppointment} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange("title", e.target.value)}
                          placeholder="Meeting title"
                          className={errors.title ? "border-red-500" : ""}
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          placeholder="Meeting description"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="startDate">Start Date & Time *</Label>
                          <Input
                            id="startDate"
                            type="datetime-local"
                            value={formData.startDate}
                            onChange={(e) => handleInputChange("startDate", e.target.value)}
                            className={errors.startDate ? "border-red-500" : ""}
                          />
                          {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                        </div>
                        <div>
                          <Label htmlFor="endDate">End Date & Time *</Label>
                          <Input
                            id="endDate"
                            type="datetime-local"
                            value={formData.endDate}
                            onChange={(e) => handleInputChange("endDate", e.target.value)}
                            className={errors.endDate ? "border-red-500" : ""}
                          />
                          {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="type">Type</Label>
                          <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="meeting">Meeting</SelectItem>
                              <SelectItem value="court">Court Hearing</SelectItem>
                              <SelectItem value="call">Phone Call</SelectItem>
                              <SelectItem value="consultation">Consultation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="clientId">Client</Label>
                          <Select
                            value={formData.clientId}
                            onValueChange={(value) => handleInputChange("clientId", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select client" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">None</SelectItem>
                              {clients.map((client) => (
                                <SelectItem key={client.client_id} value={client.client_id.toString()}>
                                  {client.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          placeholder="Meeting location"
                          className={errors.location ? "border-red-500" : ""}
                        />
                        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                      </div>

                      <div>
                        <Label htmlFor="attendees">Attendees</Label>
                        <Input
                          id="attendees"
                          value={formData.attendees}
                          onChange={(e) => handleInputChange("attendees", e.target.value)}
                          placeholder="Comma-separated list of attendees"
                        />
                      </div>

                      <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => {
                          setShowCreateDialog(false);
                          resetForm();
                        }}>
                          Cancel
                        </Button>
                        <Button type="submit">Create Appointment</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="court">Court Hearings</SelectItem>
                <SelectItem value="call">Phone Calls</SelectItem>
                <SelectItem value="consultation">Consultations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Calendar View */}
          {view === "month" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800">
                  {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-0">
                {/* Day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-4 text-center font-medium text-slate-500 border-b border-slate-200">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {getDaysInMonth(currentDate).map((date, index) => (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border-b border-r border-slate-200 ${
                      date ? "hover:bg-slate-50" : "bg-slate-50"
                    }`}
                  >
                    {date && (
                      <>
                        <div
                          className={`text-sm font-medium mb-2 ${
                            date.toDateString() === new Date().toDateString() ? "text-indigo-600" : "text-slate-800"
                          }`}
                        >
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {getAppointmentsForDate(date)
                            .slice(0, 2)
                            .map((apt) => (
                              <div
                                key={apt.appointment_id}
                                className={`text-xs p-1 rounded truncate cursor-pointer ${
                                  apt.type === "court"
                                    ? "bg-red-100 text-red-800"
                                    : apt.type === "meeting"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-green-100 text-green-800"
                                }`}
                                title={apt.title}
                              >
                                {formatTime(apt.start_date)} {apt.title}
                              </div>
                            ))}
                          {getAppointmentsForDate(date).length > 2 && (
                            <div className="text-xs text-slate-500">
                              +{getAppointmentsForDate(date).length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Appointments List */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800">Upcoming Appointments</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <div key={appointment.appointment_id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-800">{appointment.title}</h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              appointment.type === "court"
                                ? "bg-red-100 text-red-800"
                                : appointment.type === "meeting"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {appointment.type}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              appointment.status === "scheduled"
                                ? "bg-yellow-100 text-yellow-800"
                                : appointment.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </div>

                        {appointment.description && <p className="text-slate-600 mb-3">{appointment.description}</p>}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatTime(appointment.start_date)} - {formatTime(appointment.end_date || appointment.start_date)}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {appointment.location}
                          </div>
                          {appointment.attendees_count > 0 && (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {appointment.attendees_count} attendee(s)
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteAppointment(appointment.appointment_id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <CalendarIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-800 mb-2">No appointments found</h3>
                  <p className="text-slate-500 mb-4">
                    {searchTerm || filterType !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "Schedule your first appointment to get started."}
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Appointment
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}