import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Utilisateur } from '../../models/Utilisateur';
import { ImageService } from '../../services/image-service.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notifications.service';
import { NotificationDTO } from '../../models/NotificationDTO';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  currentUser: Utilisateur | null = null;
  imagePath: string = 'assets/default-avatar.png';
  isNotificationsOpen: boolean = false;
  notifications: NotificationDTO[] = [];
  unreadCount: number = 0;
  hasNewNotifications = false;
  
  private subs = new Subscription();

  constructor(
    private userService: UserService,
    private imageService: ImageService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.notificationService.disconnect();
  }
  

  private loadUserImage(): void {
    if (!this.currentUser?.id) return;

    this.subs.add(
      this.imageService.getUserImage(this.currentUser.id).subscribe({
        next: (imageBlob) => {
          const reader = new FileReader();
          reader.onload = () => {
            this.imagePath = reader.result as string;
          };
          reader.readAsDataURL(imageBlob);
        },
        error: (err) => {
          console.error('Erreur lors du chargement de l\'image de profil', err);
          this.imagePath = 'assets/default-avatar.png';
        }
      })
    );
  }
  private loadCurrentUser(): void {
    this.subs.add(
      this.userService.getCurrentUserProfile().subscribe({
        next: (user) => {
          this.currentUser = user;
          console.log('currentUser', this.currentUser);
          this.loadUserImage();
          if (user) {
            this.setupNotifications();
            this.notificationService.connect();
          }
        },
        error: (err) => console.error('Error loading profile', err)
      })
    );
  }

  private setupNotifications(): void {
    this.subs.add(
      this.notificationService.getNotifications().subscribe({
        next: (notifications) => {
          const previousCount = this.notifications.length;
          this.notifications = notifications;
          console.log(this.notifications);
          
          // Vérifier s'il y a de nouvelles notifications
          if (this.notifications.length > previousCount && !this.isNotificationsOpen) {
            this.hasNewNotifications = true;
          }
          
          this.updateUnreadCount();
        },
        error: (err) => console.error('Error loading notifications', err)
      })
    );

    this.subs.add(
      this.notificationService.getConnectionStatus().subscribe(status => {
        console.log('WebSocket status:', status ? 'Connected' : 'Disconnected');
      })
    );
  }

  toggleNotifications(): void {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    this.hasNewNotifications = false;
    
    if (this.isNotificationsOpen && this.unreadCount > 0) {
      this.markAllAsRead();
    }
  }

  private updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.lu).length;
  }

  // ... autres méthodes existantes ...


  markAsRead(notificationId: number): void {
    this.subs.add(
      this.notificationService.markAsRead(notificationId).subscribe({
        next: () => {
          const notification = this.notifications.find(n => n.id === notificationId);
          if (notification) {
            notification.lu = true;
            this.updateUnreadCount();
          }
        },
        error: (err) => console.error('Erreur lors du marquage comme lue', err)
      })
    );
  }

    markAllAsRead(): void {
      const unreadIds = this.notifications
        .filter(n => !n.lu)
        .map(n => n.id);

      if (unreadIds.length === 0) return;

      this.subs.add(
        this.notificationService.markAllAsRead(unreadIds).subscribe({
          next: () => {
            this.notifications.forEach(n => n.lu = true);
            this.unreadCount = 0;
          },
          error: (err) => console.error('Erreur lors du marquage global comme lues', err)
        })
      );
    }

 

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    const content = document.querySelector('.content');
    if (content) {
      content.classList.toggle('shifted', this.isMenuOpen);
    }
  }

  redirectProfileBasedOnRole() {
    const roleTypes = this.authService.getRoles(); // ['PROPRIETAIRE', 'VISITEUR']
    
    if (roleTypes?.includes('ADMIN')) {
      this.router.navigate(['/admin/profile']);
    } else if (roleTypes?.includes('PROPRIETAIRE')) {
      this.router.navigate(['/proprietaire/profile']);
    } else if (roleTypes?.includes('VISITEUR')) {
      this.router.navigate(['/profile/infoUser']);
    } else {
      alert('Rôle non autorisé');
    }
  }
  logout(): void {
    this.authService.logoutFromServer();
    window.location.reload();
  }
}