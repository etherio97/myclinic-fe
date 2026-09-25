import { Route } from '@angular/router';
import { ListItemComponent } from './list-item/list-item.component';
import { EditItemComponent } from './edit-item/edit-item.component';
import { CreateMultipleItemComponent } from './create-multiple-item/create-multiple-item.component';

export const pharmItemRoutes: Route[] = [
    {
        path: '',
        component: ListItemComponent,
    },
    {
        path: 'create',
        component: CreateMultipleItemComponent,
    },
    {
        path: 'edit/:id',
        component: EditItemComponent,
    },
];
