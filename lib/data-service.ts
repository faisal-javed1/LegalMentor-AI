const API_BASE_URL = "http://localhost:8000"

// Helper to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken")
}

// Helper for authenticated fetch requests
const authenticatedFetch = async (url: string, options?: RequestInit) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  // Add other headers if provided
  if (options?.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });
  }

  // Don't set Content-Type for FormData (let browser set it with boundary)
  if (!options?.body || !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { 
          detail: `Request failed with status ${response.status}`,
          status: response.status
        };
      }

      // Handle 422 validation errors specifically
      if (response.status === 422) {
        const validationError = new Error("Validation failed");
        Object.assign(validationError, {
          status: response.status,
          errors: errorData.detail || errorData.errors || errorData
        });
        throw validationError;
      }

      const error = new Error(errorData.detail || errorData.message || 'Request failed');
      Object.assign(error, {
        status: response.status,
        data: errorData
      });
      throw error;
    }

    // For DELETE requests with 204 No Content, return null instead of trying to parse JSON
    if (response.status === 204) {
      return null;
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('An unknown error occurred');
  }
};
// --- TypeScript Interfaces for Frontend ---
export interface ChatMessage {
  id: string
  text: string
  sender: "user" | "mentor"
  timestamp: string // ISO string
  editable: boolean
  status?: "sent" | "delivered" | "read"
  isImportant?: boolean
  caseReference?: string
}

export interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: string // ISO string
  messages?: ChatMessage[] // Optional, loaded separately
  isPinned?: boolean
  isArchived?: boolean
  category?: "general" | "case" | "consultation" | "document"
}

// Update your data-service.ts with these interfaces if needed
export interface DashboardStats {
  activeCases: number
  totalClients: number
  upcomingAppointments: number
  totalRevenue: number
  outstandingRevenue: number
  recentActivities: Array<{
    id: number
    type: string
    action: string
    info: string
    time: string
  }>
}

export interface ClientDashboard {
  client_id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  totalBilled: number;
  cases_count: number;
  cases: any[];
  dateAdded?: string;
}

export interface CaseBillingInfo {
  totalAmount: number
  hourlyRate: number
  totalHours: number
}

export interface CaseDashboard {
  case_id: number
  title: string
  case_number?: string | null  // Make optional
  priority: string
  client: ClientDashboard
  court: string
  updated_at: string
  nextHearing?: string | null
  status: string
  billingInfo: CaseBillingInfo
}

export interface AppointmentDashboard {
  appointment_id: number
  title: string
  type: string
  start_date: string
  end_date?: string
  description?: string
  location: string
  attendees_count: number
  status: string
  attendees: string[]
  client_id?: number
  case_id?: number
}

export interface CaseCreatePayload {
  client_id?: number
  court: string
  caseNumber?: string
  year: number
  dateOfFiling?: string // YYYY-MM-DD
  courtHall?: string
  floorNo?: string
  classification?: string
  title: string
  description?: string
  beforeJudge?: string
  referredBy?: string
  sectionCategory?: string
  priority?: string
  underActs?: string
  underSections?: string
  firPoliceStation?: string
  firNumber?: string
  firYear?: number
  isAffidavitFiled?: "yes" | "no" | "notapplicable"
}

