import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ImageService } from '../../../services/image-service.service';

@Component({
  selector: 'app-utilisateurs-admin',
  templateUrl: './utilisateurs-admin.component.html',
  styleUrls: ['./utilisateurs-admin.component.css']
})
export class UtilisateursAdminComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  isLoading = false;
  totalItems = 0;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  searchQuery: string = '';
  selectedRole: string = '';
  imagePath: any;

  constructor(public userService: UserService,private imageService: ImageService) {} // Changé à public pour l'accès dans le template

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page: number = 0): void {
    this.isLoading = true;
    this.userService.getUsers(page, this.itemsPerPage)
      .subscribe({
        next: (response) => {
          this.users = response.content;
          for(const user of this.users) {
            this.imageService.getUserImage(user.id).subscribe({
              next: (imageBlob) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  user.imageUrl = reader.result;
                  console.log(this.imagePath);
                };
                reader.readAsDataURL(imageBlob);
              },
              error: (err) => {
                console.error('Erreur lors du chargement de l’image de profil', err);
              }
            });
          
          }
          console.log(this.users);
          this.filteredUsers = [...this.users];
          this.totalItems = response.totalElements;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          alert('Erreur lors du chargement des utilisateurs');
        }
      });
  }

  applyFilters(): void {
    if (!this.searchQuery && !this.selectedRole) {
      this.loadUsers();
      return;
    }

    this.isLoading = true;
    this.userService.searchUsers(this.searchQuery, this.selectedRole)
      .subscribe({
        next: (users) => {
          this.filteredUsers = users;
          for(const user of this.filteredUsers) {
            this.imageService.getUserImage(user.id).subscribe({
              next: (imageBlob) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  user.imageUrl = reader.result;
                  console.log(this.imagePath);
                };
                reader.readAsDataURL(imageBlob);
              },
              error: (err) => {
                console.error('Erreur lors du chargement de l’image de profil', err);
              }
            });
          
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          alert('Erreur lors de la recherche');
        }
      });
  }

  deleteUser(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers(this.currentPage - 1);
          alert('Utilisateur supprimé avec succès');
        },
        error: () => {
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  toggleStatus(id: number): void {
    this.userService.toggleUserStatus(id).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex((u: any) => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.applyFilters();
        }
        alert(`Utilisateur ${updatedUser.enabled ? 'activé' : 'désactivé'} avec succès`);
      },
      error: () => {
        alert('Erreur lors du changement de statut');
      }
    });
  }

  getMainRole(roles: string[]): string {
    if (!roles || roles.length === 0) return 'VISITEUR';
    return roles[0];
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers(page - 1);
  }

  // Nouvelle méthode pour générer les numéros de page
  getPages(): number[] {
    const pages = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Nouvelle méthode pour obtenir la dernière page
  getLastPage(): number {
    return this.totalPages;
  }

  // Méthode pour gérer les réservations
  viewReservations(userId: number): void {
    this.userService.getUserReservations(userId).subscribe({
      next: (reservations) => {
        console.log('Réservations:', reservations);
        // Ajoutez ici la logique pour afficher les réservations
      },
      error: () => {
        alert('Erreur lors du chargement des réservations');
      }
    });
  }

  // Méthode pour gérer les annonces
  viewAnnonces(userId: number): void {
    this.userService.getUserAnnonces(userId).subscribe({
      next: (annonces) => {
        console.log('Annonces:', annonces);
        // Ajoutez ici la logique pour afficher les annonces
      },
      error: () => {
        alert('Erreur lors du chargement des annonces');
      }
    });
  }
}