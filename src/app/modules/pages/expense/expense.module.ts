import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { expenseRoutes } from './expense.routing';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatSelectModule } from '@angular/material/select';
import { ListExpenseComponent } from './list-expense/list-expense.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {
    NGX_MAT_DATE_FORMATS,
    NGX_MAT_NATIVE_DATE_FORMATS,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxNativeDateModule,
} from '@angular-material-components/datetime-picker';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from 'app/app.config';

@NgModule({
    declarations: [ListExpenseComponent],
    imports: [
        RouterModule.forChild(expenseRoutes),
        SharedModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        FormsModule,
        MatTableModule,
        MatDatepickerModule,
        MatMomentDateModule,
        MatSelectModule,
        MatAutocompleteModule,
        NgxMatDatetimePickerModule,
        NgxMatTimepickerModule,
        NgxNativeDateModule,
        MatPaginatorModule,
    ],
    providers: [
        {
            provide: NGX_MAT_DATE_FORMATS,
            useValue: NGX_MAT_NATIVE_DATE_FORMATS,
        },
        { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    ],
})
export class ExpenseModule {}
