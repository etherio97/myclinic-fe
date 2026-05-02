import { Route } from '@angular/router';
import { ListCashflowComponent } from './list-cashflow/list-cashflow.component';

export const cashflowRoutes: Route[] = [
    {
        path: '',
        component: ListCashflowComponent,
    },
];
