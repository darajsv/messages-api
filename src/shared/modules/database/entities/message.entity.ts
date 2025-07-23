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
  sentAt: Date;
  status: MessageStatus;

  constructor(content: string, sender: string) {
    this.id = randomUUID();
    this.content = content;
    this.sender = sender;
    this.sentAt = new Date();
    this.status = MessageStatus.SENT;
  }

  static newInstanceFromDB(data: any): Message {
    return {
      id: data.id.S,
      content: data.content.S,
      sender: data.content.S,
      sentAt: new Date(Number(data.sentAt.N)),
      status: data.status.S,
    };
  }
}
