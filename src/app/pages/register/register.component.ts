import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VehicleType } from '../../models/student-profile.model';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

interface RegistrationFormValue {
  fullName: string;
  email: string;
  studentCode: string;
  phone: string;
  program: string;
  semester: number;
  password: string;
  confirmPassword: string;
  vehiclePlate: string;
  vehicleType: VehicleType;
  acceptTerms: boolean;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly profiles = inject(ProfileService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);

  private readonly passwordsMatch: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmation = control.get('confirmPassword')?.value;
    return confirmation && password !== confirmation
      ? { passwordMismatch: true }
      : null;
  };

  readonly registerForm: FormGroup = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[A-Z0-9._%+-]+@(campusucc\.edu\.co|ucc\.edu\.co)$/i),
        ],
      ],
      studentCode: [
        '',
        [Validators.required, Validators.pattern(/^\d{6}$/)],
      ],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      program: ['', Validators.required],
      semester: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      vehiclePlate: ['', Validators.pattern(/^[A-Z0-9-]{5,8}$/i)],
      vehicleType: ['car', Validators.required],
      acceptTerms: [false, Validators.requiredTrue],
    },
    { validators: this.passwordsMatch }
  );

  isInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!control && control.invalid && control.touched;
  }

  /** Fuerza mayúsculas en la placa en tiempo real */
  toUpperPlate(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upper = input.value.toUpperCase();
    input.value = upper;
    this.registerForm.get('vehiclePlate')?.setValue(upper, { emitEvent: false });
  }

  /** Solo permite dígitos en el código estudiantil */
  onlyNumbers(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 6);
    input.value = digits;
    this.registerForm.get('studentCode')?.setValue(digits, { emitEvent: false });
  }

  hasPasswordMismatch(): boolean {
    return (
      this.registerForm.hasError('passwordMismatch') &&
      !!this.registerForm.get('confirmPassword')?.touched
    );
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMsg.set(null);
    const values = this.registerForm.getRawValue() as RegistrationFormValue;
    const email = values.email.trim().toLowerCase();
    const result = await this.auth.registerStudent(
      values.fullName,
      email,
      values.password
    );

    if (result !== 'created') {
      this.errorMsg.set(
        result === 'email-exists'
          ? 'Ya existe una cuenta con este correo institucional.'
          : 'No se pudo guardar la cuenta en este navegador. Inténtalo de nuevo.'
      );
      this.loading.set(false);
      return;
    }

    this.profiles.registerStudentProfile({
      email,
      name: values.fullName,
      code: values.studentCode,
      phone: values.phone,
      program: values.program,
      semester: Number(values.semester),
      vehiclePlate: values.vehiclePlate,
      vehicleType: values.vehicleType,
    });

    await this.router.navigate(['/parking']);
  }
}
