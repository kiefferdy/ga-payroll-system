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
    throw new Error('Missing environment variables required for Twilio Verify');
}

const supabase = createClient(supabaseUrl, supabaseKey);
const client = Twilio(accountSid, authToken);

export default defineEventHandler(async (event) => {
    try {
        // Fetch settings from Supabase
        const { data: settings, error } = await supabase
            .from('Settings')
            .select('otp_email, otp_phone, otp_channel')
            .single();

        if (error || !settings) {
            throw new Error('Failed to fetch settings from the database');
        }

        const { otp_email: email, otp_phone: phoneNumber, otp_channel: channel } = settings;

        // Verify that the required settings are fetched
        if (!phoneNumber || !email || !channel) {
            throw new Error('Missing settings required for Twilio Verify');
        }
        
        // Parsing the incoming request to get inputted OTP code
        const body = await readBody(event);
        const { otpCode } = body;

        // Check if otpCode is provided
        if (!otpCode) {
            return { success: false, message: 'Missing OTP' };
        }

        if (channel.toLowerCase() == 'email') {
            // Call Twilio to verify the OTP sent via email
            const verificationCheck = await client.verify.v2.services(serviceSid)
                .verificationChecks
                .create({ code: otpCode, to: email });

            // Check if verification was successful
            if (verificationCheck.status === 'approved') {
                return { success: true };
            } else {
                return { success: false, message: 'Invalid OTP' };
            }
        } else {
            // Call Twilio to verify the OTP sent via SMS or WhatsApp
            const verificationCheck = await client.verify.v2.services(serviceSid)
                .verificationChecks
                .create({ code: otpCode, to: phoneNumber });
            
            // Check if verification was successful
            if (verificationCheck.status === 'approved') {
                return { success: true };
            } else {
                return { success: false, message: 'Invalid OTP' };
            }
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