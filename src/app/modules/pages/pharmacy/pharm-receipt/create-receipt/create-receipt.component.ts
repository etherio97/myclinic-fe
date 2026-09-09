import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_CONFIG, MESSAGES } from 'app/app.config';
import { PatientService } from 'app/services/patient.service';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { clone, cloneDeep } from 'lodash';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import moment from 'moment';
import { ConfirmService } from 'app/services/confirm.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CreatePatientModalComponent } from '../components/create-patient-modal/create-patient-modal.component';
import { PharmReceiptService } from 'app/services/pharm-receipt.service';
import { PharmItemService } from 'app/services/pharm-item.service';

@Component({
    selector: 'app-create-receipt',
    templateUrl: './create-receipt.component.html',
})
export class CreateReceiptComponent implements OnInit {
    formGroup!: FormGroup;

    items: any[] = [];

    doctors: any[] = [];

    patients: any[] = [];

    paymentMethods = APP_CONFIG.PAYMENT_METHODS;

    patientFilteredOptions!: Observable<string[]>;

    doctorFilteredOptions!: Observable<string[]>;

    itemFilteredOptions!: Observable<string[]>;

    selectedItems: any[] = [];

    receiptNo = '';

    patientId = '';

    doctorId = '';

    cashier!: any;

    itemTypes = APP_CONFIG.ITEM_TYPES;

    inputAmount = 0;

    inputPrecentage = 0;

    private _selectedItem: any;

    private _modal!: MatDialogRef<CreatePatientModalComponent>;

    constructor(
        private _receiptService: PharmReceiptService,
        private _patientService: PatientService,
        private _itemService: PharmItemService,
        private _fb: FormBuilder,
        private _confirmService: ConfirmService,
        private _router: Router,
        private route: ActivatedRoute,
        private _dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            patient: [''],
            date: [''],
            paymentMethod: ['Cash', Validators.required],
            discountAmount: [''],
            discountPercent: [''],
            item: [''],
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
        });

        this._itemService.getAll({}).subscribe((res: any) => {
            this.items = res;
        });

        this.reloadPatients();

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

        this.itemFilteredOptions =
            this.formGroup.controls.item.valueChanges.pipe(
                startWith(''),
                map((value) => this._filterItem(value || '')),
            );
    }

    reloadPatients() {
        this._patientService.getAll({}).subscribe((res: any) => {
            this.patients = res;
        });
    }

    displayPatientFn(patient: any): string {
        return patient ? `${patient.fullName} #${patient.patientNo}` : '';
    }

    displayItemFn(item: any): string {
        return item && item.name ? item.name : '';
    }

    private _filterItem(value: any): any[] {
        const filterValue =
            typeof value === 'string' ? value.toLowerCase() : '';

        return this.items.filter(
            (option) =>
                option.name.toLowerCase().includes(filterValue) ||
                option.code.toLowerCase().includes(filterValue) ||
                option.barcode?.toLowerCase().includes(filterValue),
        );
    }

    onItemSelect(event: MatAutocompleteSelectedEvent): void {
        const selectedItem = cloneDeep(event.option.value);

        if (!selectedItem) return;

        selectedItem.unit = selectedItem.defaultUnit;
        selectedItem.quantity = 1;
        this.selectedItems.push(selectedItem);
        this.onChangeUnit(selectedItem, selectedItem.unit);

        setTimeout(() => {
            this.formGroup.get('item')?.markAsUntouched();
            this.formGroup.get('item')?.setValue('');
        });
    }

    onChangeUnit(item: any, unit: any) {
        if (item.units.length === 1) {
            item.sellingPrice = item.unitPrice;
            this.recalculateDiscount();
            return;
        }
        if (typeof unit === 'object') {
            unit = unit.value;
        }
        if (item.units[0] === unit) {
            item.sellingPrice = item.unitPrice;
        } else {
            item.sellingPrice = item.eachPrice;
        }
        this.recalculateDiscount();
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

    removeItem(code: string): void {
        const index = this.selectedItems.findIndex(
            (item) => item.code === code,
        );
        if (index === -1) return;
        this.selectedItems.splice(index, 1);
        this.recalculateDiscount();
    }

    handlePrint() {
        if (!this.formGroup.valid) {
            return this._confirmService.open({
                title: 'Invalid',
                message: MESSAGES.REQUIRED_ALL_FIELDS,
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

    openCreatePatientModal() {
        this._modal = this._dialog.open(CreatePatientModalComponent, {
            maxWidth: '80vw',
            width: '100%',
            maxHeight: '90vh',
            disableClose: true,
        });

        this._modal.componentInstance.closeModal = () => this._modal.close();

        this._modal.componentInstance.onCreatedPatient = (patient: any) => {
            this.formGroup.controls.patient.setValue(patient);
            this.reloadPatients();
            this._modal.close();
        };
    }

    submit() {
        if (!this.formGroup.valid) {
            return this._confirmService.error(
                MESSAGES.REQUIRED_ALL_FIELDS,
                'Invalid',
            );
        }
        if (!this.selectedItems.length) {
            return this._confirmService.error(
                MESSAGES.PLEASE_INPUT_ITEMS,
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
            .confirm(MESSAGES.CONFIRM_CREATE_RECEIPT)
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    confirmSubmit() {
        const data = clone(this.formGroup.value);

        data.patient = data.patient?.id;

        data.items = this.selectedItems;

        data.subtotal = this.getSubTotal();

        data.grandTotal = this.getGrandTotal();

        data.discountAmount = this.getDiscount();

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
                this._router.navigate(
                    ['/pharmacy', 'receipts', 'view', response.id],
                    {
                        // now disabled because of POS printer is not setup yet, will enable this in the future
                        // queryParams: { print: 'true' },
                    },
                );
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
        return this.getSubTotal() - this.getDiscount();
    }

    getDiscount() {
        let i = 0;

        if (this.formGroup.controls.discountAmount.value) {
            i += this.formGroup.controls.discountAmount.value;
        }

        this.selectedItems.forEach((item) => {
            if (item.discount) {
                i += item.discount;
            }
        });

        return i;
    }

    get selectedItemsReverse() {
        return this.selectedItems ? [...this.selectedItems].reverse() : [];
    }

    isObject(obj: any) {
        return typeof obj === 'object';
    }

    doSomething() {
        this.formGroup.controls.patient.setValue(null);
    }
}
