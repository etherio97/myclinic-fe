import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { APP_CONFIG, MY_DATE_FORMATS } from 'app/app.config';
import { PatientService } from 'app/services/patient.service';
import { MAT_DATE_FORMATS } from '@angular/material/core';

@Component({
    selector: 'app-edit-patient',
    templateUrl: './edit-patient.component.html',
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class EditPatientComponent implements OnInit {
    formGroup!: FormGroup;

    bloodTypes = APP_CONFIG.BLOOD_TYPES;

    genders = APP_CONFIG.GENDERS;

    id!: string;

    constructor(
        private _patientService: PatientService,
        private _fb: FormBuilder,
        private _confirmService: FuseConfirmationService,
        private _router: Router,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            fullName: ['', Validators.required],
            gender: ['', Validators.required],
            dateOfBirth: ['', Validators.required],
            phoneNumber: ['', Validators.required],
            bloodType: [''],
            address: [''],
        });

        this.route.params.subscribe(({ id }) => {
            this.id = id;
            this.loadData();
        });
    }

    loadData() {
        this._patientService.findById(this.id).subscribe((result: any) => {
            this.formGroup.controls.fullName.setValue(result.fullName);
            this.formGroup.controls.gender.setValue(result.gender);
            this.formGroup.controls.dateOfBirth.setValue(result.dateOfBirth);
            this.formGroup.controls.phoneNumber.setValue(result.phoneNumber);
            this.formGroup.controls.bloodType.setValue(result.bloodType);
            this.formGroup.controls.address.setValue(result.address);
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
                message: 'Are you sure to update this patient?',
                dismissible: true,
            })
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    confirmSubmit() {
        this._patientService
            .update(this.id, this.formGroup.value)
            .subscribe(() => {
                this._router.navigate(['/patients', 'view', this.id]);
            });
    }
}
