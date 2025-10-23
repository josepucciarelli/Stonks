import nodemailer from 'nodemailer';
import {WELCOME_EMAIL_TEMPLATE, NEWS_SUMMARY_EMAIL_TEMPLATE} from "@/lib/nodemailer/templates";

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL!,
        pass: process.env.NODEMAILER_PASSWORD!,
    }
})

// Derive sender and headers once with sensible fallbacks
const getSenderAddress = (): string => {
    const authUser = (transporter.options as any)?.auth?.user as string | undefined;
    const envFrom = process.env.EMAIL_FROM || process.env.NODEMAILER_EMAIL;
    const displayName = process.env.EMAIL_DISPLAY_NAME || 'Stonks';
    const emailAddress = envFrom || authUser || 'no-reply@localhost';
    return `${displayName} <${emailAddress}>`;
};

const getSupportAddress = (): string => {
    const support = process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || process.env.NODEMAILER_EMAIL;
    return support || 'no-reply@localhost';
};

const getListUnsubscribe = (): string | undefined => {
    const configured = process.env.LIST_UNSUBSCRIBE; // may be mailto: or https URL
    if (configured && configured.trim()) {
        const val = configured.trim();
        // Ensure angle brackets as per RFC
        return val.startsWith('<') ? val : `<${val}>`;
    }
    // Fallback to mailto unsubscribe at sender domain if possible
    const authUser = (transporter.options as any)?.auth?.user as string | undefined;
    const envFrom = process.env.EMAIL_FROM || process.env.NODEMAILER_EMAIL;
    const emailAddress = envFrom || authUser;
    if (emailAddress && emailAddress.includes('@')) {
        const domain = emailAddress.split('@')[1];
        return `<mailto:unsubscribe@${domain}>`;
    }
    return undefined;
};

const FROM = getSenderAddress();
const REPLY_TO = getSupportAddress();
const LIST_UNSUB = getListUnsubscribe();

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replace('{{name}}', name)
        .replace('{{intro}}', intro);

    const mailOptions: nodemailer.SendMailOptions = {
        from: FROM,
        to: email,
        subject: `Welcome to Stonks - your stock market toolkit is ready!`,
        text: 'Thanks for joining Stonks',
        html: htmlTemplate,
        replyTo: REPLY_TO,
        headers: LIST_UNSUB ? { 'List-Unsubscribe': LIST_UNSUB } : undefined,
    };

    await transporter.sendMail(mailOptions);
}

export const sendNewsSummaryEmail = async (
    { email, date, newsContent }: { email: string; date: string; newsContent: string }
): Promise<void> => {
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace('{{date}}', date)
        .replace('{{newsContent}}', newsContent);

    const newsDisplayName = process.env.EMAIL_NEWS_DISPLAY_NAME || 'Stonks News';

    const mailOptions: nodemailer.SendMailOptions = {
        from: `${newsDisplayName} <${(process.env.EMAIL_FROM || process.env.NODEMAILER_EMAIL || (transporter.options as any)?.auth?.user || 'no-reply@localhost')}>`,
        to: email,
        subject: `📈 Market News Summary Today - ${date}`,
        text: `Today's market news summary from Stonks`,
        html: htmlTemplate,
        replyTo: REPLY_TO,
        headers: LIST_UNSUB ? { 'List-Unsubscribe': LIST_UNSUB } : undefined,
    };

    await transporter.sendMail(mailOptions);
};