export interface CaseDetails {
  case_id: number
  title: string
  case_number?: string
  priority: string
  client: ClientDashboard
  court: string
  updated_at: string
  nextHearing?: string
  status: string
  billingInfo: CaseBillingInfo
  description?: string
  created_at: string
  assignedLawyers: string[]
  before_judge?: string
  referred_by?: string
  section_category?: string
  under_acts?: string
  under_sections?: string
  fir_police_station?: string
  fir_number?: string
  fir_year?: number
  is_affidavit_filed: string
  court_hall?: string
  floor_no?: string
  classification?: string
  year: number
  date_of_filing?: string
}
export interface TeamMemberResponse {
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
export type CaseActivityType = "hearing" | "filing" | "meeting" | "deadline"

export interface CaseActivityCreatePayload {
  case_id: number
  type: CaseActivityType
  title: string
  description?: string
  activity_date: string // ISO string
  location?: string
  notes?: string
}
export interface Document {
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

export interface DocumentUploadPayload {
  file: File
  title: string
  description?: string
  case_id?: number
  appointment_id?: number
  client_id?: number
}
// Add these interfaces to your existing types in data-service.ts
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}
export interface ClientDashboard {
  client_id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  totalBilled: number;
  cases_count: number;
  cases: any[];
  dateAdded?: string;
}
export interface CaseActivityDetails {
  activity_id: number
  case_id: number
  lawyer_id: number
  type: CaseActivityType
  title: string
  description?: string
  activity_date: string // ISO string
  location?: string
  notes?: string
  created_at: string // ISO string
  updated_at: string // ISO string
  case_title: string
  case_number?: string
  case_status: string
}
export interface Task {
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

export interface TaskCreatePayload {
  description: string
  start_date: string
  end_date: string
  is_private?: boolean
  case_id?: number
  team_member_ids?: number[]
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface Invoice {
  invoice_id: number
  client_id: number
  case_id?: number
  amount: number
  status: "draft" | "sent" | "paid" | "overdue"
  due_date: string
  created_at: string
  items: InvoiceItem[]
  client_name?: string
  case_title?: string
}

export interface InvoiceCreatePayload {
  clientId: string
  caseId?: string
  dueDate: string
  items: InvoiceItem[]
  amount: number
}
// --- Data Service Functions ---
export const dataService = {
  // Chat Operations
  getChatSessions: async (): Promise<ChatSession[]> => {
    const sessions = await authenticatedFetch(`${API_BASE_URL}/api/chat/sessions`)
    return sessions.map((s: any) => ({
      id: s.id.toString(),
      title: s.title,
      lastMessage: s.lastMessage,
      timestamp: s.updated_at,
      isPinned: s.is_pinned,
      isArchived: s.is_archived,
      category: s.category,
    }))
  },

  getChatHistory: async (sessionId: string): Promise<ChatMessage[]> => {
    const messages = await authenticatedFetch(`${API_BASE_URL}/api/chat/history/${sessionId}`)
    return messages.map((m: any) => ({
      id: m.id.toString(),
      text: m.text,
      sender: m.sender_type,
      timestamp: m.timestamp,
      editable: m.editable,
      status: m.status,
      isImportant: m.is_important,
      caseReference: m.case_reference,
    }))
  },

  createChatSession: async (title: string, category: ChatSession["category"] = "general"): Promise<ChatSession> => {
    const newSession = await authenticatedFetch(`${API_BASE_URL}/api/chat/sessions`, {
      method: "POST",
      body: JSON.stringify({ title, category }),
    })
    return {
      id: newSession.id.toString(),
      title: newSession.title,
      lastMessage: "No messages yet", // Initial state
      timestamp: newSession.created_at,
      isPinned: newSession.is_pinned,
      isArchived: newSession.is_archived,
      category: newSession.category,
    }
  },

  updateChatSession: async (
    sessionId: string,
    updates: { title?: string; isPinned?: boolean; isArchived?: boolean; category?: ChatSession["category"] },
  ): Promise<ChatSession> => {
    const updatedSession = await authenticatedFetch(`${API_BASE_URL}/api/chat/sessions/${sessionId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
    return {
      id: updatedSession.id.toString(),
      title: updatedSession.title,
      lastMessage: updatedSession.lastMessage || "No messages yet",
      timestamp: updatedSession.updated_at,
      isPinned: updatedSession.is_pinned,
      isArchived: updatedSession.is_archived,
      category: updatedSession.category,
    }
  },

  deleteChatSession: async (sessionId: string): Promise<void> => {
    const result = await authenticatedFetch(`${API_BASE_URL}/api/chat/sessions/${sessionId}`, {
      method: "DELETE",
    })
    // The endpoint returns 204 No Content, so result will be null
    // We don't need to do anything with the result
  },

  sendMessage: async (sessionId: string, question: string): Promise<ChatMessage> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/chat/send`, {
      method: "POST",
      body: JSON.stringify({ session_id: Number.parseInt(sessionId), query_text: question }),
    })
    return {
      id: response.id.toString(),
      text: response.text,
      sender: response.sender_type,
      timestamp: response.timestamp,
      editable: response.editable,
      status: response.status,
      isImportant: response.is_important,
      caseReference: response.case_reference,
    }
  },

  updateChatMessage: async (
    messageId: string,
    updates: { isImportant?: boolean; status?: string },
  ): Promise<ChatMessage> => {
    const params = new URLSearchParams()
    if (updates.isImportant !== undefined) {
      params.append("is_important", updates.isImportant.toString())
    }
    if (updates.status !== undefined) {
      params.append("status", updates.status)
    }

    const response = await authenticatedFetch(`${API_BASE_URL}/api/chat/messages/${messageId}?${params.toString()}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    })
    return {
      id: response.id.toString(),
      text: response.text,
      sender: response.sender_type,
      timestamp: response.timestamp,
      editable: response.editable,
      status: response.status,
      isImportant: response.is_important,
      caseReference: response.case_reference,
    }
  },

  // Dashboard Operations
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const stats = await authenticatedFetch(`${API_BASE_URL}/api/dashboard/`)
      return {
        activeCases: stats.activeCases || 0,
        totalClients: stats.totalClients || 0,
        upcomingAppointments: stats.upcomingAppointments || 0,
        totalRevenue: stats.totalRevenue || 0,
        outstandingRevenue: stats.outstandingRevenue || 0,
        recentActivities: stats.recentActivities || []
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      // Return fallback data
      return {
        activeCases: 0,
        totalClients: 0,
        upcomingAppointments: 0,
        totalRevenue: 0,
        outstandingRevenue: 0,
        recentActivities: []
      }
    }
  },

  getCasesForDashboard: async (): Promise<CaseDashboard[]> => {
    try {
      const cases = await authenticatedFetch(`${API_BASE_URL}/api/dashboard/cases`)
      return Array.isArray(cases) ? cases : []
    } catch (error) {
      console.error("Error fetching cases for dashboard:", error)
      return []
    }
  },

  getUpcomingAppointments: async (): Promise<AppointmentDashboard[]> => {
    try {
      const appointments = await authenticatedFetch(`${API_BASE_URL}/api/dashboard/appointments`)
      return Array.isArray(appointments) ? appointments : []
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error)
      return []
    }
  },

  getClients: async (): Promise<ClientDashboard[]> => {
    const clients = await authenticatedFetch(`${API_BASE_URL}/api/dashboard/clients`) as ClientDashboard[];
    return clients.map((client: ClientDashboard) => ({
      ...client,
      cases: client.cases || [], // Ensure cases array exists
      cases_count: client.cases?.length || 0 // Add cases_count if needed
    }));
  },
  // Case Operations
  createCase: async (caseData: CaseCreatePayload): Promise<CaseDetails> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/cases/`, {
      method: "POST",
      body: JSON.stringify(caseData),
    })
    return response
  },

  getCaseDetails: async (caseId: string): Promise<CaseDetails> => {
    return authenticatedFetch(`${API_BASE_URL}/api/cases/${caseId}`)
  },

  updateCase: async (caseId: string, caseData: Partial<CaseDetails>): Promise<CaseDetails> => {
    return authenticatedFetch(`${API_BASE_URL}/api/cases/${caseId}`, {
      method: "PUT",
      body: JSON.stringify(caseData),
    })
  },

  getAllCases: async (): Promise<CaseDashboard[]> => {
    const cases = await authenticatedFetch(`${API_BASE_URL}/api/dashboard/cases?limit=100`)
    return cases
  },
// Case Diary Operations
createCaseActivity: async (activityData: CaseActivityCreatePayload): Promise<CaseActivityDetails> => {
  // Ensure activity_date is in the correct format for the backend
  const formattedData = { ...activityData }
  if (formattedData.activity_date) {
    const date = new Date(formattedData.activity_date)
    // Format as YYYY-MM-DDTHH:mm:ss.sssZ for backend compatibility
    formattedData.activity_date = date.toISOString().slice(0, 19) + 'Z'
  }
  
  const response = await authenticatedFetch(`${API_BASE_URL}/api/case-diary/`, {
    method: "POST",
    body: JSON.stringify(formattedData),
  })
  return response
},

getCaseActivityDetails: async (activityId: string): Promise<CaseActivityDetails> => {
  return authenticatedFetch(`${API_BASE_URL}/api/case-diary/${activityId}`)
},

getAllCaseActivities: async (filters?: {
  case_id?: number
  activity_type?: CaseActivityType
  date_range?: "today" | "week" | "month" | "quarter" | "all"
  search_term?: string
}): Promise<CaseActivityDetails[]> => {
  const params = new URLSearchParams()
  if (filters?.case_id) params.append("case_id", filters.case_id.toString())
  if (filters?.activity_type) params.append("activity_type", filters.activity_type)
  if (filters?.date_range) params.append("date_range", filters.date_range)
  if (filters?.search_term) params.append("search_term", filters.search_term)

  const activities = await authenticatedFetch(`${API_BASE_URL}/api/case-diary/?${params.toString()}`)
  return activities.map((a: any) => ({
    activity_id: a.activity_id,
    case_id: a.case_id,
    lawyer_id: a.lawyer_id,
    type: a.type,
    title: a.title,
    description: a.description,
    activity_date: a.activity_date,
    location: a.location,
    notes: a.notes,
    created_at: a.created_at,
    updated_at: a.updated_at,
    case_title: a.case_title,
    case_number: a.case_number,
    case_status: a.case_status,
  }))
},

updateCaseActivity: async (
  activityId: string,
  updates: Partial<CaseActivityCreatePayload>,
): Promise<CaseActivityDetails> => {
  // Convert activity_date from ISO string to proper format for backend
  const formattedUpdates = { ...updates }
  if (formattedUpdates.activity_date) {
    // Ensure the date is in the correct format for the backend
    const date = new Date(formattedUpdates.activity_date)
    // Format as YYYY-MM-DDTHH:mm:ss.sssZ for backend compatibility
    formattedUpdates.activity_date = date.toISOString().slice(0, 19) + 'Z'
  }
  
  const response = await authenticatedFetch(`${API_BASE_URL}/api/case-diary/${activityId}`, {
    method: "PUT",
    body: JSON.stringify(formattedUpdates),
  })
  return response
},

deleteCaseActivity: async (activityId: string): Promise<void> => {
  await authenticatedFetch(`${API_BASE_URL}/api/case-diary/${activityId}`, {
    method: "DELETE",
  })
},
getAppointments: async (): Promise<AppointmentDashboard[]> => {
  return authenticatedFetch(`${API_BASE_URL}/api/calendar/appointments`)
},

createAppointment: async (appointmentData: {
  title: string
  description?: string
  start_date: string  // Changed from startDate
  end_date: string    // Changed from endDate
  type: "meeting" | "court" | "call" | "consultation"
  client_id?: number  // Changed from clientId and made optional
  location: string
  attendees?: Array<{ name: string }>  // Changed format
}): Promise<AppointmentDashboard> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/calendar/appointments`, {
    method: "POST",
    body: JSON.stringify({
      title: appointmentData.title,
      description: appointmentData.description,
      start_date: appointmentData.start_date,
      end_date: appointmentData.end_date,
      type: appointmentData.type,
      client_id: appointmentData.client_id ? Number(appointmentData.client_id) : undefined,
      location: appointmentData.location,
      attendees: appointmentData.attendees
    }),
  })
  return response
},

updateAppointment: async (
  appointmentId: number,
  updates: {
    title?: string
    description?: string
    startDate?: string
    endDate?: string
    type?: "meeting" | "court" | "call" | "consultation"
    clientId?: string
    location?: string
    status?: "scheduled" | "completed" | "canceled"
    attendees?: string[]
  }
): Promise<AppointmentDashboard> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/calendar/appointments/${appointmentId}`, {
    method: "PUT",
    body: JSON.stringify({
      ...updates,
      attendees: updates.attendees?.map(a => ({ name: a }))
    }),
  })
  return response
},

deleteAppointment: async (appointmentId: number): Promise<void> => {
  await authenticatedFetch(`${API_BASE_URL}/api/calendar/appointments/${appointmentId}`, {
    method: 'DELETE',
  });
},
getTeamMembers: async (): Promise<TeamMemberResponse[]> => {
  return authenticatedFetch(`${API_BASE_URL}/api/team-members`)
},

createTeamMember: async (memberData: {
  firstName: string
  lastName: string
  designation: string
  city: string
  email: string
  mobile: string
}): Promise<TeamMemberResponse> => {
  return authenticatedFetch(`${API_BASE_URL}/api/team-members`, {
    method: "POST",
    body: JSON.stringify({
      first_name: memberData.firstName,
      last_name: memberData.lastName,
      designation: memberData.designation,
      city: memberData.city,
      email: memberData.email,
      mobile: memberData.mobile
    }),
  })
},

updateTeamMember: async (
  memberId: number,
  updates: {
    designation?: string
    city?: string
    mobile?: string
  }
): Promise<TeamMemberResponse> => {
  return authenticatedFetch(`${API_BASE_URL}/api/team-members/${memberId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  })
},

deleteTeamMember: async (memberId: number): Promise<void> => {
  await authenticatedFetch(`${API_BASE_URL}/api/team-members/${memberId}`, {
    method: "DELETE",
  })
},
// Document Operations
getDocuments: async (params?: {
  case_id?: number
  appointment_id?: number
  search?: string
  skip?: number
  limit?: number
}): Promise<Document[]> => {
  const queryParams = new URLSearchParams()
  if (params?.case_id) queryParams.append('case_id', params.case_id.toString())
  if (params?.appointment_id) queryParams.append('appointment_id', params.appointment_id.toString())
  if (params?.search) queryParams.append('search', params.search)
  if (params?.skip) queryParams.append('skip', params.skip.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())

  return authenticatedFetch(`${API_BASE_URL}/api/documents?${queryParams.toString()}`)
},

uploadDocument: async (payload: DocumentUploadPayload): Promise<Document> => {
  const formData = new FormData()
  formData.append('file', payload.file)
  formData.append('title', payload.title)
  if (payload.description) formData.append('description', payload.description)
  if (payload.case_id) formData.append('case_id', payload.case_id.toString())
  if (payload.appointment_id) formData.append('appointment_id', payload.appointment_id.toString())
  if (payload.client_id) formData.append('client_id', payload.client_id.toString())

  return authenticatedFetch(`${API_BASE_URL}/api/documents`, {
    method: 'POST',
    body: formData,
    headers: {
      // Note: Don't set Content-Type header when using FormData
      // The browser will set it automatically with the correct boundary
    },
  })
},

deleteDocument: async (documentId: number): Promise<void> => {
  await authenticatedFetch(`${API_BASE_URL}/api/documents/${documentId}`, {
    method: 'DELETE',
  })
},

downloadDocument: async (documentId: number): Promise<Blob> => {
  const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/download`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "An unknown error occurred" }))
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
  }

  return response.blob()
},
// Add this to your dataService object in data-service.ts
getNotifications: async (userId?: string): Promise<Notification[]> => {
  return authenticatedFetch(`${API_BASE_URL}/api/notifications`);
},

  markNotificationAsRead: async (notificationId: string): Promise<void> => {
    return authenticatedFetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
      method: "PUT",
    })
  },

  markAllNotificationsAsRead: async (): Promise<void> => {
    return authenticatedFetch(`${API_BASE_URL}/api/notifications/read-all`, {
      method: "PUT",
    })
  },


