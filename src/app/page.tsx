import { ScholarshipProvider } from "../context/ScholarshipContext";
import { ScholarshipApp } from "../components/ScholarshipApp";
import { OutreachProvider } from "../context/OutreachContext";

export default function Home() {
  return (
    <ScholarshipProvider>
      <OutreachProvider>
        <ScholarshipApp />
      </OutreachProvider>
    </ScholarshipProvider>
  );
}
