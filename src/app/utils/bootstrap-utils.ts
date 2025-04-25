import { ElementRef } from '@angular/core';

export function closeBootstrapModal(ref: ElementRef): void {
  const modalEl = ref.nativeElement;

  if (!modalEl) return;

  // Ocultar el modal
  modalEl.classList.remove('show');
  modalEl.style.display = 'none';
  modalEl.setAttribute('aria-hidden', 'true');
  modalEl.removeAttribute('aria-modal');

  // Quitar clase del body
  document.body.classList.remove('modal-open');

  // Eliminar el backdrop
  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) {
    backdrop.remove();
  }
}
