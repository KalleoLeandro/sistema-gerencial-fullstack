import { Component } from '@angular/core';
import { Routes } from '@angular/router';
@Component({ standalone: true, template: '<h1>Sistema Gerencial</h1><p>Estrutura inicial da aplicação.</p>' })
class InicioComponent {}
export const routes: Routes = [{ path: '', component: InicioComponent }, { path: '**', redirectTo: '' }];
