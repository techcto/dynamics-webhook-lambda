#!/bin/bash

export $(egrep -v '^#' .env | xargs) >/dev/null 2>&1
args=("$@")

# init(){
#     git submodule init
# }

export AWS_PROFILE=develop

tag(){
    VERSION="${args[1]}"
    git tag -a v${VERSION} -m "tag release"
    git push --tags
}

cft(){
    cd devops
    ./deploy.sh
}

lambda() {
  set -e
  echo "🔧 Building Lambda deployment package..."

  # Navigate to lambda function source
  cd src

  # Clean previous build if exists
  rm -rf lambda_package dynamics-webhook.zip

  # Create build directory
  mkdir lambda_package

  # Install dependencies
  pip install -r requirements.txt -t lambda_package

  # Copy source handler
  cp lambda_function.py lambda_package/ && cd lambda_package

  # Zip everything
  zip -r ../dynamics-webhook.zip .

  echo "✅ Lambda package created at: dynamics-webhook.zip"

  cd ..
  aws s3 cp dynamics-webhook.zip s3://dynamics-webhook/dynamics-webhook.zip --acl public-read
}

$*