import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(private fb: FormBuilder){}


}
