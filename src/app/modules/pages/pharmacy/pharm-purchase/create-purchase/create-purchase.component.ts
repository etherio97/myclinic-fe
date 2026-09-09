import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { APP_CONFIG, MESSAGES, MY_DATE_FORMATS } from 'app/app.config';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { clone } from 'lodash';
import { ConfirmService } from 'app/services/confirm.service';
import { PharmItemService } from 'app/services/pharm-item.service';
import moment from 'moment';
import { PharmPurchaseService } from 'app/services/pharm-purchase.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
    selector: 'app-create-purchase',
    templateUrl: './create-purchase.component.html',
})
export class CreatePurchaseComponent implements OnInit {
    formGroup!: FormGroup;

    itemFilteredOptions!: Observable<string[]>;

    items: any[] = [];

    constructor(
        private _itemService: PharmItemService,
        private _purchaseService: PharmPurchaseService,
        private _fb: FormBuilder,
        private _confirmService: ConfirmService,
        private _router: Router,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            item: ['', Validators.required],
            purchasedDate: [moment(), Validators.required],
            unit: ['', Validators.required],
            supplier: [''],
            expiryDate: [''],
            cost: ['', Validators.required],
            quantity: ['', Validators.required],
            discount: [''],
            total: [0, Validators.required],
        });

        this.itemFilteredOptions =
            this.formGroup.controls.item.valueChanges.pipe(
                startWith(''),
                map((value) => this._filterItem(value || '')),
            );

        this.formGroup.controls.cost.valueChanges.subscribe(() => {
            this.recalculateTotal();
        });

        this.formGroup.controls.quantity.valueChanges.subscribe(() => {
            this.recalculateTotal();
        });

        this.formGroup.controls.discount.valueChanges.subscribe(() => {
            this.recalculateTotal();
        });

        this.initializeData();
    }

    initializeData() {
        this._itemService.getAll({}).subscribe((items: any) => {
            this.items = items;
        });
    }

    recalculateTotal() {
        const cost = this.formGroup.controls.cost.value || 0;
        const quantity = this.formGroup.controls.quantity.value || 0;
        const discount = this.formGroup.controls.discount.value || 0;

        const total = cost * quantity - discount;

        this.formGroup.controls.total.setValue(total);
    }

    submit() {
        if (!this.formGroup.valid) {
            return this._confirmService.error(
                MESSAGES.REQUIRED_ALL_FIELDS,
                'Invalid',
            );
        }

        this._confirmService
            .confirm(MESSAGES.CONFIRM_CREATE_ITEM)
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    confirmSubmit() {
        const data = clone(this.formGroup.value);
        data.item = data.item.code;
        if (!data.discount) {
            data.discount = 0;
        }
        if (!data.supplier) {
            delete data.supplier;
        }
        if (!data.expiryDate) {
            delete data.expiryDate;
        }
        this._purchaseService.create(data).subscribe(() => {
            this._router.navigate(['/pharmacy/purchases']);
        });
    }

    onItemSelect(event: MatAutocompleteSelectedEvent): void {
        const selectedItem = event.option.value;

        if (!selectedItem) return;

        this.formGroup.controls.item.setValue(selectedItem);
        this.formGroup.controls.unit.setValue(selectedItem.trackingUnit);
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
}
