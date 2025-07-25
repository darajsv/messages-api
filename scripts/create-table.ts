import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import * as dotenv from 'dotenv';

dotenv.config();

const TABLE_NAME = 'Messages';
const REGION = process.env.DB_REGION || 'sa-east-1';
const URL = process.env.DB_ENDPOINT || 'http://localhost:8000';

const client = new DynamoDBClient({
  region: REGION,
  endpoint: URL,
});

const command = new CreateTableCommand({
  TableName: TABLE_NAME,
  AttributeDefinitions: [
    { AttributeName: 'sender', AttributeType: 'S' },
    { AttributeName: 'sentAt', AttributeType: 'N' },
    { AttributeName: 'id', AttributeType: 'S' },
    { AttributeName: 'sentMonth', AttributeType: 'S' },
  ],
  KeySchema: [
    { AttributeName: 'sender', KeyType: 'HASH' },
    { AttributeName: 'sentAt', KeyType: 'RANGE' },
  ],
  BillingMode: 'PAY_PER_REQUEST',
  GlobalSecondaryIndexes: [
    {
      IndexName: 'IdIndex',
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
    },
    {
      IndexName: 'SentDateIndex',
      KeySchema: [
        { AttributeName: 'sentMonth', KeyType: 'HASH' },
        { AttributeName: 'sentAt', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    },
  ],
});

async function run() {
  try {
    const response = await client.send(command);
    console.log('Table created:', response.TableDescription?.TableName);
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

run();