getClientById: async (clientId: string): Promise<ClientDashboard> => {
  return authenticatedFetch(`${API_BASE_URL}/api/clients/${clientId}`);
},

createClient: async (clientData: {
  name: string
  email: string
  phone: string
  address: string
  company?: string
}): Promise<ClientDashboard> => {
  return authenticatedFetch(`${API_BASE_URL}/api/clients/`, {  // Note the trailing slash
    method: "POST",
    body: JSON.stringify({
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      address: clientData.address,
      company: clientData.company || null, // Send null instead of undefined
    }),
  })
},

updateClient: async (
  clientId: number,
  updates: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    company?: string;
  }
): Promise<ClientDashboard> => {
  return authenticatedFetch(`${API_BASE_URL}/api/clients/${clientId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
},

deleteClient: async (clientId: number): Promise<void> => {
  await authenticatedFetch(`${API_BASE_URL}/api/clients/${clientId}`, {
    method: "DELETE",
  });
},
  // Task Operations
  getTasks: async (params?: {
    status?: "pending" | "upcoming" | "completed"
    case_id?: number
    is_private?: boolean
    start_date?: string
    end_date?: string
    skip?: number
    limit?: number
  }): Promise<Task[]> => {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.case_id) queryParams.append('case_id', params.case_id.toString())
    if (params?.is_private !== undefined) queryParams.append('is_private', params.is_private.toString())
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)
    if (params?.skip) queryParams.append('skip', params.skip.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    return authenticatedFetch(`${API_BASE_URL}/api/tasks?${queryParams.toString()}`)
  },

  createTask: async (taskData: TaskCreatePayload): Promise<Task> => {
    return authenticatedFetch(`${API_BASE_URL}/api/tasks`, {
      method: "POST",
      body: JSON.stringify(taskData),
    })
  },

  updateTask: async (taskId: number, updates: Partial<TaskCreatePayload>): Promise<Task> => {
    return authenticatedFetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  },

  deleteTask: async (taskId: number): Promise<void> => {
    await authenticatedFetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: "DELETE",
    })
  },

  // Invoice Operations
  getInvoices: async (): Promise<Invoice[]> => {
    return authenticatedFetch(`${API_BASE_URL}/api/invoices`)
  },

  createInvoice: async (invoiceData: InvoiceCreatePayload): Promise<Invoice> => {
    return authenticatedFetch(`${API_BASE_URL}/api/invoices`, {
      method: "POST",
      body: JSON.stringify(invoiceData),
    })
  },

  updateInvoice: async (invoiceId: number, invoiceData: Partial<InvoiceCreatePayload>): Promise<Invoice> => {
    return authenticatedFetch(`${API_BASE_URL}/api/invoices/${invoiceId}`, {
      method: "PUT",
      body: JSON.stringify(invoiceData),
    })
  },

  deleteInvoice: async (invoiceId: number): Promise<void> => {
    await authenticatedFetch(`${API_BASE_URL}/api/invoices/${invoiceId}`, {
      method: "DELETE",
    })
  },

  // Case Operations (for billing page)
  getCases: async (): Promise<CaseDashboard[]> => {
    return authenticatedFetch(`${API_BASE_URL}/api/dashboard/cases?limit=100`)
  },

  // Settings Operations
  getUserProfile: async (): Promise<any> => {
    return authenticatedFetch(`${API_BASE_URL}/api/settings/profile`)
  },

  updateUserProfile: async (profileData: {
    name: string
    email: string
    phone?: string
    address?: string
    specialization?: string
    barNumber?: string
    yearsOfExperience?: number
  }): Promise<any> => {
    return authenticatedFetch(`${API_BASE_URL}/api/settings/profile`, {
      method: "PUT",
      body: JSON.stringify(profileData),
    })
  },

  changePassword: async (passwordData: {
    current_password: string
    new_password: string
    confirm_password: string
  }): Promise<any> => {
    return authenticatedFetch(`${API_BASE_URL}/api/settings/password`, {
      method: "PUT",
      body: JSON.stringify(passwordData),
    })
  },

  getUserPreferences: async (): Promise<any> => {
    return authenticatedFetch(`${API_BASE_URL}/api/settings/preferences`)
  },

  updateUserPreferences: async (preferences: {
    notification_settings?: {
      email_notifications?: boolean
      push_notifications?: boolean
      case_updates?: boolean
      appointment_reminders?: boolean
      invoice_alerts?: boolean
      team_updates?: boolean
    }
    appearance_settings?: {
      theme?: string
      language?: string
      timezone?: string
      date_format?: string
    }
  }): Promise<any> => {
    return authenticatedFetch(`${API_BASE_URL}/api/settings/preferences`, {
      method: "PUT",
      body: JSON.stringify(preferences),
    })
  },
};