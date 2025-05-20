import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'SGC-App';


  constructor(private authService: AuthService) {
    // this.authService.getCurrentUser().subscribe(user => {
    //   console.log("user", user);
    //   this.authService.user = user;
    // });
  }

  ngOnInit(): void {
  // this.authService.getCurrentUser().subscribe(user => {
  //   console.log("Usuario actual:", user);
  //   //this.authService._user = user;
  // });
}

}
