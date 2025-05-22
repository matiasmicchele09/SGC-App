import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  public isShowPass: boolean = false;
  public isShowPassConfirm: boolean = false;
  public pristineProfile: boolean = false;
  public pristineAccount: boolean = false;
  public originalData: any;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private userService: UserService,
              private alertService: AlertService ){}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(){
    this.authService.getUser(this.authService.user!.id_user)
      .subscribe((user) => {
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

  areAllFieldsPristine(form: 'profile' | 'account'): boolean {
    const controls = form === 'profile' ? this.profileForm.controls : this.accountForm.controls;
    return Object.keys(controls).every(control => controls[control].pristine);
  }

  isValidField(field: string, form: 'profile' | 'account'): boolean | null{
    const controls = form === 'profile' ? this.profileForm.controls : this.accountForm.controls;
    return controls[field].errors && controls[field].touched;
  }

  getFieldError(field:string,  form: 'profile' | 'account'):string | null {
    let errors: any;
    const controls = form === 'profile' ? this.profileForm.controls : this.accountForm.controls;

    if (!controls[field]) return null;
    errors = controls[field].errors || {};

    for (const key of Object.keys(errors)) {
      switch(key){
        case 'required':
          return 'Este campo es requerido';
        case 'notEqual':
          return 'Las contraseñas no coinciden';
      }
    }
    return null;
  }

  checkPassword(){
    const password = this.accountForm.get('password')?.value;
    const passwordConfirm = this.accountForm.get('passwordConfirm')?.value;

    if (password !== passwordConfirm){
      this.accountForm.get('passwordConfirm')?.setErrors({notEqual: true});
      this.accountForm.get('password')?.setErrors({notEqual: true});
    }
    else{
      this.accountForm.get('passwordConfirm')?.setErrors(null);
      this.accountForm.get('password')?.setErrors(null);
    }
  }

  showPass(inputPassRef: string, inputelement: HTMLInputElement){
    if (inputPassRef === 'password'){
      this.isShowPass = !this.isShowPass;
      inputelement.type = this.isShowPass ? 'text' : 'password';
    }
    else if (inputPassRef === 'passwordConfirm'){
      this.isShowPassConfirm = !this.isShowPassConfirm;
      inputelement.type = this.isShowPassConfirm ? 'text' : 'password';
    }
  }

  onEdit(form:'profile' | 'account'){
    console.log(form);
    const pristineCheck = form === 'profile' ? 'pristineProfile' : 'pristineAccount';
    const isEditFlag = form === 'profile' ? 'isEditProfile' : 'isEditAccount';
    const formGroup = form === 'profile' ? 'profileForm' : 'accountForm';
    const titleButton = form === 'profile' ? 'titleButtonProfile' : 'titleButtonAccount';

    console.log(this[isEditFlag]);
    this[isEditFlag] = !this[isEditFlag];

    if (this[isEditFlag]){
      this[pristineCheck] = false
      Object.keys(this[formGroup].controls).forEach((key) => {
        this[formGroup].get(key)?.enable();
      })
      this[titleButton] = 'Cancelar';
    } else {
      this[formGroup].patchValue(this.originalData);
      Object.keys(this[formGroup].controls).forEach((key) => {
        this[formGroup].get(key)?.disable();
        this[titleButton] = 'Editar';
      })
    }
  }

  onSubmit(form: 'profile' | 'account') {
    const isProfile = form === 'profile';
    const formGroup = isProfile ? this.profileForm : this.accountForm;
    const pristineCheck = isProfile ? this.areAllFieldsPristine('profile') : this.areAllFieldsPristine('account');
    const pristineFlag = isProfile ? 'pristineProfile' : 'pristineAccount';
    const isEditFlag = isProfile ? 'isEditProfile' : 'isEditAccount';
    const titleButton = isProfile ? 'titleButtonProfile' : 'titleButtonAccount';
    const confirmMessage = isProfile ? '¿Desea modificar sus datos de perfil?' : '¿Desea modificar sus datos de cuenta?';

    formGroup.markAllAsTouched();

    if (formGroup.invalid) return;

    if (pristineCheck) {
      this[pristineFlag] = true;
      return;
    } else this[pristineFlag] = false;

    this.alertService.confirm(confirmMessage, '')
      .then(result =>{
        if (result.isConfirmed){
          const userId = this.authService.user!.id_user;
          const formData = formGroup.value

          this.userService.updateUser(userId, formData)
            .subscribe({
              next: (res) => {
                console.log(res);
                this.authService.setUser(res);
                this.alertService.success('Datos actualizados correctamente');
                this[isEditFlag] = false;
                this[titleButton] = 'Editar';
                this.loadProfile();
              },
              error: (err) => {
                console.log(err);
                this.alertService.error('Error al actualizar los datos');
              },
              complete: () => {
                console.log("complete");
              }
            })
        }
      })
  }
}
