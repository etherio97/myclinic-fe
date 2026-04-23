import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { patientRoutes } from './patient.routing';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListPatientComponent } from './list-patient/list-patient.component';
import { CreatePatientComponent } from './create-patient/create-patient.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatSelectModule } from '@angular/material/select';
import { EditPatientComponent } from './edit-patient/edit-patient.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ViewPatientComponent } from './view-patient/view-patient.component';

@NgModule({
    declarations: [
        ListPatientComponent,
        CreatePatientComponent,
        EditPatientComponent,
        ViewPatientComponent,
    ],
    imports: [
        RouterModule.forChild(patientRoutes),
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
    ],
})
export class PatientModule {}
