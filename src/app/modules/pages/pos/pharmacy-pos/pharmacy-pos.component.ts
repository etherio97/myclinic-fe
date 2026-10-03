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
import { APP_CONFIG, MESSAGES } from 'app/app.config';
import { startWith, map } from 'rxjs/operators';
import { clone, cloneDeep } from 'lodash';
import {
    MatAutocomplete,
    MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import moment from 'moment';
import { ConfirmService } from 'app/services/confirm.service';
import { MatDialog } from '@angular/material/dialog';
import { PharmReceiptService } from 'app/services/pharm-receipt.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-pharmacy-pos',
    templateUrl: './pharmacy-pos.component.html',
})
export class PharmacyPOSComponent implements OnInit {
    @Input('form') form!: FormGroup;

    @Input('items') items: any[] = [];

    @Input('type') type!: string;

    @Output('onSubmitted') onSubmitted = new EventEmitter<any>();

    formGroup!: FormGroup;

    patients: any[] = [];

    paymentMethods = APP_CONFIG.PAYMENT_METHODS;

    selectedItems: any[] = [];

    inputAmount = 0;

    inputPrecentage = 0;

    itemFilteredOptions!: Observable<string[]>;

    response!: any;

    @ViewChild('itemsViewTable') itemsViewTableRef: any;

    constructor(
        private _receiptService: PharmReceiptService,
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
        return this.items.filter((option) => {
            return (
                option.code.toLowerCase() == filterValue ||
                option.barcode == filterValue ||
                option.name.toLowerCase().includes(filterValue) ||
                option.code.toLowerCase().includes(filterValue)
            );
        });
    }

    private _isKeyDown = false;

    onKeyDown() {
        this._isKeyDown = true;
    }

    selectFirstItemOnEnter(event: Event, autocomplete: MatAutocomplete): void {
        event.preventDefault(); // Prevent form submission

        if (this._isKeyDown) return;

        let value = (<any>event.target).value;
        if (value) {
            let item = this.items.find(
                (item) => item.code.toLowerCase() == value.toLowerCase(),
            );
            if (item) {
                this.onItemSelect(<any>{ option: { value: item } });
                return;
            }
        }

        const options = autocomplete.options.toArray();
        if (options.length > 0) {
            const firstOption = options[0];
            autocomplete.optionSelected.emit({
                source: autocomplete,
                option: firstOption,
            } as MatAutocompleteSelectedEvent);
            // autocomplete.closed;
        }
    }

    onItemSelect(event: MatAutocompleteSelectedEvent): void {
        const selectedItem = cloneDeep(event.option.value);

        if (!selectedItem) return;

        selectedItem.unit = selectedItem.defaultUnit;
        selectedItem.quantity = 1;
        this.selectedItems.push(selectedItem);
        this.onChangeUnit(selectedItem, selectedItem.unit);

        setTimeout(() => {
            this.itemsViewTableRef.nativeElement.scrollTo({
                top: this.itemsViewTableRef.nativeElement.scrollHeight,
                behavior: 'smooth',
            });

            setTimeout(() => {
                window.innerHeight > 800 &&
                    window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: 'smooth',
                    });
            }, 200);
        });

        setTimeout(() => {
            this.formGroup.get('item')?.markAsUntouched();
            this.formGroup.get('item')?.setValue('');
            this._isKeyDown = false;
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

    removeItem(index: any): void {
        const items = [];

        for (let i = 0; i < this.selectedItems.length; i++) {
            if (i !== index) {
                items.push(this.selectedItems[i]);
            }
        }
        this.selectedItems = items;
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

        delete data.doctor;
        delete data.item;
        delete data.discountPercent;

        this._receiptService.create(data).subscribe((response: any) => {
            this.response = response;
            this.onSubmitted.emit({
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
        return this.selectedItems;
    }

    now() {
        return moment();
    }
}
