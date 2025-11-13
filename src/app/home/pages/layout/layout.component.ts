import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent {
  constructor(private authService: AuthService) {}

  // home/pages/layout/layout.component.ts
  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe();
  }
}
