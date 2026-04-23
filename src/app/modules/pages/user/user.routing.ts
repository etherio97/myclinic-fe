import { Route } from '@angular/router';
import { ListUserComponent } from './list-user/list-user.component';

export const userRoutes: Route[] = [
    {
        path: '',
        component: ListUserComponent,
    },
];
