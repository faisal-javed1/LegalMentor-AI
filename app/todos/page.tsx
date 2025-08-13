"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Calendar, Search, Users, X, CheckSquare, ArrowLeft, Check, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProtectedRoute from "@/components/protected-route"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { dataService } from "@/lib/data-service"
import { toast } from "sonner"

interface Task {
  task_id: number
  description: string
  start_date: string
  end_date: string
  is_private: boolean
  status: "pending" | "upcoming" | "completed"
  case_id?: number
  case_title?: string
  team_members: Array<{
    team_member_id: number
    user: {
      full_name: string
    }
  }>
}

export default function CreateTodos() {
  const { user } = useAuth()
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [showTeamSelect, setShowTeamSelect] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<number[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [cases, setCases] = useState<any[]>([])
  const [selectedCase, setSelectedCase] = useState<string>("none")
  const [activeTab, setActiveTab] = useState("all")
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [viewFilter, setViewFilter] = useState("my")
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)

  useEffect(() => {
    if (!user) return
    
    // Set default dates
    const now = new Date()
    const defaultStart = new Date(now.getTime() + 30 * 60000) // 30 minutes from now
    const defaultEnd = new Date(defaultStart.getTime() + 30 * 60000) // 1 hour from now
    
    setStartDate(formatDateTimeLocal(defaultStart))
    setEndDate(formatDateTimeLocal(defaultEnd))
    
    // Load team members and cases
    loadTeamMembers()
    loadCases()
    loadTasks()
  }, [user])

  const formatDateTimeLocal = (date: Date) => {
    const pad = (num: number) => num.toString().padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  const parseDateTimeLocal = (value: string) => {
    const [date, time] = value.split('T')
    const [year, month, day] = date.split('-').map(Number)
    const [hours, minutes] = time.split(':').map(Number)
    return new Date(year, month - 1, day, hours, minutes)
  }

  const loadTeamMembers = async () => {
    try {
      const members = await dataService.getTeamMembers()
      setTeamMembers(members || [])
    } catch (error) {
      console.error("Failed to load team members:", error)
      setTeamMembers([])
    }
  }

  const loadCases = async () => {
    try {
      const cases = await dataService.getAllCases()
      setCases(cases || [])
    } catch (error) {
      console.error("Failed to load cases:", error)
      setCases([])
    }
  }

  const loadTasks = async (status?: string) => {
    try {
      setLoading(true)
      const tasks = await dataService.getTasks({ status: status as any })
      setTasks(tasks || [])
    } catch (error) {
      console.error("Failed to load tasks:", error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const taskData = {
        description,
        start_date: parseDateTimeLocal(startDate).toISOString(),
        end_date: parseDateTimeLocal(endDate).toISOString(),
        is_private: isPrivate,
        case_id: selectedCase !== "none" ? parseInt(selectedCase) : undefined,
        team_member_ids: selectedTeamMembers
      }
      
      const newTask = await dataService.createTask(taskData)
      console.log("Task created:", newTask)
      
      toast.success("Task created successfully!")
      
      // Reset form
      setDescription("")
      const now = new Date()
      const defaultStart = new Date(now.getTime() + 30 * 60000)
      const defaultEnd = new Date(defaultStart.getTime() + 30 * 60000)
      setStartDate(formatDateTimeLocal(defaultStart))
      setEndDate(formatDateTimeLocal(defaultEnd))
      setIsPrivate(false)
      setSelectedCase("none")
      setSelectedTeamMembers([])
      
      // Refresh tasks
      loadTasks()
    } catch (error) {
      console.error("Failed to create task:", error)
      toast.error("Failed to create task", {
        description: error instanceof Error ? error.message : "Please try again."
      })
    }
  }

  const toggleTeamMemberSelection = (memberId: number) => {
    setSelectedTeamMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId) 
        : [...prev, memberId]
    )
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    loadTasks(tab === "all" ? undefined : tab)
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      await dataService.deleteTask(taskId)
      toast.success("Task deleted successfully!")
      setTaskToDelete(null)
      // Refresh tasks
      loadTasks()
    } catch (error) {
      console.error("Failed to delete task:", error)
      toast.error("Failed to delete task", {
        description: error instanceof Error ? error.message : "Please try again."
      })
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setDescription(task.description)
    setStartDate(formatDateTimeLocal(new Date(task.start_date)))
    setEndDate(formatDateTimeLocal(new Date(task.end_date)))
    setIsPrivate(task.is_private)
    setSelectedCase(task.case_id ? task.case_id.toString() : "none")
    setSelectedTeamMembers(task.team_members?.map(m => m.team_member_id) || [])
    setShowEditForm(true)
  }

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingTask) return
    
    try {
      const taskData = {
      description,
        start_date: parseDateTimeLocal(startDate).toISOString(),
        end_date: parseDateTimeLocal(endDate).toISOString(),
        is_private: isPrivate,
        case_id: selectedCase !== "none" ? parseInt(selectedCase) : undefined,
        team_member_ids: selectedTeamMembers
      }
      
      await dataService.updateTask(editingTask.task_id, taskData)
      toast.success("Task updated successfully!")
      
      // Reset form and close edit mode
      setShowEditForm(false)
      setEditingTask(null)
      setDescription("")
      const now = new Date()
      const defaultStart = new Date(now.getTime() + 30 * 60000)
      const defaultEnd = new Date(defaultStart.getTime() + 30 * 60000)
      setStartDate(formatDateTimeLocal(defaultStart))
      setEndDate(formatDateTimeLocal(defaultEnd))
      setIsPrivate(false)
      setSelectedCase("none")
      setSelectedTeamMembers([])
      
      // Refresh tasks
      loadTasks()
    } catch (error) {
      console.error("Failed to update task:", error)
      toast.error("Failed to update task", {
        description: error instanceof Error ? error.message : "Please try again."
      })
    }
  }

  const handleCancelEdit = () => {
    setShowEditForm(false)
    setEditingTask(null)
    setDescription("")
    const now = new Date()
    const defaultStart = new Date(now.getTime() + 30 * 60000)
    const defaultEnd = new Date(defaultStart.getTime() + 30 * 60000)
    setStartDate(formatDateTimeLocal(defaultStart))
    setEndDate(formatDateTimeLocal(defaultEnd))
    setIsPrivate(false)
    setSelectedCase("none")
    setSelectedTeamMembers([])
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "upcoming":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "completed":
        return <Check className="h-4 w-4 text-green-500" />
      default:
        return <CheckSquare className="h-4 w-4" />
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
            <h1 className="text-3xl font-bold text-slate-800 flex items-center">
              <CheckSquare className="h-8 w-8 mr-3 text-indigo-600" />
              Create To-dos
            </h1>
            <p className="text-slate-600 mt-1">Manage your tasks and deadlines efficiently</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-slate-800">
                {showEditForm ? "Edit Task" : "Create New Task"}
              </h2>
              {showEditForm && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  Cancel Edit
                </Button>
              )}
            </div>
            <form onSubmit={showEditForm ? handleUpdateTask : handleSubmit} className="space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Task Description</label>
                <div className="relative">
                  <textarea
                    placeholder="Click here to write to-do description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-700">Please select due date</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="relative">
                    <Input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="focus:ring-indigo-500 focus:border-indigo-500 pr-10"
                      required
                    />
                    <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-slate-400 pointer-events-none" />
                  </div>
                  <span className="text-slate-500 self-center">to</span>
                  <div className="relative">
                    <Input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="focus:ring-indigo-500 focus:border-indigo-500 pr-10"
                      required
                    />
                    <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Mark as private */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="private"
                  checked={isPrivate}
                  onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
                />
                <label htmlFor="private" className="text-sm text-slate-700">
                  Mark as private
                </label>
              </div>

              {/* Relate to */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Relate to</label>
                <Select value={selectedCase} onValueChange={setSelectedCase}>
                  <SelectTrigger className="focus:ring-indigo-500 focus:border-indigo-500">
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Please select</SelectItem>
                    {cases.map((caseItem) => (
                      <SelectItem key={caseItem.case_id} value={caseItem.case_id.toString()}>
                        {caseItem.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assign to */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assign to</label>
                <div className="relative">
                  <Button
                    type="button"
                    onClick={() => setShowTeamSelect(true)}
                    className="w-full justify-start bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {selectedTeamMembers.length > 0 
                      ? `You have selected ${selectedTeamMembers.length} Team Member(s)`
                      : "Select Team Members"}
                  </Button>

                  {showTeamSelect && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg">
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div className="text-sm text-slate-700">Select Team Members</div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowTeamSelect(false)}
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

                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {teamMembers && teamMembers
                            .filter(member => 
                              member.user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((member) => (
                              <label key={member.team_member_id} className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded">
                            <input
                              type="checkbox"
                                  checked={selectedTeamMembers.includes(member.team_member_id)}
                                  onChange={() => toggleTeamMemberSelection(member.team_member_id)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                                <span className="text-slate-700">{member.user.full_name}</span>
                          </label>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                {showEditForm ? "Update Task" : "Submit"}
              </Button>
            </form>
          </div>

          {/* Todos List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-slate-500 mt-2">Loading tasks...</p>
              </div>
            ) : (
            <div className="flex justify-between items-center mb-6">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="bg-slate-100">
                  <TabsTrigger value="all" className="data-[state=active]:bg-white">
                    All <span className="ml-2 bg-slate-200 px-2 py-0.5 rounded-full text-xs">{tasks?.length || 0}</span>
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="data-[state=active]:bg-white">
                    Pending <span className="ml-2 bg-slate-200 px-2 py-0.5 rounded-full text-xs">
                      {tasks?.filter(t => t.status === "pending").length || 0}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="upcoming" className="data-[state=active]:bg-white">
                    Upcoming <span className="ml-2 bg-slate-200 px-2 py-0.5 rounded-full text-xs">
                      {tasks?.filter(t => t.status === "upcoming").length || 0}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="data-[state=active]:bg-white">
                    Completed <span className="ml-2 bg-slate-200 px-2 py-0.5 rounded-full text-xs">
                      {tasks?.filter(t => t.status === "completed").length || 0}
                    </span>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6 flex justify-between items-center">
                  <Select value={viewFilter} onValueChange={setViewFilter}>
                    <SelectTrigger className="w-[200px] focus:ring-indigo-500 focus:border-indigo-500">
                      <SelectValue placeholder="Select view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="my">My to-dos</SelectItem>
                      <SelectItem value="all">All to-dos</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Input placeholder="Search..." className="focus:ring-indigo-500 focus:border-indigo-500" />
                    <Button className="bg-indigo-600 text-white hover:bg-indigo-700">Search</Button>
                  </div>
                </div>

                <TabsContent value="all" className="mt-4">
                  {tasks && tasks.length > 0 ? (
                    <div className="space-y-4">
                      {tasks.map((task) => (
                        <div key={task.task_id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              {getStatusIcon(task.status)}
                              <div>
                                <h3 className="font-medium">{task.description}</h3>
                                <p className="text-sm text-slate-500">
                                  {new Date(task.start_date).toLocaleString()} - {new Date(task.end_date).toLocaleString()}
                                </p>
                                {task.case_title && (
                                  <p className="text-sm text-indigo-600 mt-1">
                                    Case: {task.case_title}
                                  </p>
                                )}
                                {task.team_members && task.team_members.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {task.team_members.map((member) => (
                                      <span key={member.team_member_id} className="text-xs bg-slate-100 px-2 py-1 rounded-full">
                                        {member.user.full_name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditTask(task)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => setTaskToDelete(task.task_id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-center py-8">There are no to-dos.</div>
                  )}
                </TabsContent>
                <TabsContent value="pending" className="mt-4">
                  {tasks && tasks.filter(t => t.status === "pending").length > 0 ? (
                    <div className="space-y-4">
                      {tasks.filter(t => t.status === "pending").map((task) => (
                        <div key={task.task_id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              {getStatusIcon(task.status)}
                              <div>
                                <h3 className="font-medium">{task.description}</h3>
                                <p className="text-sm text-slate-500">
                                  {new Date(task.start_date).toLocaleString()} - {new Date(task.end_date).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditTask(task)}
                              >
                                Edit
                              </Button>
                              <Button variant="ghost" size="sm">
                                Mark Complete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                  <div className="text-slate-500 text-center py-8">There are no pending to-dos.</div>
                  )}
                </TabsContent>
                <TabsContent value="upcoming" className="mt-4">
                  {tasks && tasks.filter(t => t.status === "upcoming").length > 0 ? (
                    <div className="space-y-4">
                      {tasks.filter(t => t.status === "upcoming").map((task) => (
                        <div key={task.task_id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                                                      <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                {getStatusIcon(task.status)}
                                <div>
                                  <h3 className="font-medium">{task.description}</h3>
                                  <p className="text-sm text-slate-500">
                                    {new Date(task.start_date).toLocaleString()} - {new Date(task.end_date).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditTask(task)}
                                >
                                  Edit
                                </Button>
                              </div>
                            </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                  <div className="text-slate-500 text-center py-8">There are no upcoming to-dos.</div>
                  )}
                </TabsContent>
                <TabsContent value="completed" className="mt-4">
                  {tasks && tasks.filter(t => t.status === "completed").length > 0 ? (
                    <div className="space-y-4">
                      {tasks.filter(t => t.status === "completed").map((task) => (
                        <div key={task.task_id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                                                      <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                {getStatusIcon(task.status)}
                                <div>
                                  <h3 className="font-medium">{task.description}</h3>
                                  <p className="text-sm text-slate-500">
                                    Completed on {new Date(task.end_date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditTask(task)}
                                >
                                  Edit
                                </Button>
                              </div>
                            </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                  <div className="text-slate-500 text-center py-8">There are no completed to-dos.</div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {taskToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Confirm Delete</h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setTaskToDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteTask(taskToDelete)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}