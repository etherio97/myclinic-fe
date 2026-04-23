import { Route } from '@angular/router';
import { ListReceiptComponent } from './list-receipt/list-receipt.component';
import { CreateReceiptComponent } from './create-receipt/create-receipt.component';
import { ViewReceiptComponent } from './view-receipt/view-receipt.component';

export const receiptRoutes: Route[] = [
    {
        path: '',
        component: ListReceiptComponent,
    },
    {
        path: 'create',
        component: CreateReceiptComponent,
    },
    {
        path: 'create/:patientId',
        component: CreateReceiptComponent,
    },
    {
        path: 'view/:id',
        component: ViewReceiptComponent,
    },
];
