import { Route } from '@angular/router';
import { ListPurchaseComponent } from './list-purchase/list-purchase.component';
import { EditPurchaseComponent } from './edit-purchase/edit-purchase.component';
import { CreateMultiplePurchaseComponent } from './create-multiple-purchase/create-multiple-purchase.component';

export const pharmPurchaseRoutes: Route[] = [
    {
        path: '',
        component: ListPurchaseComponent,
    },
    {
        path: 'create',
        component: CreateMultiplePurchaseComponent,
    },
    {
        path: 'edit/:id',
        component: EditPurchaseComponent,
    },
];
