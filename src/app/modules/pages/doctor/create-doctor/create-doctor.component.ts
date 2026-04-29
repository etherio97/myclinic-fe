import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MY_DATE_FORMATS } from 'app/app.config';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { DoctorService } from 'app/services/doctor.service';
import { ConfirmService } from 'app/services/confirm.service';

@Component({
    selector: 'app-create-doctor',
    templateUrl: './create-doctor.component.html',
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class CreateDoctorComponent implements OnInit {
    formGroup!: FormGroup;

    constructor(
        private _doctorService: DoctorService,
        private _fb: FormBuilder,
        private _confirmService: ConfirmService,
        private _router: Router,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            fullName: ['', Validators.required],
            specialization: ['', Validators.required],
            phoneNumber: ['', Validators.required],
            address: [''],
            remarks: [''],
        });
    }

    submit() {
        if (!this.formGroup.valid) {
            return this._confirmService.error(
                'Please fill all the required fields.',
                'Invalid',
            );
        }

        this._confirmService
            .confirm('Are you sure to create this doctor?')
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    confirmSubmit() {
        this._doctorService
            .create(this.formGroup.value)
            .subscribe((result: any) => {
                this._router.navigate(['/doctors', 'view', result.id]);
            });
    }
}
