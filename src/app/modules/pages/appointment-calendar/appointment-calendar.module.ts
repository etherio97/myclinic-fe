import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { appointmentCalendarRoutes } from './appointment-calendar.routing.module';
import { AppointmentCalendarComponent } from './appointment-calendar.component';
import { FullCalendarModule } from '@fullcalendar/angular';

@NgModule({
    declarations: [AppointmentCalendarComponent],
    imports: [
        RouterModule.forChild(appointmentCalendarRoutes),
        SharedModule,
        MatIconModule,
        MatButtonModule,
        FullCalendarModule,
    ],
})
export class AppointmentCalendarModule {}
