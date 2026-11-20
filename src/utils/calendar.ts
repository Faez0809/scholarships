import { Scholarship } from "../types/scholarship";

/** Builds an .ics calendar with an all-day deadline event and reminders 14 and 3 days before. */
export function buildDeadlineCalendar(items: Scholarship[]): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const esc = (t: string) => t.replace(/\\/g, "\\\\").replace(/[,;]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
  const events = items
    .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.deadline))
    .map((s) => {
      const start = s.deadline.replace(/-/g, "");
      const d = new Date(Number(s.deadline.slice(0, 4)), Number(s.deadline.slice(5, 7)) - 1, Number(s.deadline.slice(8, 10)) + 1);
      const end = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
      const note = s.deadlineIsEstimate ? " (expected date; confirm on the official site)" : "";
      return [
        "BEGIN:VEVENT",
        `UID:${s.id}-deadline@scholartrack`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${start}`,
        `DTEND;VALUE=DATE:${end}`,
        `SUMMARY:${esc(`Deadline: ${s.name}`)}`,
        `DESCRIPTION:${esc(`${s.university}${note}. Apply: ${s.officialWebsiteUrl}`)}`,
        `URL:${s.officialWebsiteUrl}`,
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        "TRIGGER:-P14D",
        `DESCRIPTION:${esc(`2 weeks left: ${s.name}`)}`,
        "END:VALARM",
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        "TRIGGER:-P3D",
        `DESCRIPTION:${esc(`3 days left: ${s.name}`)}`,
        "END:VALARM",
        "END:VEVENT",
      ].join("\r\n");
    });
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ScholarTrack//Deadlines//EN", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR"].join("\r\n");
}

export function downloadCalendar(items: Scholarship[], filename: string) {
  const blob = new Blob([buildDeadlineCalendar(items)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
