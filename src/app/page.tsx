import { ScholarshipProvider } from "../context/ScholarshipContext";
import { ScholarshipApp } from "../components/ScholarshipApp";
import { OutreachProvider } from "../context/OutreachContext";
import { GuideProvider } from "../context/GuideContext";

export default function Home() {
  return (
    <ScholarshipProvider>
      <OutreachProvider>
        <GuideProvider>
          <ScholarshipApp />
        </GuideProvider>
      </OutreachProvider>
    </ScholarshipProvider>
  );
}
