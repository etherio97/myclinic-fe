import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_CONFIG, MY_DATE_FORMATS } from 'app/app.config';
import { PatientService } from 'app/services/patient.service';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { cloneDeep } from 'lodash';
import { ConfirmService } from 'app/services/confirm.service';

@Component({
    selector: 'app-edit-patient',
    templateUrl: './edit-patient.component.html',
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class EditPatientComponent implements OnInit {
    formGroup!: FormGroup;

    genders = APP_CONFIG.GENDERS;

    id!: string;

    constructor(
        private _patientService: PatientService,
        private _fb: FormBuilder,
        private _confirmService: ConfirmService,
        private _router: Router,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            fullName: ['', Validators.required],
            gender: ['', Validators.required],
            dateOfBirth: [''],
            phoneNumber: ['', Validators.required],
            nrcNumber: [''],
            address: [''],
            ssbNumber: [''],
            notes: [''],
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
            this.formGroup.controls.nrcNumber.setValue(result.nrcNumber);
            this.formGroup.controls.ssbNumber.setValue(result.ssbNumber);
            this.formGroup.controls.address.setValue(result.address);
            this.formGroup.controls.notes.setValue(result.notes);
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
            .confirm('Are you sure to update this patient?')
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    confirmSubmit() {
        const data = cloneDeep(this.formGroup.value);
        this._patientService.update(this.id, data).subscribe(() => {
            this._router.navigate(['/patients', 'view', this.id]);
        });
    }
}
