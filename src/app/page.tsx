import { ScholarshipProvider } from "../context/ScholarshipContext";
import { ScholarshipApp } from "../components/ScholarshipApp";

export default function Home() {
  return (
    <ScholarshipProvider>
      <ScholarshipApp />
    </ScholarshipProvider>
  );
}
