import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { AuthGuard } from './guards/auth.guard';

// Components
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { HomePageComponent } from './pages/dashboard-page/home-page/home-page.component';
import { MakeTransactionPageComponent } from './pages/dashboard-page/make-transaction-page/make-transaction-page.component';
import { CreateAccountComponent } from './pages/create-account/create-account.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login',
    children: [
      { path: 'signin', component: LoginPageComponent },
      { path: 'signup', component: LoginPageComponent },
      { path: '', redirectTo: 'signin', pathMatch: 'full' }
    ]
  },

  { path: 'dashboard', component: DashboardPageComponent, canActivate: [AuthGuard],
    children: [
      { path: 'home', component: HomePageComponent },
      { path: 'deposit', component: MakeTransactionPageComponent, data: { animation: 'deposit' } },
      { path: 'withdraw', component: MakeTransactionPageComponent, data: { animation: 'withdraw' } },
      { path: 'transfer', component: MakeTransactionPageComponent, data: { animation: 'transfer' } },
      { path: 'create-account', component: CreateAccountComponent, },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }