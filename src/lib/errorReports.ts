/** Shared by the report form, the public route and the admin list. */
export const REPORT_FIELDS = ["Deadline", "CGPA/IELTS", "Stipend/funding", "Eligible countries", "Link broken", "Other"] as const;
export type ReportField = (typeof REPORT_FIELDS)[number];

export const REPORT_MESSAGE_MAX = 1000;
export const REPORT_CONTACT_MAX = 200;

export type ReportStatus = "open" | "fixed" | "dismissed";

export interface ErrorReport {
  id: string;
  scholarship_id: string;
  field: ReportField;
  message: string;
  contact: string | null;
  status: ReportStatus;
  created_at: string;
}
