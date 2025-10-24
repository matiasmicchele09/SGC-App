import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  process({
    title,
    text,
    timer,
    showCancelButton = false,
    showConfirmButton = false,
    allowOutsideClick = false,
    allowEscapeKey = false,
    allowEnterKey = false,
  }: {
    title?: string;
    text?: string;
    timer?: number;
    showCancelButton?: boolean;
    showConfirmButton?: boolean;
    allowOutsideClick?: boolean;
    allowEscapeKey?: boolean;
    allowEnterKey?: boolean;
  } = {}) {
    Swal.fire({
      title: title,
      text: text,
      timerProgressBar: true,
      allowOutsideClick: allowOutsideClick,
      allowEscapeKey: allowEscapeKey,
      allowEnterKey: allowEnterKey,
      showConfirmButton: showConfirmButton,
      customClass: {
        popup: 'process-popup',
        loader: 'swal-loader-previnca',
        title: 'swal-title-previnca',
        htmlContainer: 'swal-text-previnca',
      },
      buttonsStyling: false, //por default es TRUE, y lo que hace es agregarle el estilo predeterminados al modal. Por eso esta en FALSE
      didOpen: () => {
        Swal.showLoading(); // <-- acá va el spinner
      },
    });

    return {
      close: () => Swal.close(),
      // update: (updateOpts: SweetAlertOptions) => Swal.update(updateOpts),
      // isOpen: () => Swal.isVisible(),
    };
  }

  success({
    title,
    text,
    timer,
    showCancelButton = false,
    showConfirmButton = false,
    allowOutsideClick = false,
    allowEscapeKey = false,
    allowEnterKey = false,
  }: {
    title?: string;
    text?: string;
    timer?: number;
    showCancelButton?: boolean;
    showConfirmButton?: boolean;
    allowOutsideClick?: boolean;
    allowEscapeKey?: boolean;
    allowEnterKey?: boolean;
  } = {}) {
    return Swal.fire({
      icon: 'success',
      title: title,
      text: text || '',
      timer: timer,
      allowOutsideClick: allowOutsideClick,
      allowEscapeKey: allowEscapeKey,
      allowEnterKey: allowEnterKey,
      showConfirmButton: showConfirmButton,
      showCancelButton: showCancelButton,
      customClass: {
        popup: 'success-popup',
        title: 'swal-title-alert',
        htmlContainer: 'swal-text-alert',
      },
      buttonsStyling: false,
    });
  }

  error({
    title,
    text,
    timer,
    showCancelButton = false,
    showConfirmButton = false,
    allowOutsideClick = false,
    allowEscapeKey = false,
    allowEnterKey = false,
  }: {
    title?: string;
    text?: string;
    timer?: number;
    showCancelButton?: boolean;
    showConfirmButton?: boolean;
    allowOutsideClick?: boolean;
    allowEscapeKey?: boolean;
    allowEnterKey?: boolean;
  } = {}) {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: text || '',
      timer: timer,
      allowOutsideClick: allowOutsideClick,
      allowEscapeKey: allowEscapeKey,
      allowEnterKey: allowEnterKey,
      showConfirmButton: showConfirmButton,
      showCancelButton: showCancelButton,
      customClass: {
        popup: 'error-popup',
        title: 'swal-title-alert',
        htmlContainer: 'swal-text-alert',
      },
      buttonsStyling: false,
    });
  }

  confirm({
    title,
    text,
    timer,
    showCancelButton = false,
    showConfirmButton = false,
    allowOutsideClick = false,
    allowEscapeKey = false,
    allowEnterKey = false,
    confirmButtonText,
    cancelButtonText,
  }: {
    title?: string;
    text?: string;
    timer?: number;
    showCancelButton?: boolean;
    showConfirmButton?: boolean;
    allowOutsideClick?: boolean;
    allowEscapeKey?: boolean;
    allowEnterKey?: boolean;
    confirmButtonText?: string;
    cancelButtonText?: string;
  } = {}) {
    return Swal.fire({
      title: title,
      text: text || '',
      icon: 'warning',
      timer: timer,
      showConfirmButton: showConfirmButton,
      allowOutsideClick: allowOutsideClick,
      allowEscapeKey: allowEscapeKey,
      allowEnterKey: allowEnterKey,
      confirmButtonText: confirmButtonText,
      showCancelButton: showCancelButton,
      cancelButtonText: cancelButtonText,
      customClass: {
        popup: 'warning-popup',
        title: 'swal-title-alert',
        htmlContainer: 'swal-text-alert',
        confirmButton: 'swal-btn-confirm',
        cancelButton: 'swal-btn-cancel',
      },
      buttonsStyling: false,
    });
  }
}
