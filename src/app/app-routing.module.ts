import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CategoriesComponent} from './components/categories/categories.component';
import {NomineesComponent} from './components/nominees/nominees.component';

export const routes: Routes = [
  { path: 'categories', component: CategoriesComponent },
  { path: 'categories/:category_id', component: NomineesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
