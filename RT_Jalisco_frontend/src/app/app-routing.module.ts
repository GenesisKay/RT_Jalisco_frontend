import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component'; // Importa el componente login

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' } // Redirige a la ruta login si la ruta está vacía
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],  // Esto inicializa las rutas
    exports: [RouterModule]
  })
  export class AppRoutingModule { }
