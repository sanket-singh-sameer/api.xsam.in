import { google } from "googleapis";
import { OAuth2Client } from "./OAuth2Client.js";


OAuth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
})

export const drive = google.drive({
    version: 'v3',
    auth: OAuth2Client,
})