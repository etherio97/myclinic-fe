import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_CONFIG, MY_DATE_FORMATS } from 'app/app.config';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { DoctorService } from 'app/services/doctor.service';
import { ReceiptService } from 'app/services/receipt.service';
import { PatientService } from 'app/services/patient.service';
import { ItemService } from 'app/services/item.service';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { clone } from 'lodash';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import moment from 'moment';
import { ConfirmService } from 'app/services/confirm.service';

@Component({
    selector: 'app-create-receipt',
    templateUrl: './create-receipt.component.html',
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class CreateReceiptComponent implements OnInit {
    formGroup!: FormGroup;

    items: any[] = [];

    doctors: any[] = [];

    patients: any[] = [];

    patientFilteredOptions!: Observable<string[]>;

    doctorFilteredOptions!: Observable<string[]>;

    itemFilteredOptions!: Observable<string[]>;

    selectedItems: any[] = [];

    receiptNo = '';

    patientId = '';

    doctorId = '';

    cashier!: any;

    itemTypes = APP_CONFIG.ITEM_TYPES;

    constructor(
        private _receiptService: ReceiptService,
        private _doctorService: DoctorService,
        private _patientService: PatientService,
        private _itemService: ItemService,
        private _fb: FormBuilder,
        private _confirmService: ConfirmService,
        private _router: Router,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            patient: ['', Validators.required],
            doctor: [''],
            date: [''],
            paymentMethod: ['', Validators.required],
            discountAmount: [''],
            discountPercent: [''],
            item: [''],
            type: ['Clinic'],
        });

        this.formGroup.controls.discountPercent.valueChanges.subscribe(
            (value) => {
                let subTotal = this.getSubTotal();
                let discountAmount = subTotal * (value / 100);
                this.formGroup.controls.discountAmount.setValue(discountAmount);
            },
        );

        this.route.params.subscribe(({ patientId }) => {
            if (!patientId) return;

            this.patientId = patientId;
            this._patientService.findById(patientId).subscribe((result) => {
                this.formGroup.controls.patient.setValue(result);
            });

            this.route.queryParamMap.subscribe((params) => {
                if (!params.has('doctorId')) return;
                this.doctorId = <string>params.get('doctorId');
                this._doctorService
                    .findById(this.doctorId)
                    .subscribe((result) => {
                        this.formGroup.controls.doctor.setValue(result);
                    });
            });
        });

        this._itemService.getAll({}).subscribe((res: any) => {
            this.items = res;
        });

        this._doctorService.getAll({}).subscribe((res: any) => {
            this.doctors = res;
        });

        this._patientService.getAll({}).subscribe((res: any) => {
            this.patients = res;
        });

        this.patientFilteredOptions =
            this.formGroup.controls.patient.valueChanges.pipe(
                startWith(''),
                map((value) => this._filterPatient(value || '')),
            );

        this.doctorFilteredOptions =
            this.formGroup.controls.doctor.valueChanges.pipe(
                startWith(''),
                map((value) => this._filterDoctor(value || '')),
            );

        this.itemFilteredOptions =
            this.formGroup.controls.item.valueChanges.pipe(
                startWith(''),
                map((value) => this._filterItem(value || '')),
            );
    }

    displayPatientFn(patient: any): string {
        return patient.fullName;
    }

    displayDoctorFn(doctor: any): string {
        return doctor ? `${doctor.fullName} (${doctor.specialization})` : '';
    }

    displayItemFn(item: any): string {
        return item && item.name ? item.name : '';
    }

    private _filterItem(value: any): any[] {
        // Check if value is a string (from typing) or an object (from selection)
        const filterValue =
            typeof value === 'string' ? value.toLowerCase() : '';

        const itemList = this.items.filter(
            (item) => item.itemType === this.formGroup.value.type,
        );

        return itemList
            .filter(
                (option) =>
                    !this.selectedItems.some(
                        (selected) => selected.id == option.id,
                    ),
            )
            .filter((option) =>
                option.name.toLowerCase().includes(filterValue),
            );
    }

    onItemSelect(event: MatAutocompleteSelectedEvent): void {
        const selectedItem = event.option.value;

        if (!selectedItem) return;

        if (!!this.selectedItems.find(({ id }) => id === selectedItem.id)) {
            selectedItem.quantity++;
        } else {
            selectedItem.quantity = 1;

            this.selectedItems.push(selectedItem);
        }

        this.recalculateDiscount();

        setTimeout(() => {
            this.formGroup.get('item')?.setValue('');
        });
    }

    recalculateDiscount() {
        if (this.formGroup.controls.discountPercent.value) {
            let subTotal = this.getSubTotal();
            let discountAmount =
                subTotal *
                (this.formGroup.controls.discountPercent.value / 100);
            this.formGroup.controls.discountAmount.setValue(discountAmount);
        }
    }

    removeItem(index: number): void {
        this.selectedItems.splice(index, 1);
        this.recalculateDiscount();
    }

    handlePrint() {
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
        window.print();
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

    submit() {
        if (!this.formGroup.valid) {
            return this._confirmService.error(
                'Please fill all the required fields.',
                'Invalid',
            );
        }
        if (!this.selectedItems.length) {
            return this._confirmService.error('Please input items.', 'Invalid');
        }
        this._confirmService
            .confirm('Are you sure to create this receipt?')
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    confirmSubmit() {
        const data = clone(this.formGroup.value);

        data.patient = data.patient.id;

        data.doctor = data.doctor.id;

        data.items = this.selectedItems;

        data.subtotal = this.getSubTotal();

        data.grandTotal = this.getGrandTotal();

        if (!data.discountAmount) data.discountAmount = 0;

        if (data.date) {
            data.date = moment(data.date).toISOString();
        } else {
            data.date = moment().toISOString();
        }

        delete data.item;
        delete data.discountPercent;

        this._receiptService.create(data).subscribe((response: any) => {
            this.receiptNo = response.receiptNo;
            this.cashier = response.user;
            setTimeout(() => {
                this._router.navigate(['/receipts', 'view', response.id]);
            });
        });
    }

    getSubTotal() {
        let i = 0;

        this.selectedItems.forEach((item) => {
            i += item.sellingPrice * item.quantity;
        });

        return i;
    }

    getGrandTotal() {
        return (
            this.getSubTotal() - this.formGroup.controls.discountAmount.value
        );
    }
}
