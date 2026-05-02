import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { cashflowRoutes } from './cashflow.routing';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatSelectModule } from '@angular/material/select';
import { ListCashflowComponent } from './list-cashflow/list-cashflow.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
    declarations: [ListCashflowComponent],
    imports: [
        RouterModule.forChild(cashflowRoutes),
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
        MatPaginatorModule,
    ],
})
export class CashflowModule {}
