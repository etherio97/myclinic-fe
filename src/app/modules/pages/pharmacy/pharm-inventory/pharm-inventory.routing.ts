import { Route } from '@angular/router';
import { ListInventoryComponent } from './list-inventory/list-inventory.component';

export const pharmInventoryRoutes: Route[] = [
    {
        path: '',
        component: ListInventoryComponent,
    },
];
