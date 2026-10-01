import { NgModule } from '@angular/core';
import { ReceiptItemComponent } from './components/receipt-item/receipt-item.component';
import { CreatePatientModalComponent } from './components/create-patient-modal/create-patient-modal.component';
import { SharedModule } from 'app/shared/shared.module';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatSelectModule } from '@angular/material/select';
import {
    NGX_MAT_DATE_FORMATS,
    NGX_MAT_NATIVE_DATE_FORMATS,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxNativeDateModule,
} from '@angular-material-components/datetime-picker';
import { TranslocoModule } from '@ngneat/transloco';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from 'app/app.config';

@NgModule({
    declarations: [ReceiptItemComponent, CreatePatientModalComponent],
    imports: [
        SharedModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatMomentDateModule,
        MatSelectModule,
        NgxMatDatetimePickerModule,
        NgxMatTimepickerModule,
        NgxNativeDateModule,
        TranslocoModule,
    ],
    providers: [
        {
            provide: NGX_MAT_DATE_FORMATS,
            useValue: NGX_MAT_NATIVE_DATE_FORMATS,
        },
        { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    ],
    exports: [CreatePatientModalComponent, ReceiptItemComponent],
})
export class ReceiptSharedModule {}
