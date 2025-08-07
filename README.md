# Dynamics Webhook Lambda

This project defines an AWS Lambda function to receive webhook events from Microsoft Dynamics and forward relevant lead updates to [Customer.io](https://customer.io). It is designed for secure, serverless deployments via AWS CloudFormation.

---

## 📁 Project Structure

```
dynamics-webhook-lambda/
├── devops/
│   ├── build.json              # Parameter overrides for secrets
│   ├── deploy.sh               # Shell script to deploy using AWS CLI
│   └── dynamics-webhook.yaml  # CloudFormation template
├── src/
│   └── handler.mjs              # Lambda source code
├── .gitignore
├── cmd.sh                      # Optional helper
└── README.md
```

---

## 🚀 Deployment

### Step 0: Configure `build.json`

Create `devops/build.json` with the following format:

```json
[
  {
    "ParameterKey": "CustomerIOSiteId",
    "ParameterValue": "your-site-id"
  },
  {
    "ParameterKey": "CustomerIOApiKey",
    "ParameterValue": "your-api-key"
  },
  {
    "ParameterKey": "CustomerIOApiHost",
    "ParameterValue": "track.customer.io"
  }
]
```

> 🔐 **DO NOT commit this file to Git. It contains sensitive data.**

---

### Step 1: Zip the Lambda source

```bash
zip -r dynamics-webhook.zip src/
```

---

### Step 2: Upload to S3

Replace the bucket and path with your own:

```bash
aws s3 cp dynamics-webhook.zip s3://<your-bucket-name>/<path>/webhook.zip
```

---

### Step 3: Deploy using CloudFormation

You can use the included `devops/deploy.sh` script:

```bash
chmod +x devops/deploy.sh
./devops/deploy.sh
```

The script reads `build.json` and converts it to CLI parameters using `jq`.

---

## 🛠️ deploy.sh script

```bash
#!/bin/bash
aws s3 cp devops/dynamics-webhook.yaml s3://dynamics-webhook/dynamics-webhook.yaml --acl public-read

aws cloudformation create-stack \
  --disable-rollback \
  --stack-name dynamics-webhook \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --template-url https://s3.amazonaws.com/dynamics-webhook/dynamics-webhook.yaml \
  --parameters file://devops/build.json
```

---

## 🧪 Testing

Obtain your API Key:
- Log into your AWS account and navigate to the API Gateway console
- Locate your new API
- Navigate to API Keys (left menu)
- Find and copy your API Key


After deployment, test with:

- `https://<your-aws-gateway-api-url>/prod/webhook`
```
- Set your authentication method to API Key: Key = x-api-key | Value = <your api key>
- Compose your message body: 

```json
{
  "email": "test@example.com",
  "status": "Qualified"
}
```

---

## 🔒 Security

- No secrets are stored in source.
- Secrets injected securely at deploy time via `build.json`.
- IAM Role uses minimal permissions.

---

## 📜 License

MIT


---

## 🧪 `cmd.sh`: Local Packaging & Deployment Helper

This helper script supports two commands:

### `lambda` – Package and upload Lambda code

```bash
./cmd.sh lambda
```

This will:
- Zip the contents of `src/`
- Upload the zip to your S3 bucket

### `cft` – Upload CloudFormation template and deploy

```bash
./cmd.sh cft
```

This will:
- Upload `devops/dynamics-webhook.yaml` to your S3 bucket
- Deploy the CloudFormation stack using `build.json` for parameters

> Note: It assumes you have AWS CLI configured and access to a bucket named `dynamics-webhook`. Edit the script if your bucket name differs.