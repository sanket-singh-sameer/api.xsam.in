import { google } from 'googleapis';
import { OAuth2Client } from './OAuth2Client.js';

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

export function getAuthUrl() {
  return OAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: true,
    scope: SCOPES,
  });
}