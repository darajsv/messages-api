import { formatYearMonth, toEpoch } from '@shared/utils';
import { Exclude } from 'class-transformer';
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
  sentAt: number;
  status: MessageStatus;
  @Exclude()
  sentMonth: string;

  constructor(content: string, sender: string) {
    const date = new Date();
    this.id = randomUUID();
    this.content = content;
    this.sender = sender;
    this.sentAt = toEpoch(date);
    this.status = MessageStatus.SENT;
    this.sentMonth = formatYearMonth(date);
  }
}
