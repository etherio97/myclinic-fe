import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_CONFIG, MY_DATE_FORMATS } from 'app/app.config';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { AppointmentService } from 'app/services/appointment.service';
import moment from 'moment';
import { PatientService } from 'app/services/patient.service';
import { DoctorService } from 'app/services/doctor.service';
import { map, Observable, startWith } from 'rxjs';
import { clone } from 'lodash';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ConfirmService } from 'app/services/confirm.service';

@Component({
    selector: 'app-create-appointment',
    templateUrl: './create-appointment.component.html',
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class CreateAppointmentComponent implements OnInit {
    formGroup!: FormGroup;

    doctors: any[] = [];

    patients: any[] = [];

    appointmentTypes = APP_CONFIG.APPOINTMENT_TYPES;

    appointmentCases = APP_CONFIG.APPOINTMENT_CASES;

    patientFilteredOptions!: Observable<string[]>;

    doctorFilteredOptions!: Observable<string[]>;

    referDoctorFilteredOptions!: Observable<string[]>;

    patientId = '';

    private _doctorList: any;
    private _patientList: any;
    private _itemList: any;

    constructor(
        private _appointmentService: AppointmentService,
        private _doctorService: DoctorService,
        private _patientService: PatientService,
        private _fb: FormBuilder,
        private _confirmService: ConfirmService,
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

        this.route.params.subscribe(({ patientId }) => {
            if (!patientId) return;
            this.patientId = patientId;
            this._patientService
                .findById(patientId)
                .subscribe((result: any) => {
                    this.formGroup.controls.patient.setValue(result);
                    this.formGroup.controls.phoneNumber.setValue(
                        result.phoneNumber,
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

        return this.doctors.filter(
            (option) =>
                option.fullName.toLowerCase().includes(filterValue) ||
                option.specialization.toLowerCase().includes(filterValue),
        );
    }

    onItemSelect(event: MatAutocompleteSelectedEvent): void {
        const selectedItem = event.option.value;

        if (!selectedItem) return;

        this.formGroup.controls.phoneNumber.setValue(selectedItem.phoneNumber);
    }

    submit() {
        if (!this.formGroup.valid) {
            return this._confirmService.error(
                'Please fill all the required fields.',
                'Invalid',
            );
        }
        if (
            this.formGroup.value.patient &&
            typeof this.formGroup.value.patient !== 'object'
        ) {
            return this._confirmService.error('Please create pateint first.');
        }
        if (
            this.formGroup.value.doctor &&
            typeof this.formGroup.value.doctor !== 'object'
        ) {
            return this._confirmService.error('Please create doctor first.');
        }

        this._confirmService
            .confirm('Are you sure to create this appointment?')
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    confirmSubmit() {
        const data = clone(this.formGroup.value);

        if (!data.doctor) delete data.doctor;
        if (!data.referDoctor) delete data.referDoctor;

        this._appointmentService.create(data).subscribe((data: any) => {
            this._router.navigate(['/appointments', 'view', data.id]);
        });
    }
}
