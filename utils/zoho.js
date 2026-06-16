let cachedAccessToken = null;
let tokenExpiresAt = 0;

export async function getZohoAccessToken() {
  if (cachedAccessToken && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }

  const res = await fetch('https://accounts.zoho.in/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      refresh_token: process.env.ZOHO_REFRESH_TOKEN,
    }),
  });

  const data = await res.json();

  if (!data.access_token) {
    throw new Error(`Zoho token refresh failed: ${JSON.stringify(data)}`);
  }

  cachedAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  console.log('[Zoho] Access token refreshed');

  return cachedAccessToken;
}

export async function findBiginContactByPhone(phone) {
  const accessToken = await getZohoAccessToken();

  const res = await fetch(
    `https://www.zohoapis.in/bigin/v2/Contacts/search?phone=${encodeURIComponent(phone)}`,
    {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
    }
  );

  const text = await res.text();
  if (!text || !res.ok) return null;

  try {
    const data = JSON.parse(text);
    return data?.data?.[0]?.id || null;
  } catch {
    return null;
  }
}

export async function updateBiginContactField(contactId, fields) {
  const accessToken = await getZohoAccessToken();

  const res = await fetch(
    `https://www.zohoapis.in/bigin/v2/Contacts/${contactId}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: [fields] }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error('[Bigin] Contact update failed:', res.status, text);
  } else {
    console.log('[Bigin] Contact updated:', contactId);
  }
}
