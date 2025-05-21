import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/auth/interfaces/user.interface';
import { AuthService } from 'src/app/auth/services/auth.service';
//import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {


  public user : User | null = null;

  constructor(private authService:AuthService,
              private router: Router) {
                // console.log(this.user);
                // this.authService.getUser(this.user!.id).subscribe(user => {
                //   console.log("user", user);
                //   //this.authService.user = user;
                // });

                //console.log(this.authService.user?.id_user);
                this.authService.getUser(this.authService.user!.id_user).subscribe(user => {
                  //console.log("user", user);
                  this.user = user;
                })
              }

  onLogout(){

    this.authService.logout();
    this.router.navigate(['/auth/login']);

  }

}
