import { Component } from '@angular/core';
import { User } from 'src/app/auth/interfaces/user.interface';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {


  //authService: AuthService;

  constructor(private authService:AuthService) {
    this.authService = authService;
    console.log("en el constructor del sidebar");
    console.log(authService.user);
  }

  get user(){
    return this.authService.user;
  }


}
