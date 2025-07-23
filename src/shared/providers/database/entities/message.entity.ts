import { randomUUID } from 'crypto';

export enum MessageStatus {
  SENT = 'sent',
  RECEIVED = 'received',
  READ = 'read',
}

export class Message {
  id: string;
  content: string;
  sender: string;
  sentAt: string;
  status: MessageStatus;

  constructor(content: string, sender: string) {
    this.id = randomUUID();
    this.content = content;
    this.sender = sender;
    this.sentAt = new Date().toISOString();
    this.status = MessageStatus.SENT;
  }
}
