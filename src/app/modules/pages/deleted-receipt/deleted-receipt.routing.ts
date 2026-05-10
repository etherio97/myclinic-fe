import { Route } from '@angular/router';
import { ListDeletedReceiptComponent } from './list-deleted-receipt/list-deleted-receipt.component';
import { ViewDeletedReceiptComponent } from './view-deleted-receipt/view-deleted-receipt.component';

export const deletedReceiptRoutes: Route[] = [
    {
        path: '',
        component: ListDeletedReceiptComponent,
    },
    {
        path: 'view/:id',
        component: ViewDeletedReceiptComponent,
    },
];
