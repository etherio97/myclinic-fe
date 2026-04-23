import { Route } from '@angular/router';
import { ListDoctorComponent } from './list-doctor/list-doctor.component';
import { CreateDoctorComponent } from './create-doctor/create-doctor.component';
import { EditDoctorComponent } from './edit-doctor/edit-doctor.component';
import { ViewDoctorComponent } from './view-doctor/view-doctor.component';

export const doctorRoutes: Route[] = [
    {
        path: '',
        component: ListDoctorComponent,
    },
    {
        path: 'create',
        component: CreateDoctorComponent,
    },
    {
        path: 'edit/:id',
        component: EditDoctorComponent,
    },
    {
        path: 'view/:id',
        component: ViewDoctorComponent,
    },
];
