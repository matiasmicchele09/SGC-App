import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/services/auth.service';
import { UserService } from 'src/app/auth/services/user.service';
import { AlertService } from 'src/app/shared/services/alerts.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  public profileForm: FormGroup = this.fb.group({
    name: ['',Validators.required],
    surname: ['',Validators.required],
  })

  public accountForm: FormGroup = this.fb.group({
    email: ['',Validators.required],
    password: [''],
    passwordConfirm: [''],
  })

  public titleButtonProfile: string = 'Editar';
  public titleButtonAccount: string = 'Editar';
  public isEditProfile: boolean = false;
  public isEditAccount: boolean = false;
  public originalData: any;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private userService: UserService,
              private alertService: AlertService ){}

  ngOnInit(): void {
    this.authService.getUser(this.authService.user!.id_user).subscribe((user) => {
      console.log(user);
      this.profileForm.patchValue({
        name: user.name,
        surname: user.surname
      })

      this.originalData = {
        name: user.name,
        surname: user.surname,
        email: user.email
      }


      this.profileForm.get('name')?.disable();
      this.profileForm.get('surname')?.disable();

      this.accountForm.patchValue({
        email: user.email
      });
      this.accountForm.get('email')?.disable();
      this.accountForm.get('password')?.disable();
      this.accountForm.get('passwordConfirm')?.disable();

    })


  }

  onEdit(form:string){
    if (form === 'profile'){
      this.isEditProfile = !this.isEditProfile;

      if(this.isEditProfile){
        this.profileForm.get('name')?.enable();
        this.profileForm.get('surname')?.enable();
        this.titleButtonProfile = 'Cancelar';
      }
      else{
        this.profileForm.reset({
          name: this.originalData.name,
          surname: this.originalData.surname
          });

          this.profileForm.get('name')?.disable();
          this.profileForm.get('surname')?.disable();
          this.titleButtonProfile = 'Editar';
      }
    }
    else if (form === 'account'){
      this.isEditAccount = !this.isEditAccount;

      if(this.isEditAccount){
        this.accountForm.get('email')?.enable();
        this.accountForm.get('password')?.enable();
        this.accountForm.get('passwordConfirm')?.enable();
        this.titleButtonAccount = 'Cancelar';
      }
      else{
        this.accountForm.reset({
          email: this.originalData.email
        });

        this.accountForm.get('email')?.disable();
        this.accountForm.get('password')?.disable();
        this.accountForm.get('passwordConfirm')?.disable();
        this.titleButtonAccount = 'Editar';
      }
    }
  }

  // areAllFieldsPristine(): boolean {
  //   const controls = this.profileForm.controls;
  //   return controls['name'].pristine &&
  //          controls['surname'].pristine &&
  //          controls['email'].pristine &&
  //          controls['phone'].pristine &&
  //          controls['cuit'].pristine &&
  //          controls['activity'].pristine &&
  //          controls['city'].pristine;
  // }

  isValidField(field: string, form:string): boolean | null{

    if (form === 'profile'){
      return this.profileForm.controls[field].errors &&
             this.profileForm.controls[field].touched
    }
    else if (form === 'account'){
      return this.accountForm.controls[field].errors &&
             this.accountForm.controls[field].touched
    }
    return null;
  }

  getFieldError(field:string,  form:string):string | null {
    let errors: any;
    if (form === 'profile'){
      if (!this.profileForm.controls[field]) return null;
      errors = this.profileForm.controls[field].errors || {};
    }
    else if (form === 'account'){
      if (!this.accountForm.controls[field]) return null;
      errors = this.accountForm.controls[field].errors || {};

    }

    for (const key of Object.keys(errors)) {

      switch(key){
        case 'required':
          return 'Este campo es requerido';

        // case 'minlength':
        //   return `Mínimo ${errors['minlength'].requiredLength} caracteres`
      }
    }
    return null;
  }


  onSubmit(form:string){
    if (form === 'profile'){

      this.alertService.confirm('¿Desea modificar sus datos de perfil?', '')
      .then((result) => {
        if (result.isConfirmed) {
          console.log(this.authService.user!.id_user);
          console.log(this.profileForm.value);
          this.userService.updateUser(this.authService.user!.id_user, this.profileForm.value)
            .subscribe({
              next: (res) => {
                console.log(res);
                this.authService.setUser(res);
                this.alertService.success('Datos actualizados correctamente');
                this.isEditProfile = false;
                this.titleButtonProfile = 'Editar';


              },
              error: (err) => {
                console.log(err);
                this.alertService.error('Error al actualizar los datos');
              }, complete: () => {
              console.log("complete");
            }
          })
        } else if (result.isDismissed) {

        }
      })


      // this.authService.updateUser(this.profileForm.value).subscribe((res) => {
      //   console.log(res);
      //   this.isEditProfile = false;
      //   this.titleButtonProfile = 'Editar';
      // })
    }
    else if (form === 'account'){
      // this.authService.updateUser(this.accountForm.value).subscribe((res) => {
      //   console.log(res);
      //   this.isEditAccount = false;
      //   this.titleButtonAccount = 'Editar';
      // })
    }

  }


}
