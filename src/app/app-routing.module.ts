import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CategoriesComponent} from './components/categories/categories.component';
import {NomineesComponent} from './components/nominees/nominees.component';
import {CallbackComponent} from './components/callback/callback.component';

export const routes: Routes = [
  { path: 'callback', component: CallbackComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'categories/:category_id', component: NomineesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
