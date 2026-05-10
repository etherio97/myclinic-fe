import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { DashboardComponent } from './dashboard.component';
import { dashboardRoutes } from './dashboard.routing';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ManagerDashboardComponent } from './components/manager-dashboard/manager-dashboard.component';
import { DisplayItemComponent } from './components/display-item/display-item.component';
import { MY_DATE_FORMATS } from 'app/app.config';
import { MAT_DATE_FORMATS } from '@angular/material/core';

@NgModule({
    declarations: [
        DashboardComponent,
        AdminDashboardComponent,
        ManagerDashboardComponent,
        DisplayItemComponent,
    ],
    imports: [
        RouterModule.forChild(dashboardRoutes),
        SharedModule,
        MatIconModule,
        MatButtonModule,
    ],
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class DashboardModule {}
