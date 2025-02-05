import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {

  public formLogin: FormGroup = this.fb.group({
    email:[],
    pass:[]
  })

  constructor(private fb: FormBuilder){}


}
