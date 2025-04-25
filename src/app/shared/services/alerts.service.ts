import Swal from 'sweetalert2';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class AlertService {

  success(title: string, text?: string) {
    return Swal.fire({
      icon: 'success',
      title: title,
      text: text || '',
      timer: 2000,
      showConfirmButton: false
    });
  }

  error(title: string, text?: string) {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: text || '',
      timer: 2000,
      showConfirmButton: false
    });
  }

  confirm(title: string, text?: string) {
    return Swal.fire({
      title: title,
      text: text || '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar'
    });
    // showCancelButton: true,
    //     confirmButtonColor: '#3085d6',
    //     cancelButtonColor: '#d33',
  }
}
