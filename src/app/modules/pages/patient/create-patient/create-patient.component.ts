import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { APP_CONFIG, MY_DATE_FORMATS } from 'app/app.config';
import { PatientService } from 'app/services/patient.service';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import moment from 'moment';
import { clone } from 'lodash';

@Component({
    selector: 'app-create-patient',
    templateUrl: './create-patient.component.html',
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class CreatePatientComponent implements OnInit {
    formGroup!: FormGroup;

    bloodTypes = APP_CONFIG.BLOOD_TYPES;

    genders = APP_CONFIG.GENDERS;

    constructor(
        private _patientService: PatientService,
        private _fb: FormBuilder,
        private _confirmService: FuseConfirmationService,
        private _router: Router,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            fullName: ['', Validators.required],
            gender: ['', Validators.required],
            dateOfBirth: [''],
            age: [''],
            phoneNumber: ['', Validators.required],
            bloodType: [''],
            address: [''],
        });

        this.formGroup.controls.age.valueChanges.subscribe((value) => {
            this.formGroup.controls.dateOfBirth.setValue(
                moment()
                    .subtract(value, 'years')
                    .set('date', 1)
                    .set('month', 0),
            );
        });
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
                message: 'Are you sure to create this patient?',
                dismissible: true,
            })
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    confirmSubmit() {
        const data = clone(this.formGroup.value);
        delete data.age;
        this._patientService.create(data).subscribe((result: any) => {
            this._router.navigate(['/patients', 'view', result.id]);
        });
    }
}
