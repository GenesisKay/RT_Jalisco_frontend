import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Asegúrate de importar FormsModule
import { Router } from '@angular/router';  // Importa Router

@Component({
  selector: 'app-login',
  standalone: true,  // Asegúrate de que sea un componente standalone
  imports: [CommonModule, FormsModule],  // Importa FormsModule y CommonModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private router: Router) {}  // Inyecta Router

  onLogin() {
    if (this.username === 'admin' && this.password === 'password') {
      alert('Login successful!');
      this.router.navigate(['/dashboard']);  // Redirige al dashboard
    } else {
      alert('Invalid credentials!');
    }
  }
}