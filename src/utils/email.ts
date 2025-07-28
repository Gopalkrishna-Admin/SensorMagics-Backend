import { Attachment, Resend } from "resend";
import logger from "./logger";

export const emailTemplatesFolder = `${process.cwd()}/src/controllers/templates/emailTemplates`;

export type SendEmailDto = {
  from: string;
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
};

export const sendEmail = async (sendEmailDto: SendEmailDto) => {
  const { from, to, subject, html, attachments } = sendEmailDto;
  logger.info(`Sending Email from ${from} to ${to}`);
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const res = await resend.emails.send({
      to,
      from,
      subject,
      html,
      attachments
    });
    return res;
  } catch (err) {
    logger.error(err);
    return err;
  }
};
