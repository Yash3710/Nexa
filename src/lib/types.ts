// ============================================================
// Nexa — Shared TypeScript types
// Mirrors the Supabase DB schema
// ============================================================

export type Priority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "completed" | "overdue";

// ---------- Database row types ----------

export interface Project {
  id: string;
  name: string;
  owner_id: string | null;
  created_at: string;
}

export interface Meeting {
  id: string;
  project_id: string;
  title: string;
  date: string;
  transcript: string | null;
  mom_json: MomJson | null;
  audio_url: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  meeting_id: string;
  project_id: string;
  description: string;
  owner: string | null;
  due_date: string | null;
  priority: Priority;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

// ---------- MoM JSON structure ----------

export interface MomJson {
  executive_summary: string;
  key_decisions: string[];
  discussion_highlights: string[];
  risks_and_concerns: string[];
  next_steps: string[];
}

export interface ExtractedTask {
  description: string;
  owner: string | null;
  due_date: string | null;
  priority: Priority;
  status: "pending";
}

export interface AnalysisResult {
  executive_summary: string;
  key_decisions: string[];
  discussion_highlights: string[];
  risks_and_concerns: string[];
  next_steps: string[];
  tasks: ExtractedTask[];
  resolved_task_ids?: string[];
}

// ---------- API request/response types ----------

export interface TranscribeResponse {
  transcript: string;
}

export interface AnalyzeRequest {
  transcript: string;
  project_id: string;
  meeting_title?: string;
}

export interface AnalyzeResponse {
  meeting_id: string;
  mom: MomJson;
  tasks: Task[];
}

export interface ProjectWithCounts extends Project {
  total_tasks: number;
  pending_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  meeting_count: number;
}
