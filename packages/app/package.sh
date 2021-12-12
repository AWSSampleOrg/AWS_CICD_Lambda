#!/usr/bin/env bash

SOURCE_DIR=$(cd $(dirname ${BASH_SOURCE:-0}) && pwd)
cd ${SOURCE_DIR}/../../

CICD_ARTIFACT_BUCKET="***Your S3 Bucket for CI/CD Artifact***"

echo "PACKAGED_TEMPLATE_FILE_PATH = ${PACKAGED_TEMPLATE_FILE_PATH}"

aws cloudformation package \
    --template-file packages/app/template.yml \
    --s3-bucket ${CICD_ARTIFACT_BUCKET} \
    --output-template-file ${PACKAGED_TEMPLATE_FILE_PATH}
