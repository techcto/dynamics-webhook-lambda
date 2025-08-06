#!/bin/bash
aws s3 cp devops/dynamics-webhook.yaml s3://dynamics-webhook/dynamics-webhook.yaml --acl public-read

aws cloudformation create-stack \
  --disable-rollback \
  --stack-name dynamics-webhook \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --template-url https://s3.amazonaws.com/dynamics-webhook/dynamics-webhook.yaml \
  --parameters file://devops/build.json
