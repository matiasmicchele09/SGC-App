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
    email:['', [Validators.required]],
    pass:['', [Validators.required]]
  })
  public statusError: boolean = false;
  public messageError: string = '';
  public loading: boolean = false;

  constructor(private authService: AuthService,
    private fb: FormBuilder,
    private router: Router

  ){}

  isValidField( field:string ):boolean | null {

    //console.log(this.formLogin.controls[field].errors);
    return this.formLogin.controls[field].errors &&
           this.formLogin.controls[field].touched
  }

  getFieldError(field:string ):string | null {
    if (!this.formLogin.controls[field]) return null;

    const errors = this.formLogin.controls[field].errors || {};

    //console.log(errors);
    for (const key of Object.keys(errors)) {

      switch(key){
        case 'required':
          return 'Este campo es requerido';
      }
    }
    return null;
  }

  onSubmit(){
    if(this.formLogin.invalid){
      this.formLogin.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.authService.login(this.formLogin.value.email, this.formLogin.value.pass)
    .subscribe({
      next: (resp) => {
        console.log("resp", resp);
        this.loading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        this.loading = false;
        console.log('HttpErrorResponse:', err);
        console.log('Status:', err.status);
        console.log('Error body:', err.error);
        if (err.status === 401 || err.status === 404) {
          console.error("Error during login:", err.error.message);
          this.statusError = true;
          this.messageError = err.error.message;
          //alert(err.error.message); // Muestra el mensaje de error al usuario
        } else if (err.status === 500) {
          console.error("Server error:", err.error.message);
          alert("Something went wrong; please try again later."); // Muestra un mensaje genérico de error al usuario
        } else {
          console.error("Unexpected error:", err.message);
          alert("An unexpected error occurred; please try again later."); // Muestra un mensaje genérico de error al usuario
        }
      }
    });
  }
}
