import { Route } from '@angular/router';
import { ListPatientComponent } from './list-patient/list-patient.component';
import { CreatePatientComponent } from './create-patient/create-patient.component';
import { EditPatientComponent } from './edit-patient/edit-patient.component';
import { ViewPatientComponent } from './view-patient/view-patient.component';

export const patientRoutes: Route[] = [
    {
        path: '',
        component: ListPatientComponent,
    },
    {
        path: 'create',
        component: CreatePatientComponent,
    },
    {
        path: 'view/:id',
        component: ViewPatientComponent,
    },
    {
        path: 'edit/:id',
        component: EditPatientComponent,
    },
];
