import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MESSAGES } from 'app/app.config';
import { ConfirmService } from 'app/services/confirm.service';
import { LabOrderService } from 'app/services/lab-order.service';
import { LabResultService } from 'app/services/lab-result.service';
import { LabTestItemService } from 'app/services/lab-test-item.service';
import { cloneDeep } from 'lodash';

@Component({
    selector: 'app-lab-result-entry',
    templateUrl: './lab-result-entry.component.html',
})
export class LabResultEntryComponent implements OnInit {
    formGroup!: FormGroup;

    orderId!: string;

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
        private _labTestItemService: LabTestItemService,
        private _labOrderService: LabOrderService,
        private _labResultService: LabResultService,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            reportedDate: ['', Validators.required],
        });

        this._route.params.subscribe(({ id }) => {
            this.orderId = id;

            this._labTestItemService.getAll({}).subscribe((labItems: any) => {
                this._labOrderService.findById(id).subscribe((data: any) => {
                    let selectedIds = data.items.map((i: any) => i.id);
                    let selectedItems: any = [];
                    labItems.forEach((item: any) => {
                        selectedIds.includes(item.id) &&
                            selectedItems.push(item);
                    });
                    data.items = selectedItems;
                    this.data = data;
                    this.processData();
                });
            });
        });
    }

    processData() {
        let labTests: any = {};
        let subCat: { [key: string]: string[] } = {};
        this.data.items.forEach((item: any) => {
            item.value = '';
            item.flag = '';
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
        const data: any = cloneDeep(this.formGroup.value);
        data.patient = this.data.patient.id;
        data.doctor = this.data.doctor?.id;
        data.order = this.orderId;
        data.patient = this.data.patient;
        data.doctor = this.data.doctor;
        data.centre = this.data.centre;
        data.collectedDate = this.data.collectedDate;
        data.receivedDate = this.data.receivedDate;
        data.items = this.data.items;
        this._labResultService.create(data).subscribe((response: any) => {
            this._router.navigate(['/laboratory', 'reports', response.id]);
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
