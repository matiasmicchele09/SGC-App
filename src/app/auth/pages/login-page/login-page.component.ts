import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
 import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {

  public formLogin: FormGroup = this.fb.group({
    email:['', [Validators.required, Validators.email]],
    pass:['', [Validators.required, Validators.minLength(6)]]
  })

  constructor(private authService: AuthService,
    private fb: FormBuilder,
    private router: Router

  ){}

  onSubmit(){
    if(this.formLogin.invalid){
      this.formLogin.markAllAsTouched();
      return;
    }
    this.authService.login(this.formLogin.value.email, this.formLogin.value.pass)
    .subscribe({
      next: (resp) => {
        console.log("resp", resp);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.log(err.status);
        if (err.status === 404) {
          console.error("Error during login:", err.error.message);
          alert(err.error.message); // Muestra el mensaje de error al usuario
        } else if (err.status === 500) {
          console.error("Server error:", err.error.message);
          alert("Something went wrong; please try again later."); // Muestra un mensaje genérico de error al usuario
        } else {
          console.error("Unexpected error:", err);
          alert("An unexpected error occurred; please try again later."); // Muestra un mensaje genérico de error al usuario
        }
      }
    });
  }



}
