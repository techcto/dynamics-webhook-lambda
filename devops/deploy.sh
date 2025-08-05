#!/usr/bin/env bash
DEPLOY=1
DATE=$(date +%d%H%M)

aws s3 cp dynamics-webhook.yaml s3://dynamics-webhook/dynamics-webhook.yaml --acl public-read

aws cloudformation create-stack --disable-rollback --stack-name webhook-${DATE}-tmp --disable-rollback --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
    --parameters file://build.json \
    --template-url https://s3.amazonaws.com/dynamics-webhook/dynamics-webhook.yaml