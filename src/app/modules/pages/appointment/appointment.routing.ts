import { Route } from '@angular/router';
import { ListAppointmentComponent } from './list-appointment/list-appointment.component';
import { CreateAppointmentComponent } from './create-appointment/create-appointment.component';
import { EditAppointmentComponent } from './edit-appointment/edit-appointment.component';

export const appointmentRoutes: Route[] = [
    {
        path: '',
        component: ListAppointmentComponent,
    },
    {
        path: 'create',
        component: CreateAppointmentComponent,
    },
    {
        path: 'create/:patientId',
        component: CreateAppointmentComponent,
    },
    {
        path: 'edit/:id',
        component: EditAppointmentComponent,
    },
];
