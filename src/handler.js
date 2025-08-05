import https from 'https';

const { CUSTOMER_IO_SITE_ID, CUSTOMER_IO_API_KEY, CUSTOMER_IO_API_HOST = 'track.customer.io' } = process.env;

export const handler = async (event) => {
  console.log("Raw event.body:", event.body);

  let payload;
  try {
    payload = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ message: "Invalid JSON in request body" }) };
  }

  const email = payload.email || payload.emailaddress1;
  const leadStatus = payload.status || payload.leadStatus;

  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ message: "Missing email in payload" }) };
  }

  const eventData = {
    name: 'lead_status_updated',
    data: { crm_status: leadStatus },
    type: 'event',
  };

  try {
    await sendEventToCustomerIO(email, eventData);
    await updatePersonEmailInCustomerIO(email, { crm_status: leadStatus });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Webhook processed and sent to Customer.io' }),
    };
  } catch (error) {
    console.error('Error sending to Customer.io:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to send event to Customer.io' }),
    };
  }
};

function sendEventToCustomerIO(customerEmail, eventData) {
  const postData = JSON.stringify(eventData);
  const options = {
    hostname: CUSTOMER_IO_API_HOST,
    path: `/api/v1/customers/${encodeURIComponent(customerEmail)}/events`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Authorization': 'Basic ' + Buffer.from(`${CUSTOMER_IO_SITE_ID}:${CUSTOMER_IO_API_KEY}`).toString('base64'),
    },
  };

  return httpRequest(options, postData);
}

function updatePersonEmailInCustomerIO(customerEmail, attributes) {
  const putData = JSON.stringify({ email: customerEmail, ...attributes });
  const options = {
    hostname: CUSTOMER_IO_API_HOST,
    path: `/api/v1/customers/${encodeURIComponent(customerEmail)}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putData),
      'Authorization': 'Basic ' + Buffer.from(`${CUSTOMER_IO_SITE_ID}:${CUSTOMER_IO_API_KEY}`).toString('base64'),
    },
  };

  return httpRequest(options, putData);
}

function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(data);
        else reject(new Error(`Customer.io responded with status ${res.statusCode}: ${data}`));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}
