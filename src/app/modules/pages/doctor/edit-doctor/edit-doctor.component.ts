import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MY_DATE_FORMATS } from 'app/app.config';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { DoctorService } from 'app/services/doctor.service';
import { ConfirmService } from 'app/services/confirm.service';

@Component({
    selector: 'app-edit-doctor',
    templateUrl: './edit-doctor.component.html',
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class EditDoctorComponent implements OnInit {
    formGroup!: FormGroup;

    id!: string;

    constructor(
        private _doctorService: DoctorService,
        private _fb: FormBuilder,
        private _confirmService: ConfirmService,
        private _router: Router,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            fullName: ['', Validators.required],
            specialization: ['', Validators.required],
            phoneNumber: ['', Validators.required],
            address: [''],
            remarks: [''],
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
            this.formGroup.controls.phoneNumber.setValue(result.phoneNumber);
            this.formGroup.controls.address.setValue(result.address);
            this.formGroup.controls.remarks.setValue(result.remarks);
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
            .confirm('Are you sure to update this doctor?')
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
