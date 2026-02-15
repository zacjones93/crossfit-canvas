import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";
import { SITE_DOMAIN } from "@/constants";

interface FeedbackEntry {
  categories: Record<string, string[]>;
}

interface QuestionMeta {
  category: string;
  label: string;
}

interface CoachFeedbackSummaryEmailProps {
  coachName: string;
  questions: QuestionMeta[];
  feedbackEntries: FeedbackEntry[];
}

export const CoachFeedbackSummaryEmail = ({
  coachName = "Coach Name",
  questions = [],
  feedbackEntries = [],
}: CoachFeedbackSummaryEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={preheader}>
            Feedback Summary for {coachName}
          </Heading>
          <Text style={paragraph}>
            {feedbackEntries.length} anonymous peer review{feedbackEntries.length !== 1 ? "s" : ""} collected.
          </Text>

          {feedbackEntries.map((entry, idx) => (
            <React.Fragment key={idx}>
              <Hr style={divider} />
              <Section style={infoSection}>
                <Text style={reviewerName}>
                  Review #{idx + 1}
                </Text>

                {questions.map((q) => {
                  const items = entry.categories[q.category] ?? [];
                  if (items.length === 0) return null;
                  return (
                    <React.Fragment key={q.category}>
                      <Text style={infoLabel}>{q.label}:</Text>
                      {items.map((item, i) => (
                        <Text key={i} style={listItem}>
                          &bull; {item}
                        </Text>
                      ))}
                    </React.Fragment>
                  );
                })}
              </Section>
            </React.Fragment>
          ))}
        </Container>
        <Text style={footer}>
          This is an automated message from {SITE_DOMAIN}.
        </Text>
      </Body>
    </Html>
  );
};

CoachFeedbackSummaryEmail.PreviewProps = {
  coachName: "Jon Williams",
  questions: [
    { category: "liked", label: "Things You Liked" },
    { category: "improvement", label: "Areas for Improvement" },
  ],
  feedbackEntries: [
    {
      categories: {
        liked: ["Great energy", "Clear cues"],
        improvement: ["More scaling options"],
      },
    },
  ],
} as CoachFeedbackSummaryEmailProps;

export default CoachFeedbackSummaryEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  marginTop: "30px",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  borderRadius: "5px",
  boxShadow: "0 5px 10px rgba(20,50,70,.2)",
  marginTop: "20px",
  maxWidth: "600px",
  margin: "0 auto",
  padding: "40px",
};

const preheader = {
  color: "#525f7f",
  fontSize: "18px",
  textAlign: "center" as const,
  marginBottom: "30px",
};

const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
  marginBottom: "16px",
};

const infoSection = {
  backgroundColor: "#f8f9fa",
  borderRadius: "5px",
  padding: "20px",
  marginTop: "12px",
  marginBottom: "12px",
};

const infoLabel = {
  color: "#32325d",
  fontSize: "14px",
  fontWeight: "bold",
  marginBottom: "4px",
  marginTop: "12px",
};

const reviewerName = {
  color: "#32325d",
  fontSize: "16px",
  fontWeight: "bold",
  marginBottom: "8px",
  marginTop: "0px",
};

const listItem = {
  color: "#525f7f",
  fontSize: "14px",
  lineHeight: "20px",
  marginBottom: "2px",
  marginTop: "2px",
  paddingLeft: "8px",
};

const divider = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  margin: "20px 0",
};
