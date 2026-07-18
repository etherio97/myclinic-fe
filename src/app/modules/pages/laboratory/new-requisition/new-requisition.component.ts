import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MESSAGES } from 'app/app.config';
import { ConfirmService } from 'app/services/confirm.service';
import { DoctorService } from 'app/services/doctor.service';
import { LabOrderService } from 'app/services/lab-order.service';
import { LabTestItemService } from 'app/services/lab-test-item.service';
import { LaboratoryService } from 'app/services/laboratory.service';
import { PatientService } from 'app/services/patient.service';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { map, Observable, startWith } from 'rxjs';

@Component({
    selector: 'app-new-requisition',
    templateUrl: './new-requisition.component.html',
})
export class NewRequisitionComponent implements OnInit {
    formGroup!: FormGroup;

    doctors: any[] = [];

    patients: any[] = [];

    categories: any = [];

    subCat: any = {};

    labTests: any = {};

    patientFilteredOptions!: Observable<string[]>;

    doctorFilteredOptions!: Observable<string[]>;

    constructor(
        private _fb: FormBuilder,
        private _confirmService: ConfirmService,
        private _labTestItemService: LabTestItemService,
        private _labOrderService: LabOrderService,
        private _patientService: PatientService,
        private _doctorService: DoctorService,
        private _router: Router,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            patient: ['', Validators.required],
            doctor: [''],
            referCentre: [''],
            collectedDate: [moment(), Validators.required],
            receivedDate: [moment(), Validators.required],
        });

        this._patientService.getAll({}).subscribe((res: any) => {
            this.patients = res;
        });

        this._doctorService.getAll({}).subscribe((res: any) => {
            this.doctors = res;
        });

        this.patientFilteredOptions =
            this.formGroup.controls.patient.valueChanges.pipe(
                startWith(''),
                map((value) => {
                    const filterText =
                        typeof value === 'object' && value
                            ? value.fullName
                            : value;
                    return this._filterPatient(filterText || '');
                }),
            );

        this.doctorFilteredOptions =
            this.formGroup.controls.doctor.valueChanges.pipe(
                startWith(''),
                map((value) => {
                    const filterText =
                        typeof value === 'object' && value
                            ? value.fullName
                            : value;
                    return this._filterDoctor(filterText || '');
                }),
            );

        this.reloadData();
    }

    reloadData() {
        this._labTestItemService.getAll({}).subscribe((data: any) => {
            let labTests: any = {};
            let subCat: { [key: string]: string[] } = {};
            data.forEach((item: any) => {
                item.isSelected = false;
                if (!labTests[item.category]) {
                    labTests[item.category] = { _uncategorized: [] };
                    subCat[item.category] = [];
                }
                if (item.subgroup && !labTests[item.category][item.subgroup]) {
                    labTests[item.category][item.subgroup] = [];
                }
                if (item.subgroup) {
                    labTests[item.category][item.subgroup].push(item);
                    if (!subCat[item.category].includes(item.subgroup)) {
                        subCat[item.category].push(item.subgroup);
                    }
                } else {
                    labTests[item.category]['_uncategorized'].push(item);
                }
            });
            this.categories = Object.keys(labTests);
            this.labTests = labTests;
            this.subCat = subCat;
        });
    }

    displayPatientFn(patient: any): string {
        return patient ? `${patient.fullName} #${patient.patientNo}` : '';
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

    isObject(obj: any) {
        return typeof obj === 'object';
    }

    filterSubgroup(items: any, subgroup: string) {
        return items.filter((i: any) => i.subgroup === subgroup);
    }

    selectAll(items: any) {
        if (Array.isArray(items)) {
            items.forEach((item: any) => {
                item.isSelected = true;
            });
        } else {
            Object.values(items).forEach((items: any) => {
                items.forEach((item: any) => {
                    item.isSelected = true;
                });
            });
        }
    }

    submit() {
        if (!this.formGroup.valid) {
            return this._confirmService.error(
                MESSAGES.REQUIRED_ALL_FIELDS,
                'Invalid',
            );
        }
        if (
            this.formGroup.value.patient &&
            typeof this.formGroup.value.patient !== 'object'
        ) {
            return this._confirmService.error(
                MESSAGES.PLEASE_SELECT_PATIENT,
                'Invalid',
            );
        }
        if (
            this.formGroup.value.doctor &&
            typeof this.formGroup.value.doctor !== 'object'
        ) {
            return this._confirmService.error(
                MESSAGES.PLEASE_SELECT_DOCTOR,
                'Invalid',
            );
        }
        this._confirmService
            .confirm(MESSAGES.CONFIRM_CREATE_USER)
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    confirmSubmit() {
        const data: any = cloneDeep(this.formGroup.value);
        data.patient = data.patient.id;
        data.doctor = data.doctor?.id;
        data.items = [];
        Object.values(this.labTests).forEach((items: any) =>
            Object.values(items).forEach((items: any) =>
                items.forEach((item: any) => {
                    if (item.isSelected) {
                        delete item.isSelected;
                        data.items.push(item);
                    }
                }),
            ),
        );
        this._labOrderService.create(data).subscribe((response: any) => {
            this._router.navigate([
                '/laboratory',
                'orders',
                'report',
                response.id,
            ]);
        });
    }
}
