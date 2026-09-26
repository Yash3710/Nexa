import type { Task } from "@/lib/types";

/**
 * Base prompt for MoM + task extraction from a meeting transcript.
 * Used in Phase 1 (single meeting, no cross-meeting context).
 */
export function buildAnalysisPrompt(transcript: string): string {
  return `You are analyzing a meeting transcript. Return ONLY valid JSON matching this schema:
{
  "executive_summary": string,
  "key_decisions": string[],
  "discussion_highlights": string[],
  "risks_and_concerns": string[],
  "next_steps": string[],
  "tasks": [
    { "description": string, "owner": string | null, "due_date": string | null,
      "priority": "low" | "medium" | "high", "status": "pending" }
  ]
}

Rules:
- executive_summary: 2-4 sentence overview of the meeting.
- key_decisions: concrete decisions made during the meeting.
- discussion_highlights: important topics discussed (not decisions).
- risks_and_concerns: any risks, blockers, or concerns raised.
- next_steps: action items discussed but not necessarily assigned.
- tasks: specific, assigned (or assignable) action items with owners when mentioned.
- For due_date, use ISO 8601 format (YYYY-MM-DD) if a date is mentioned, otherwise null.
- For owner, use the person's name as mentioned in the transcript, or null if unassigned.
- Infer priority from urgency language: "ASAP"/"urgent"/"critical" = high, "when you can"/"eventually" = low, otherwise medium.
- Return ONLY the JSON object. No markdown fences, no explanation.

Transcript:
<<<${transcript}>>>`;
}

/**
 * Extended prompt for Phase 2 — includes open tasks from previous meetings
 * so the LLM can detect resolved tasks and flag overdue ones.
 */
export function buildCrossMeetingAnalysisPrompt(
  transcript: string,
  openTasks: Task[],
  todayDate: string
): string {
  const tasksSummary = openTasks
    .map(
      (t, i) =>
        `  ${i + 1}. [ID: ${t.id}] "${t.description}" (owner: ${t.owner ?? "unassigned"}, due: ${t.due_date ?? "no date"}, priority: ${t.priority}, status: ${t.status})`
    )
    .join("\n");

  return `You are analyzing a meeting transcript with awareness of prior open tasks.

Today's date: ${todayDate}

OPEN TASKS FROM PREVIOUS MEETINGS:
${tasksSummary || "  (no open tasks)"}

Return ONLY valid JSON matching this schema:
{
  "executive_summary": string,
  "key_decisions": string[],
  "discussion_highlights": string[],
  "risks_and_concerns": string[],
  "next_steps": string[],
  "tasks": [
    { "description": string, "owner": string | null, "due_date": string | null,
      "priority": "low" | "medium" | "high", "status": "pending" }
  ],
  "resolved_task_ids": string[]
}

Additional rules for cross-meeting context:
- resolved_task_ids: IDs (from the list above) of tasks that the transcript indicates are DONE / completed / resolved. Only include a task ID if there is clear evidence in the transcript.
- If a task from the list above is past due (due_date < ${todayDate}) and NOT mentioned as resolved, note it in risks_and_concerns.
- New tasks discovered in this transcript should be in the "tasks" array.
- Do NOT duplicate existing open tasks in the "tasks" array.
- Return ONLY the JSON object. No markdown fences, no explanation.

Transcript:
<<<${transcript}>>>`;
}
