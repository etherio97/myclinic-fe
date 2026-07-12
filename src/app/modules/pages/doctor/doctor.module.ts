import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { doctorRoutes } from './doctor.routing';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatSelectModule } from '@angular/material/select';
import { ListDoctorComponent } from './list-doctor/list-doctor.component';
import { CreateDoctorComponent } from './create-doctor/create-doctor.component';
import { EditDoctorComponent } from './edit-doctor/edit-doctor.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ViewDoctorComponent } from './view-doctor/view-doctor.component';
import { MY_DATE_FORMATS } from 'app/app.config';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { TranslocoModule } from '@ngneat/transloco';

@NgModule({
    declarations: [
        ListDoctorComponent,
        CreateDoctorComponent,
        EditDoctorComponent,
        ViewDoctorComponent,
    ],
    imports: [
        RouterModule.forChild(doctorRoutes),
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
        MatPaginatorModule,
        TranslocoModule,
    ],
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class DoctorModule {}
