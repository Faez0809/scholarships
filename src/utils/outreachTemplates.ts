import { OutreachContact, SenderDetails } from "../context/OutreachContext";
import { UserProfile } from "../types/scholarship";

export type TemplateKind = "initial" | "follow_up" | "thank_you";

export const TEMPLATE_LABELS: Record<TemplateKind, string> = {
  initial: "First email",
  follow_up: "Follow-up",
  thank_you: "Thank you after a reply",
};

function lastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : fullName.trim();
}

function degreePhrase(profile: UserProfile): string {
  if (profile.targetDegree === "PhD") return "a PhD";
  if (profile.targetDegree === "Master's") return "a research Master's";
  return "graduate study (Master's or PhD)";
}

function or(value: string, placeholder: string): string {
  return value.trim() ? value.trim() : placeholder;
}

export interface DraftEmail {
  subject: string;
  body: string;
}

export function buildEmail(
  kind: TemplateKind,
  contact: OutreachContact,
  sender: SenderDetails,
  profile: UserProfile
): DraftEmail {
  const greeting = `Dear Professor ${lastName(contact.name) || "[Last name]"},`;
  const myName = or(sender.fullName, "[Your full name]");
  const role = or(sender.currentRole, "[your current degree, year and university]");
  const interest = or(sender.researchInterest || contact.researchTopic, "[your research interest]");
  const topic = or(contact.researchTopic, interest);
  const paper = contact.paperTitle.trim();
  const highlights = sender.highlights.trim();
  const scores = `My CGPA is ${profile.cgpa.toFixed(2)}/4.00 and my IELTS score is ${profile.ielts.toFixed(1)}.`;

  if (kind === "follow_up") {
    return {
      subject: `Following up: prospective ${profile.targetDegree === "Master's" ? "Master's" : "PhD"} student interested in ${topic}`,
      body: [
        greeting,
        "",
        `I hope you are well. I am following up on my email from ${contact.lastContactedOn || "[date of first email]"} about joining your group for ${degreePhrase(profile)} in ${topic}.`,
        "",
        "I understand you receive many messages, so I will keep this short. I remain very interested in your work and would be grateful to know whether you expect to take on new students for the coming intake. I have attached my CV again for convenience.",
        "",
        "Thank you for your time.",
        "",
        "Kind regards,",
        myName,
      ].join("\n"),
    };
  }

  if (kind === "thank_you") {
    return {
      subject: `Thank you – ${myName}`,
      body: [
        greeting,
        "",
        "Thank you very much for your reply and for taking the time to consider my application.",
        "",
        "[Respond to their points here: confirm a meeting time, answer their questions, or send the documents they asked for.]",
        "",
        "I look forward to hearing from you.",
        "",
        "Kind regards,",
        myName,
      ].join("\n"),
    };
  }

  const paperLine = paper
    ? `I recently read your paper "${paper}", and it closely matches the questions I want to work on.`
    : `I have been following your group's recent work on ${topic}, and it closely matches the questions I want to work on.`;

  return {
    subject: `Prospective ${profile.targetDegree === "Master's" ? "Master's" : "PhD"} student interested in ${topic}`,
    body: [
      greeting,
      "",
      `My name is ${myName}, and I am ${role}. I am writing to ask whether you will be accepting students for ${degreePhrase(profile)} in your group at ${contact.institution}.`,
      "",
      paperLine,
      "",
      `My main interest is ${interest}.${highlights ? ` ${highlights}` : ""} ${scores}`,
      "",
      "I have attached my CV and transcript. If you think I could be a good fit, I would be glad to send a short research proposal or arrange a brief call at your convenience.",
      "",
      "Thank you for your time and consideration.",
      "",
      "Kind regards,",
      myName,
    ].join("\n"),
  };
}
