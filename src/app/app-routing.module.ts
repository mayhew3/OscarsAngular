import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CategoriesComponent} from './components/categories/categories.component';
import {NomineesComponent} from './components/nominees/nominees.component';

const routes: Routes = [
  { path: 'categories', component: CategoriesComponent },
  { path: '', redirectTo: '/categories', pathMatch: 'full'},
  { path: 'categories/:category_id', component: NomineesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
