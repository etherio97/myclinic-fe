import { Component, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { APP_CONFIG } from 'app/app.config';
import { ConfirmService } from 'app/services/confirm.service';
import { PatientService } from 'app/services/patient.service';
import { clone } from 'lodash';
import moment from 'moment';

@Component({
    selector: 'app-create-patient-modal',
    templateUrl: './create-patient-modal.component.html',
})
export class CreatePatientModalComponent implements OnInit {
    formGroup!: FormGroup;

    genders = APP_CONFIG.GENDERS;

    @Output() onCreatedPatient!: (patient: any) => void;

    @Output() closeModal!: () => void;

    constructor(
        private _patientService: PatientService,
        private _fb: FormBuilder,
        private _confirmService: ConfirmService,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            fullName: ['', Validators.required],
            gender: ['', Validators.required],
            dateOfBirth: [''],
            age: [''],
            phoneNumber: ['', Validators.required],
            nrcNumber: [''],
            address: [''],
            ssbNumber: [''],
            notes: [''],
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
            return this._confirmService.error(
                'Please fill all the required fields.',
                'Invalid',
            );
        }

        this._confirmService
            .confirm('Are you sure to create this patient?')
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    confirmSubmit() {
        const data = clone(this.formGroup.value);
        delete data.age;
        data.fullName = data.fullName.trim();
        data.phoneNumber = data.phoneNumber.trim();
        data.nrcNumber = data.nrcNumber.trim();
        data.address = data.address.trim();
        data.ssbNumber = data.ssbNumber.trim();
        data.notes = data.notes.trim();
        this._patientService.create(data).subscribe((result: any) => {
            this.onCreatedPatient(result);
        });
    }
}
