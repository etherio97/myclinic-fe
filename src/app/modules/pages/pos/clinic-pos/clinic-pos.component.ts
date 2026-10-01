import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_CONFIG, MESSAGES, MY_DATE_FORMATS } from 'app/app.config';
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
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'app-clinic-pos',
    templateUrl: './clinic-pos.component.html',
})
export class ClinicPOSComponent implements OnInit {
    @Input('form') form!: FormGroup;

    @Input('items') items: any[] = [];

    @Input('type') type!: string;

    @Output('onSubmitted') onSubmitted = new EventEmitter<any>();

    formGroup!: FormGroup;

    doctors: any[] = [];

    patients: any[] = [];

    paymentMethods = APP_CONFIG.PAYMENT_METHODS;

    patientFilteredOptions!: Observable<string[]>;

    doctorFilteredOptions!: Observable<string[]>;

    itemFilteredOptions!: Observable<string[]>;

    selectedItems: any[] = [];

    itemTypes = APP_CONFIG.ITEM_TYPES;

    inputAmount = 0;

    inputPrecentage = 0;

    response!: any;

    private _selectedItem: any;

    private _modal!: MatDialogRef<any>;

    @ViewChild('adjustPriceModal') adjustPriceModalRef!: TemplateRef<any>;

    constructor(
        private _receiptService: ReceiptService,
        private _fb: FormBuilder,
        private _confirmService: ConfirmService,
        private _dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            paymentMethod: ['Cash', Validators.required],
            discountAmount: [''],
            discountPercent: [''],
            item: [''],
            type: [this.type],
        });

        this.formGroup.controls.discountPercent.valueChanges.subscribe(
            (value) => {
                let subTotal = this.getSubTotal();
                let discountAmount = subTotal * (value / 100);
                this.formGroup.controls.discountAmount.setValue(discountAmount);
            },
        );

        this.itemFilteredOptions =
            this.formGroup.controls.item.valueChanges.pipe(
                startWith(''),
                map((value) => this._filterItem(value || '')),
            );
    }

    displayItemFn(item: any): string {
        return item && item.name ? item.name : '';
    }

    private _filterItem(value: any): any[] {
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
            this.formGroup.get('item')?.markAsUntouched();
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

    removeItem(id: string): void {
        const index = this.selectedItems.findIndex((item) => item.id === id);
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

    submit() {
        if (!this.form.valid) {
            return this._confirmService.error(
                MESSAGES.REQUIRED_ALL_FIELDS,
                'Invalid',
            );
        }
        if (!this.form.value.patient) {
            return this._confirmService.error(
                MESSAGES.REQUIRED_ALL_FIELDS,
                'Invalid',
            );
        }
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
            this.form.value.patient &&
            typeof this.form.value.patient !== 'object'
        ) {
            return this._confirmService.error(
                MESSAGES.PLEASE_SELECT_PATIENT,
                'Invalid',
            );
        }
        if (
            this.form.value.doctor &&
            typeof this.form.value.doctor !== 'object'
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
        const data = {
            ...clone(this.form.value),
            ...clone(this.formGroup.value),
        };

        data.patient = data.patient.id;

        data.doctor = data.doctor?.id;

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
            this.response = response;
            this.onSubmitted.emit({
                type: this.type,
                response: this.response,
            });
            this.formGroup.disable();
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

    openAdjustPriceModal(selectedItem: any) {
        this._selectedItem = selectedItem;
        this.inputAmount = this._selectedItem.sellingPrice || 0;
        this.inputPrecentage = 20;
        this._modal = this._dialog.open(this.adjustPriceModalRef, {
            width: '100%',
            minWidth: '280px',
            maxWidth: '380px',
        });
    }

    incrementAmount() {
        let amount = parseInt(<any>this.inputAmount),
            precent = parseInt(<any>this.inputPrecentage);
        let value = amount * (precent / 100);
        this._selectedItem.sellingPrice = amount + value;
        this._modal.close();
    }

    decrementAmount() {
        let amount = parseInt(<any>this.inputAmount),
            precent = parseInt(<any>this.inputPrecentage);
        let value = amount * (precent / 100);
        this._selectedItem.sellingPrice = amount - value;
        this._modal.close();
    }

    now() {
        return moment();
    }
}
