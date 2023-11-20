import { defineEventHandler } from 'h3';
import Twilio from 'twilio';

const accountSid = process.env.NUXT_TWILIO_ACCOUNT_SID;
const authToken = process.env.NUXT_TWILIO_AUTH_TOKEN;
const serviceSid = process.env.NUXT_TWILIO_VERIFY_SERVICE_SID;
const email = process.env.NUXT_OTP_EMAIL;
const phoneNumber = process.env.NUXT_OTP_PHONE_NUMBER;

// Verify that the required environment variables are set
if (!accountSid || !authToken || !serviceSid || !phoneNumber || !email) {
    throw new Error('Missing required environment variables for Twilio.');
}

const client = Twilio(accountSid, authToken);

export default defineEventHandler(async (event) => {
    try {
        // Parsing the incoming request to get inputted OTP code
        const body = await readBody(event);
        const { otpCode } = body;

        // Check if otpCode is provided
        if (!otpCode) {
            return { success: false, message: 'Missing OTP' };
        }

        // Call Twilio to verify the OTP
        const verificationCheck = await client.verify.v2.services(serviceSid)
            .verificationChecks
            .create({ code: otpCode, to: email });

        // Check if verification was successful
        if (verificationCheck.status === 'approved') {
            return { success: true };
        } else {
            return { success: false, message: 'Invalid OTP' };
        }
    } catch (error) {
        // Handle errors appropriately
        if (error instanceof Error) {
            return { success: false, error: error.message };
        } else {
            return { success: false, error: 'An unknown error occurred' };
        }
    }
});