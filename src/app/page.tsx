import { ScholarshipProvider } from "../context/ScholarshipContext";
import { ScholarshipApp } from "../components/ScholarshipApp";
import { OutreachProvider } from "../context/OutreachContext";
import { GuideProvider } from "../context/GuideContext";
import { AccountProvider } from "../context/AccountContext";

export default function Home() {
  return (
    <ScholarshipProvider>
      <OutreachProvider>
        <GuideProvider>
          <AccountProvider>
            <ScholarshipApp />
          </AccountProvider>
        </GuideProvider>
      </OutreachProvider>
    </ScholarshipProvider>
  );
}
