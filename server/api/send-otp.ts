import { defineEventHandler } from 'h3';
import Twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

// Env variables for Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_BYPASS_KEY;

// Env variables for Twilio
const accountSid = process.env.NUXT_TWILIO_ACCOUNT_SID;
const authToken = process.env.NUXT_TWILIO_AUTH_TOKEN;
const serviceSid = process.env.NUXT_TWILIO_VERIFY_SERVICE_SID;

// Verify that the required environment variables are set
if (!accountSid || !authToken || !serviceSid || !supabaseUrl || !supabaseKey) {
    throw new Error('Missing required environment variables for Twilio');
}

const supabase = createClient(supabaseUrl, supabaseKey);
const client = Twilio(accountSid, authToken);

export default defineEventHandler(async () => {
    try {
        // Fetch settings from Supabase
        const { data: settings, error } = await supabase
            .from('Settings')
            .select('otp_email, otp_phone')
            .single();

        if (error || !settings) {
            throw new Error('Failed to fetch settings from the database');
        }

        const { otp_email: email, otp_phone: phoneNumber } = settings;

        // Verify that the required settings are fetched
        if (!phoneNumber || !email) {
            throw new Error('Missing required settings for Twilio');
        }

        // Call Twilio to send the OTP
        const verification = await client.verify.v2.services(serviceSid)
            .verifications
            .create({ to: email, channel: 'email' }); // Channel can either be 'sms', 'whatsapp', or 'email' (recommended)

        return { success: true, verificationSid: verification.sid };
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        } else {
            return { error: 'An unknown error occurred' };
        }
    }
});