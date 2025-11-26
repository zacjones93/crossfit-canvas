"use server";

import { createServerAction, ZSAError } from "zsa";
import { sendContactEmail } from "@/utils/email";
import { validateTurnstileToken } from "@/utils/validate-captcha";
import { contactFormSchema } from "@/schemas/contact.schema";
import { withRateLimit, RATE_LIMITS } from "@/utils/with-rate-limit";
import { isTurnstileEnabled } from "@/flags";
import { SITE_EMAIL } from "@/constants";

export const submitContactFormAction = createServerAction()
  .input(contactFormSchema)
  .handler(async ({ input }) => {
    return withRateLimit(
      async () => {
        // Validate Turnstile token
        if (await isTurnstileEnabled() && input.captchaToken) {
          const success = await validateTurnstileToken(input.captchaToken);

          if (!success) {
            throw new ZSAError(
              "INPUT_PARSE_ERROR",
              "Please complete the captcha verification"
            );
          }
        }

        try {
          // Send contact form email
          await sendContactEmail({
            name: input.name,
            email: input.email,
            phone: input.phone,
            message: input.message,
            recipientEmail: SITE_EMAIL,
          });

          return { success: true };
        } catch (error) {
          console.error("Contact form submission error:", error);

          if (error instanceof ZSAError) {
            throw error;
          }

          throw new ZSAError(
            "INTERNAL_SERVER_ERROR",
            "Failed to send message. Please try again later."
          );
        }
      },
      RATE_LIMITS.EMAIL
    );
  });
