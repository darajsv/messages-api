import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import * as dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';

dotenv.config();

const TABLE_NAME = 'Messages';
const REGION = process.env.REGION || 'sa-east-1';
const URL = process.env.DB_ENDPOINT || 'http://localhost:8000';

const connection = new DynamoDBClient({
  region: REGION,
  endpoint: URL,
});

const client = DynamoDBDocumentClient.from(connection);

function generateRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getMonthBucket(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

type MessageStatus = 'sent' | 'received' | 'read';

function getRandomStatus(): MessageStatus {
  const statuses = ['sent', 'received', 'read'] as const;
  return statuses[Math.floor(Math.random() * statuses.length)];
}

function generateSenders(count: number): string[] {
  return Array.from({ length: count }, () => faker.internet.email());
}

async function seedMessages() {
  const totalItems = 1000;
  const senderList = generateSenders(20);

  const items: Array<{
    PutRequest: {
      Item: {
        id: string;
        sender: string;
        sentAt: number;
        sentMonth: string;
        content: string;
        status: MessageStatus;
      };
    };
  }> = [];

  for (let i = 0; i < totalItems; i++) {
    const date = generateRandomDate(new Date('2023-01-01'), new Date('2025-12-31'));
    const epoch = Math.floor(date.getTime());
    items.push({
      PutRequest: {
        Item: {
          id: faker.string.uuid(),
          sender: faker.helpers.arrayElement(senderList),
          sentAt: epoch,
          sentMonth: getMonthBucket(date),
          content: faker.lorem.sentence(),
          status: getRandomStatus(),
        },
      },
    });
  }

  for (let i = 0; i < items.length; i += 25) {
    const batch = items.slice(i, i + 25);
    const command = new BatchWriteCommand({
      RequestItems: {
        [TABLE_NAME]: batch,
      },
    });

    try {
      await client.send(command);
      console.log(`Inserted items ${i + 1} to ${i + batch.length}`);
    } catch (error) {
      console.error(`Error inserting batch ${i + 1}:`, error);
    }
  }

  console.log('Seeding completed.');
}

seedMessages();
