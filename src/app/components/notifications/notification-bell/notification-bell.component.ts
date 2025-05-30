import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent {
  @Input() unreadCount = 0;
  @Input() isOpen = false;
  @Input() hasNewNotifications = false;
  @Output() toggle = new EventEmitter<void>();
}