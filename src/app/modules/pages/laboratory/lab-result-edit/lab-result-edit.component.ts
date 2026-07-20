import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MESSAGES } from 'app/app.config';
import { ConfirmService } from 'app/services/confirm.service';
import { LabOrderService } from 'app/services/lab-order.service';
import { LabResultService } from 'app/services/lab-result.service';
import { LabTestItemService } from 'app/services/lab-test-item.service';
import { cloneDeep } from 'lodash';
import moment from 'moment';

@Component({
    selector: 'app-lab-result-edit',
    templateUrl: './lab-result-edit.component.html',
})
export class LabResultEditComponent implements OnInit {
    isLoaded = false;

    id!: string;

    formGroup!: FormGroup;

    data!: any;

    doctors: any[] = [];

    patients: any[] = [];

    categories: any = [];

    subCat: any = {};

    labTests: any = {};

    constructor(
        private _fb: FormBuilder,
        private _confirmService: ConfirmService,
        private _route: ActivatedRoute,
        private _router: Router,
        private _labResultService: LabResultService,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            labPatientNo: [''],
            reportedDate: ['', Validators.required],
        });

        this._route.params.subscribe(({ id }) => {
            this.id = id;

            this._labResultService.findById(id).subscribe((data: any) => {
                this.formGroup.controls.labPatientNo.setValue(
                    data.labPatientNo,
                );
                this.formGroup.controls.reportedDate.setValue(
                    data.reportedDate,
                );
                this.data = data.order;
                this.data.items = data.items;
                this.isLoaded = true;
                this.processData();
            });
        });
    }

    processData() {
        let labTests: any = {};
        let subCat: { [key: string]: string[] } = {};
        this.data.items.forEach((item: any) => {
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
    }

    filterSubgroup(items: any, subgroup: string) {
        return items.filter((i: any) => i.subgroup === subgroup);
    }

    submit() {
        if (!this.formGroup.valid) {
            return this._confirmService.error(
                MESSAGES.REQUIRED_ALL_FIELDS,
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
        const data: any = {};
        data.order = this.data.id;
        data.items = this.data.items;
        data.reportedDate = this.formGroup.value.reportedDate;
        data.labPatientNo = this.formGroup.value.labPatientNo || null;
        this._labResultService.update(this.id, data).subscribe(() => {
            this._router.navigate(['/laboratory', 'reports', this.id]);
        });
    }

    calculateAge(dateOfBirth: string): number {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (
            monthDifference < 0 ||
            (monthDifference === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }

        return age;
    }
}
