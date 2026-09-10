import { Route } from '@angular/router';
import { ListReceiptComponent } from './list-receipt/list-receipt.component';
import { CreateReceiptComponent } from './create-receipt/create-receipt.component';
import { ViewReceiptComponent } from './view-receipt/view-receipt.component';
import { EditReceiptComponent } from './edit-receipt/edit-receipt.component';
import { CreateReceiptMobileComponent } from './create-receipt-mobile/create-receipt-mobile.component';

export const pharmReceiptRoutes: Route[] = [
    {
        path: '',
        component: ListReceiptComponent,
    },
    {
        path: 'create',
        component: CreateReceiptComponent,
    },
    {
        path: 'create-mobile',
        component: CreateReceiptMobileComponent,
    },
    {
        path: 'create/:patientId',
        component: CreateReceiptComponent,
    },
    {
        path: 'edit/:id',
        component: EditReceiptComponent,
    },
    {
        path: 'view/:id',
        component: ViewReceiptComponent,
    },
];
