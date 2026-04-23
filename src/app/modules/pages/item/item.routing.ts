import { Route } from '@angular/router';
import { ListItemComponent } from './list-item/list-item.component';
import { CreateItemComponent } from './create-item/create-item.component';
import { EditItemComponent } from './edit-item/edit-item.component';

export const itemRoutes: Route[] = [
    {
        path: '',
        component: ListItemComponent,
    },
    {
        path: 'create',
        component: CreateItemComponent,
    },
    {
        path: 'edit/:id',
        component: EditItemComponent,
    },
];
