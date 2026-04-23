import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { APP_CONFIG, MY_DATE_FORMATS } from 'app/app.config';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { AppointmentService } from 'app/services/appointment.service';
import moment from 'moment';
import { PatientService } from 'app/services/patient.service';
import { DoctorService } from 'app/services/doctor.service';
import { map, Observable, startWith } from 'rxjs';
import { clone } from 'lodash';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
    selector: 'app-edit-appointment',
    templateUrl: './edit-appointment.component.html',
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class EditAppointmentComponent implements OnInit {
    formGroup!: FormGroup;

    doctors: any[] = [];

    patients: any[] = [];

    appointmentTypes = APP_CONFIG.APPOINTMENT_TYPES;

    appointmentCases = APP_CONFIG.APPOINTMENT_CASES;

    patientFilteredOptions!: Observable<string[]>;

    doctorFilteredOptions!: Observable<string[]>;

    referDoctorFilteredOptions!: Observable<string[]>;

    id!: string;

    constructor(
        private _appointmentService: AppointmentService,
        private _doctorService: DoctorService,
        private _patientService: PatientService,
        private _fb: FormBuilder,
        private _confirmService: FuseConfirmationService,
        private _router: Router,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            patient: ['', Validators.required],
            phoneNumber: ['', Validators.required],
            appointmentType: ['', Validators.required],
            appointmentCase: ['', Validators.required],
            doctor: [''],
            referDoctor: [''],
            appointmentDate: [moment(), Validators.required],
        });

        this.route.params.subscribe(({ id }) => {
            this.id = id;
            this._appointmentService.findById(id).subscribe((result: any) => {
                this.formGroup.controls.patient.setValue(result.patient || '');
                this.formGroup.controls.phoneNumber.setValue(
                    result.patient?.phoneNumber || '',
                );
                this.formGroup.controls.appointmentType.setValue(
                    result.appointmentType || '',
                );
                this.formGroup.controls.appointmentCase.setValue(
                    result.appointmentCase || '',
                );
                this.formGroup.controls.doctor.setValue(result.doctor || '');
                this.formGroup.controls.referDoctor.setValue(
                    result.referDoctor || '',
                );
                this.formGroup.controls.appointmentDate.setValue(
                    result.appointmentDate || '',
                );
            });
        });

        this._doctorService.getAll({}).subscribe((res: any) => {
            this.doctors = res;
        });

        this._patientService.getAll({}).subscribe((res: any) => {
            this.patients = res;
        });

        this.patientFilteredOptions =
            this.formGroup.controls.patient.valueChanges.pipe(
                startWith(''),
                map((value) => this._filterPatient(value || '')),
            );

        this.doctorFilteredOptions =
            this.formGroup.controls.doctor.valueChanges.pipe(
                startWith(''),
                map((value) => this._filterDoctor(value || '')),
            );

        this.referDoctorFilteredOptions =
            this.formGroup.controls.referDoctor.valueChanges.pipe(
                startWith(''),
                map((value) => this._filterDoctor(value || '')),
            );
    }

    displayPatientFn(patient: any): string {
        return patient.fullName;
    }

    displayDoctorFn(doctor: any): string {
        return doctor ? `${doctor.fullName} (${doctor.specialization})` : '';
    }

    private _filterPatient(value: string): string[] {
        const filterValue = typeof value == 'string' ? value.toLowerCase() : '';

        return this.patients.filter((option) =>
            option.fullName.toLowerCase().includes(filterValue),
        );
    }

    private _filterDoctor(value: string): string[] {
        const filterValue = typeof value == 'string' ? value.toLowerCase() : '';

        return this.doctors.filter((option) =>
            option.fullName.toLowerCase().includes(filterValue),
        );
    }

    onItemSelect(event: MatAutocompleteSelectedEvent): void {
        const selectedItem = event.option.value;

        if (!selectedItem) return;

        this.formGroup.controls.phoneNumber.setValue(selectedItem.phoneNumber);
    }

    submit() {
        if (!this.formGroup.valid) {
            return this._confirmService.open({
                title: 'Invalid',
                message: 'Please fill all the required fields.',
                actions: {
                    cancel: { label: 'OK' },
                    confirm: { show: false },
                },
                dismissible: true,
            });
        }

        this._confirmService
            .open({
                title: 'Confirmation',
                message: 'Are you sure to update this appointment?',
                dismissible: true,
            })
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    confirmSubmit() {
        const data = clone(this.formGroup.value);

        if (!data.doctor) delete data.doctor;
        if (!data.referDoctor) delete data.referDoctor;

        this._appointmentService.update(this.id, data).subscribe(() => {
            this._router.navigate(['/appointments']);
        });
    }
}
