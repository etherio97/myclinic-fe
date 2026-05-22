import { Route } from '@angular/router';
import { ListExpenseComponent } from './list-expense/list-expense.component';

export const expenseRoutes: Route[] = [
    {
        path: '',
        component: ListExpenseComponent,
    },
];
