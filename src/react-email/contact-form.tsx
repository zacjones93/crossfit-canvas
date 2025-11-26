import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { SITE_DOMAIN } from "@/constants";

interface ContactFormEmailProps {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export const ContactFormEmail = ({
  name = "John Doe",
  email = "john@example.com",
  phone,
  message = "This is a sample message from the contact form.",
}: ContactFormEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={preheader}>New Contact Form Submission</Heading>
          <Text style={paragraph}>
            You&apos;ve received a new message from the {SITE_DOMAIN} contact form:
          </Text>

          <Section style={infoSection}>
            <Text style={infoLabel}>Name:</Text>
            <Text style={infoValue}>{name}</Text>

            <Text style={infoLabel}>Email:</Text>
            <Text style={infoValue}>{email}</Text>

            {phone && (
              <>
                <Text style={infoLabel}>Phone:</Text>
                <Text style={infoValue}>{phone}</Text>
              </>
            )}

            <Text style={infoLabel}>Message:</Text>
            <Text style={messageValue}>{message}</Text>
          </Section>
        </Container>
        <Text style={footer}>
          This is an automated message from {SITE_DOMAIN} contact form.
        </Text>
      </Body>
    </Html>
  );
};

ContactFormEmail.PreviewProps = {
  name: "John Doe",
  email: "john@example.com",
  phone: "(208) 555-1234",
  message: "I'm interested in learning more about your CrossFit classes. Can you provide more information about beginner programs?",
} as ContactFormEmailProps;

export default ContactFormEmail;

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
  marginTop: "20px",
  marginBottom: "20px",
};

const infoLabel = {
  color: "#32325d",
  fontSize: "14px",
  fontWeight: "bold",
  marginBottom: "4px",
  marginTop: "12px",
};

const infoValue = {
  color: "#525f7f",
  fontSize: "16px",
  marginBottom: "0px",
  marginTop: "0px",
};

const messageValue = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  marginBottom: "0px",
  marginTop: "0px",
  whiteSpace: "pre-wrap" as const,
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  margin: "20px 0",
};
