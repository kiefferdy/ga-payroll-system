import { defineEventHandler } from 'h3';

export default defineEventHandler((event) => {
    // Gets server time and returns it to user
    const currentTime = new Date().toISOString();
    return {
        time: currentTime
    };
});