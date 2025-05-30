export interface ContactDTO {
    contactId: number;
    contactName: string;
    prenom?: string;
    imageUrl: string | ArrayBuffer | null;
    image?: {
      type: string;
      image: string;
    };
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
    bienId?: number;
    bienTitle?: string;
  }