import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { receiptRoutes } from './receipt.routing';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatSelectModule } from '@angular/material/select';
import { ListReceiptComponent } from './list-receipt/list-receipt.component';
import { CreateReceiptComponent } from './create-receipt/create-receipt.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReceiptItemComponent } from './components/receipt-item/receipt-item.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ViewReceiptComponent } from './view-receipt/view-receipt.component';
import {
    NGX_MAT_DATE_FORMATS,
    NGX_MAT_NATIVE_DATE_FORMATS,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxNativeDateModule,
} from '@angular-material-components/datetime-picker';

@NgModule({
    declarations: [
        ListReceiptComponent,
        CreateReceiptComponent,
        ReceiptItemComponent,
        ViewReceiptComponent,
    ],
    imports: [
        RouterModule.forChild(receiptRoutes),
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
    ],
})
export class ReceiptModule {}
