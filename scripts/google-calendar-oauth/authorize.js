import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { google } from 'googleapis';
import { randomBytes, timingSafeEqual } from 'node:crypto';

const clientId = process.env.GOOGLE_CALENDAR_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CALENDAR_OAUTH_CLIENT_SECRET;
const redirectUri = 'http://localhost:53682/oauth2callback';
const scopes = [
  'https://www.googleapis.com/auth/calendar.events.freebusy',
  'https://www.googleapis.com/auth/calendar.events',
];

if (!clientId || !clientSecret) {
  console.error('Set GOOGLE_CALENDAR_OAUTH_CLIENT_ID and GOOGLE_CALENDAR_OAUTH_CLIENT_SECRET in your shell first.');
  process.exit(1);
}

const oauth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
const state = randomBytes(24).toString('hex');
const authUrl = oauth.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: scopes,
  state,
});

const server = createServer(async (request, response) => {
  const url = new URL(request.url, redirectUri);
  if (url.pathname !== '/oauth2callback') {
    response.writeHead(404).end('Not found');
    return;
  }

  const receivedState = url.searchParams.get('state') || '';
  const validState = receivedState.length === state.length
    && timingSafeEqual(Buffer.from(receivedState), Buffer.from(state));
  const code = url.searchParams.get('code');
  if (!validState || !code) {
    response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Authorization failed. You can close this tab and retry in the terminal.');
    server.close(() => process.exitCode = 1);
    return;
  }

  try {
    const { tokens } = await oauth.getToken(code);
    response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Google Calendar authorization complete. Return to your terminal.');
    server.close(() => {
      if (!tokens.refresh_token) {
        console.error('Google did not return a refresh token. Retry and revoke the app permission first if it was already authorized.');
        process.exitCode = 1;
        return;
      }
      console.log('\nCopy this refresh token directly into Hostinger as GOOGLE_CALENDAR_OAUTH_REFRESH_TOKEN:');
      console.log(tokens.refresh_token);
      console.log('\nDo not commit it or send it in chat.');
    });
  } catch (error) {
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Token exchange failed. Return to your terminal for details.');
    server.close(() => {
      console.error('Could not exchange the authorization code:', error.message);
      process.exitCode = 1;
    });
  }
});

server.on('error', (error) => {
  console.error(`Could not listen on ${redirectUri}: ${error.message}`);
  process.exitCode = 1;
});

server.listen(53682, '127.0.0.1', async () => {
  console.log('Opening Google authorization in your browser. Sign in as the owner of the Portfolio bookings calendar.');
  const browser = spawn('open', [authUrl], { stdio: 'ignore' });
  browser.on('error', () => {
    console.log('Open this URL in your browser to authorize:');
    console.log(authUrl);
  });
});
