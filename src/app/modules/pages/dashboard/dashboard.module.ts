import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { DashboardComponent } from './dashboard.component';
import { dashboardRoutes } from './dashboard.routing';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ManagerDashboardComponent } from './components/manager-dashboard/manager-dashboard.component';

@NgModule({
    declarations: [
        DashboardComponent,
        AdminDashboardComponent,
        ManagerDashboardComponent,
    ],
    imports: [
        RouterModule.forChild(dashboardRoutes),
        SharedModule,
        MatIconModule,
        MatButtonModule,
    ],
})
export class DashboardModule {}
