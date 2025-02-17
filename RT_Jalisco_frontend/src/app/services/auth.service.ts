import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  logout(): void {
    localStorage.removeItem('user');
    console.log('Usuario deslogueado');
  }
}
