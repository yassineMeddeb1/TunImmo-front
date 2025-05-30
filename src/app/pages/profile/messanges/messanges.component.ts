import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from '../../../services/message.service';
import { AuthService } from '../../../services/auth.service';
import { MessageDTO } from '../../../models/MessageDTO';
import { ContactDTO } from '../../../models/ContactDTO';
import { ImageService } from '../../../services/image-service.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messanges.component.html',
  styleUrls: ['./messanges.component.scss']
})
export class MessangesComponent implements OnInit, OnDestroy {
  contacts: ContactDTO[] = [];
  
  selectedContact: ContactDTO | null = null;
  messages: MessageDTO[] = [];
  messageContent = '';
  currentUser: any;
  connectionStatus = false;
  imagePath: any;
  private destroy$ = new Subject<void>();

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private imageService: ImageService,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadContacts();
    this.setupWebSocket();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.messageService.disconnect();
  }

  loadContacts(): void {
    this.messageService.getContacts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (contacts) => {
          this.contacts = contacts;
          console.log(this.contacts);
          for(const contact of this.contacts) {
            this.loadUserImage(contact);
          }
          // Marquer le premier contact comme sélectionné si aucun n'est sélectionné
          if (contacts.length > 0 && !this.selectedContact) {
            this.selectContact(contacts[0]);
            
          }
        },
        error: (err) => console.error('Erreur lors du chargement des contacts', err)
      });
  }
  loadUserImage(contact : ContactDTO): void {
    this.imageService.getUserImage(contact.contactId).subscribe({
      next: (imageBlob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          contact.imageUrl = reader.result;
          this.imagePath = contact.imageUrl; 
          console.log(contact.imageUrl);
        };
        reader.readAsDataURL(imageBlob);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l’image de profil', err);
      }
    });
  }
  
  setupWebSocket(): void {
    this.messageService.connectWebSocket()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (message: MessageDTO) => {
          this.handleIncomingMessage(message);
        },
        error: (err) => console.error('Erreur WebSocket', err),
        complete: () => this.connectionStatus = false
      });
  }

  selectContact(contact: ContactDTO): void {
    this.selectedContact = contact;
    this.loadConversation();
    this.loadUserImage(contact);
    this.markMessagesAsRead();
  }

  loadConversation(): void {
    if (!this.selectedContact) return;

    this.messageService.getConversation(this.selectedContact.contactId, this.selectedContact.bienId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (messages) => {
          this.messages = messages;
        },
        error: (err) => console.error('Erreur lors du chargement des messages', err)
      });
  }

  sendMessage(): void {
    if (!this.messageContent.trim() || !this.selectedContact) return;

    const message: MessageDTO = {
      senderId: this.currentUser.id,
      recipientId: this.selectedContact.contactId,
      content: this.messageContent,
      bienId: this.selectedContact.bienId || undefined,
      timestamp: new Date(),
      read: false
    };

    this.messageService.sendMessage(message);
    this.messages.push(message);
    this.messageContent = '';
  }

  handleIncomingMessage(message: MessageDTO): void {
    // Vérifier si le message appartient à la conversation actuelle
    const isCurrentConversation = this.selectedContact && 
      ((message.senderId === this.selectedContact.contactId && message.recipientId === this.currentUser.id) ||
       (message.recipientId === this.selectedContact.contactId && message.senderId === this.currentUser.id)) &&
      message.bienId === (this.selectedContact?.bienId || undefined);

    if (isCurrentConversation) {
      this.messages.push(message);
    }

    // Mettre à jour le dernier message dans la liste des contacts
    this.updateContactList(message);
  }

  updateContactList(message: MessageDTO): void {
    const contactId = message.senderId === this.currentUser.id 
      ? message.recipientId 
      : message.senderId;

    const contactIndex = this.contacts.findIndex(c => c.contactId === contactId);
    if (contactIndex !== -1) {
      this.contacts[contactIndex].lastMessage = message.content;
      this.contacts[contactIndex].lastMessageTime = new Date(message.timestamp);
      
      if (message.recipientId === this.currentUser.id && !message.read) {
        this.contacts[contactIndex].unreadCount = (this.contacts[contactIndex].unreadCount || 0) + 1;
      }
    }
  }

  markMessagesAsRead(): void {
    if (!this.selectedContact) return;

    const unreadMessages = this.messages.filter(
      m => m.senderId === this.selectedContact?.contactId && !m.read
    );

    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map(m => m.id).filter(id => id !== undefined) as number[];
      this.messageService.markMessagesAsRead(messageIds).subscribe(() => {
        // Mettre à jour localement
        this.messages.forEach(m => {
          if (m.senderId === this.selectedContact?.contactId) {
            m.read = true;
          }
        });
        
        // Mettre à jour le compteur dans la liste des contacts
        const contact = this.contacts.find(c => c.contactId === this.selectedContact?.contactId);
        if (contact) {
          contact.unreadCount = 0;
        }
      });
    }
  }
}