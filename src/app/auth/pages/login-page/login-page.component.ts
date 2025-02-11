import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
 import { AuthService } from '../../services/auth.service';

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
    private fb: FormBuilder

  ){}

  onSubmit(){


    if(this.formLogin.invalid){
      this.formLogin.markAllAsTouched();
      return;
    }
    this.authService.login(this.formLogin.value.email, this.formLogin.value.pass)
    .subscribe(resp => {
      console.log("resp",resp);
    });
    //console.log(this.formLogin.value);
  }



}
