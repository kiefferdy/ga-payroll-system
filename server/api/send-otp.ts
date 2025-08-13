import { defineEventHandler } from 'h3';
import Twilio from 'twilio';
import { getServiceRoleClient } from '../utils/supabase-clients';

// Env variables for Twilio
const accountSid = process.env.NUXT_TWILIO_ACCOUNT_SID;
const authToken = process.env.NUXT_TWILIO_AUTH_TOKEN;
const serviceSid = process.env.NUXT_TWILIO_VERIFY_SERVICE_SID;

// Verify that the required environment variables are set
if (!accountSid || !authToken || !serviceSid) {
    throw new Error('Missing environment variables required for Twilio Verify');
}
const client = Twilio(accountSid, authToken);

export default defineEventHandler(async (event) => {
    try {
        // Fetch settings from Supabase (system settings don't require user auth)
        const supabase = getServiceRoleClient(event);
        const { data: settings, error } = await supabase
            .from('Settings')
            .select('otp_email, otp_phone, otp_channel')
            .single();

        if (error || !settings) {
            throw new Error('Failed to fetch settings from the database');
        }

        const { otp_email: email, otp_phone: phoneNumber, otp_channel: channel } = settings as any;

        // Verify that the required settings are fetched
        if (!phoneNumber || !email || !channel) {
            throw new Error('Missing settings required for Twilio Verify');
        }

        if (channel.toLowerCase() == 'email') {
            // Call Twilio to send the OTP via email
            const verification = await client.verify.v2.services(serviceSid)
                .verifications
                .create({ to: email, channel: channel.toLowerCase() });

            return { success: true, verificationSid: verification.sid };
        } else {
            // Call Twilio to send the OTP via SMS or WhatsApp
            const verification = await client.verify.v2.services(serviceSid)
                .verifications
                .create({ to: phoneNumber, channel: channel.toLowerCase() });

            return { success: true, verificationSid: verification.sid };
        }
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        } else {
            return { error: 'An unknown error occurred' };
        }
    }
});