import { CreateMessageRequestDTO } from '@modules/message/create/dtos/request.dto';
import { randomUUID } from 'crypto';

enum MessageStatus {
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

  static newInstanceFromDTO(data: CreateMessageRequestDTO) {
    return {
      id: randomUUID(),
      content: data.content,
      sender: data.sender,
      sentAt: new Date(),
      status: MessageStatus.SENT,
    };
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
