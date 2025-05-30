export interface MessageDTO {
    id?: number;
    senderId: number;
    recipientId: number;
    content: string;
    read: boolean;
    timestamp: Date;
    bienId?: number;
  }