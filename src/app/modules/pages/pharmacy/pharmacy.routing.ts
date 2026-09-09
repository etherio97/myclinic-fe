import { Route } from '@angular/router';

export const pharmRoutes: Route[] = [
    {
        path: 'items',
        loadChildren: () =>
            import('./pharm-item/pharm-item.module').then(
                (m) => m.PharmItemModule,
            ),
    },
    {
        path: 'purchases',
        loadChildren: () =>
            import('./pharm-purchase/pharm-purchase.module').then(
                (m) => m.PharmPurchaseModule,
            ),
    },
    {
        path: 'receipts',
        loadChildren: () =>
            import('./pharm-receipt/pharm-receipt.module').then(
                (m) => m.PharmReceiptModule,
            ),
    },
];
