import { Route } from '@angular/router';
import { ListPurchaseComponent } from './list-purchase/list-purchase.component';
import { CreatePurchaseComponent } from './create-purchase/create-purchase.component';
import { EditPurchaseComponent } from './edit-purchase/edit-purchase.component';

export const pharmPurchaseRoutes: Route[] = [
    {
        path: '',
        component: ListPurchaseComponent,
    },
    {
        path: 'create',
        component: CreatePurchaseComponent,
    },
    {
        path: 'edit/:id',
        component: EditPurchaseComponent,
    },
];
