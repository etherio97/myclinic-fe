import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { laboratoryRoutes } from './laboratory.routing';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MY_DATE_FORMATS } from 'app/app.config';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { TranslocoModule } from '@ngneat/transloco';
import { NewRequisitionComponent } from './new-requisition/new-requisition.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {
    NGX_MAT_DATE_FORMATS,
    NGX_MAT_NATIVE_DATE_FORMATS,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxNativeDateModule,
} from '@angular-material-components/datetime-picker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { LabResultEntryComponent } from './lab-result-entry/lab-result-entry.component';
import { LabInputItemComponent } from './components/lab-input-item/lab-input-item.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { LabReportDetailComponent } from './lab-report-detail/lab-report-detail.component';
import { PrintResultComponent } from './components/print-result/print-resultcomponent';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FuseAlertModule } from '@fuse/components/alert/public-api';
import { LabItemListComponent } from './lab-item-list/lab-item-list.component';
import { CreateLabItemComponent } from './create-lab-item/create-lab-item.component';
import { EditLabItemComponent } from './edit-lab-item/edit-lab-item.component';
import { LabOrderListComponent } from './lab-order-list/lab-order-list.component';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { EditRequisitionComponent } from './edit-requisition/edit-requisition.component';
import { LabResultListComponent } from './lab-result-list/lab-result-list.component';
import { LabResultEditComponent } from './lab-result-edit/lab-result-edit.component';

@NgModule({
    declarations: [
        LabInputItemComponent,
        LabReportDetailComponent,
        PrintResultComponent,
        LabItemListComponent,
        CreateLabItemComponent,
        EditLabItemComponent,
        LabOrderListComponent,
        NewRequisitionComponent,
        EditRequisitionComponent,
        LabResultListComponent,
        LabResultEntryComponent,
        LabResultEditComponent,
    ],
    imports: [
        RouterModule.forChild(laboratoryRoutes),
        SharedModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatSelectModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        FormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatDialogModule,
        MatCheckboxModule,
        TranslocoModule,
        NgxMatDatetimePickerModule,
        NgxMatTimepickerModule,
        NgxNativeDateModule,
        MatDatepickerModule,
        MatMomentDateModule,
        MatExpansionModule,
        MatSlideToggleModule,
        FuseAlertModule,
    ],
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
        {
            provide: NGX_MAT_DATE_FORMATS,
            useValue: NGX_MAT_NATIVE_DATE_FORMATS,
        },
    ],
})
export class LaboratoryModule {}
