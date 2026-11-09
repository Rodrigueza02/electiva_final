import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb     = inject(FormBuilder);

  readonly loginForm: FormGroup = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  readonly showPassword = signal(false);
  readonly errorMsg     = signal<string | null>(null);
  readonly loading      = signal(false);

  // Stats shown on the left hero panel
  readonly stats = [
    { value: '10',    label: 'Espacios en tiempo real' },
    { value: 'MQTT',  label: 'Conexión IoT activa' },
    { value: '2026',  label: 'Comunidad UCC' },
    { value: '↓ Verde', label: 'Huella CO₂' },
  ];

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  isInvalid(field: string): boolean {
    const c = this.loginForm.get(field);
    return !!(c && c.invalid && c.touched);
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set(null);

    // Simulate a brief async check
    await new Promise((r) => setTimeout(r, 400));

    const { email, password } = this.loginForm.value as { email: string; password: string };
    const ok = await this.auth.login(email, password);

    if (ok) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMsg.set('Correo o contraseña incorrectos');
      this.loading.set(false);
    }
  }
}
