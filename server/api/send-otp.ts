import { defineEventHandler } from 'h3';
import Twilio from 'twilio';

const accountSid = process.env.NUXT_TWILIO_ACCOUNT_SID;
const authToken = process.env.NUXT_TWILIO_AUTH_TOKEN;
const serviceSid = process.env.NUXT_TWILIO_VERIFY_SERVICE_SID;
const phoneNumber = process.env.NUXT_OTP_PHONE_NUMBER;

// Verify that the required environment variables are set
if (!accountSid || !authToken || !serviceSid || !phoneNumber) {
    throw new Error('Missing required environment variables for Twilio.');
}

const client = Twilio(accountSid, authToken);

export default defineEventHandler(async () => {
    try {
        // Call Twilio to send the OTP
        const verification = await client.verify.v2.services(serviceSid)
            .verifications
            .create({ to: phoneNumber, channel: 'whatsapp' }); // Channel can either be 'sms' or 'whatsapp' (recommended)

        return { success: true, verificationSid: verification.sid };
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        } else {
            return { error: 'An unknown error occurred' };
        }
    }
});