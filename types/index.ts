export interface Accountant {
  id: number
  email: string
  name: string
}

export interface Client {
  id: number
  accountant_id: number
  email: string
  name: string
  created_at: string
}

export interface DocumentRequest {
  id: number
  accountant_id: number
  client_id: number
  title: string
  description?: string
  due_date: string
  status: 'pending' | 'received' | 'overdue' | 'cancelled'
  share_token: string
  created_at: string
  updated_at: string
}

export interface DocumentUpload {
  id: number
  request_id: number
  client_id: number
  file_name: string
  file_path: string
  file_size: number
  uploaded_at: string
}
