import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { APP_CONFIG, MY_DATE_FORMATS } from 'app/app.config';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { DoctorService } from 'app/services/doctor.service';

@Component({
    selector: 'app-edit-doctor',
    templateUrl: './edit-doctor.component.html',
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class EditDoctorComponent implements OnInit {
    formGroup!: FormGroup;

    bloodTypes = APP_CONFIG.BLOOD_TYPES;

    genders = APP_CONFIG.GENDERS;

    id!: string;

    constructor(
        private _doctorService: DoctorService,
        private _fb: FormBuilder,
        private _confirmService: FuseConfirmationService,
        private _router: Router,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            fullName: ['', Validators.required],
            specialization: ['', Validators.required],
            licenseNo: ['', Validators.required],
            phoneNumber: [''],
        });

        this.route.params.subscribe(({ id }) => {
            this.id = id;
            this.loadData();
        });
    }

    loadData() {
        this._doctorService.findById(this.id).subscribe((result: any) => {
            this.formGroup.controls.fullName.setValue(result.fullName);
            this.formGroup.controls.specialization.setValue(
                result.specialization,
            );
            this.formGroup.controls.licenseNo.setValue(result.licenseNo);
            this.formGroup.controls.phoneNumber.setValue(result.phoneNumber);
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
                message: 'Are you sure to update this doctor?',
                dismissible: true,
            })
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    confirmSubmit() {
        this._doctorService
            .update(this.id, this.formGroup.value)
            .subscribe(() => {
                this._router.navigate(['/doctors', 'view', this.id]);
            });
    }
}
