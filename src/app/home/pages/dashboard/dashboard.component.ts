import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/auth/interfaces/user.interface';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  public user : User | null = null;

  constructor(private authService: AuthService) {

this.authService.getUser(this.authService.user!.id_user).subscribe(user => {
                  //console.log("user", user);
                  this.user = user;
                })  }
  // OnInit(): void {
  //   this.authService
  // }
}
