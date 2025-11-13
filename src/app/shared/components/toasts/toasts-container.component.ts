// src/app/shared/toasts-container/toasts-container.component.ts
import { Component, TemplateRef } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toasts',
  templateUrl: './toasts-container.component.html',
  styleUrls: ['./toasts-container.component.css'],
})
export class ToastsContainerComponent {
  constructor(public toastService: ToastService) {}
  isTemplate(value: string | TemplateRef<any>): value is TemplateRef<any> {
    // TemplateRef tiene createEmbeddedView, úsalo para detectar TemplateRef de forma fiable
    return !!(value && (value as TemplateRef<any>).createEmbeddedView);
  }
}
