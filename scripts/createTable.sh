#!/bin/bash

TABLE_NAME="Messages"
REGION="sa-east-1"
URL="http://localhost:8000"

aws dynamodb create-table \
  --table-name "$TABLE_NAME" \
  --attribute-definitions \
      AttributeName=sender,AttributeType=S \
      AttributeName=sentAt,AttributeType=N \
      AttributeName=id,AttributeType=S \
      AttributeName=sentMonth,AttributeType=S \
  --key-schema \
      AttributeName=sender,KeyType=HASH \
      AttributeName=sentAt,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes '[
    {
      "IndexName": "IdIndex",
      "KeySchema": [ { "AttributeName": "id", "KeyType": "HASH" } ],
      "Projection": { "ProjectionType": "ALL" }
    },
    {
      "IndexName": "SentDateIndex",
      "KeySchema": [
        { "AttributeName": "sentMonth", "KeyType": "HASH" },
        { "AttributeName": "sentAt",   "KeyType": "RANGE" }
      ],
      "Projection": { "ProjectionType": "ALL" }
    }
  ]' \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url "$URL" \
  --region "$REGION"
