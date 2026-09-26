import { z } from "zod";

// ---------- MoM + Task extraction schema ----------

export const extractedTaskSchema = z.object({
  description: z.string().min(1),
  owner: z.string().nullable(),
  due_date: z.string().nullable(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.literal("pending"),
});

export const analysisResultSchema = z.object({
  executive_summary: z.string().min(1),
  key_decisions: z.array(z.string()),
  discussion_highlights: z.array(z.string()),
  risks_and_concerns: z.array(z.string()),
  next_steps: z.array(z.string()),
  tasks: z.array(extractedTaskSchema),
  resolved_task_ids: z.array(z.string()).optional(),
});

// ---------- API request schemas ----------

export const analyzeRequestSchema = z.object({
  transcript: z.string().min(10, "Transcript must be at least 10 characters"),
  project_id: z.string().uuid("Invalid project ID"),
  meeting_title: z.string().optional(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
});

export const updateTaskSchema = z.object({
  description: z.string().min(1).optional(),
  owner: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["pending", "completed", "overdue"]).optional(),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
export type CreateProject = z.infer<typeof createProjectSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
