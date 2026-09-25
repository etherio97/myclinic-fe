import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_CONFIG, MESSAGES } from 'app/app.config';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { clone } from 'lodash';
import { ConfirmService } from 'app/services/confirm.service';
import { PharmItemService } from 'app/services/pharm-item.service';
import { PharmPurchaseService } from 'app/services/pharm-purchase.service';
import moment from 'moment';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
    selector: 'app-edit-purchase',
    templateUrl: './edit-purchase.component.html',
})
export class EditPurchaseComponent implements OnInit {
    isLoaded = false;

    formGroup!: FormGroup;

    itemFilteredOption!: Observable<string[]>;

    id!: string;

    items: any[] = [];

    constructor(
        private _itemService: PharmItemService,
        private _purchaseService: PharmPurchaseService,
        private _fb: FormBuilder,
        private _confirmService: ConfirmService,
        private _router: Router,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            item: [''],
            purchasedDate: ['', Validators.required],
            unit: [''],
            supplier: [''],
            expiryDate: [''],
            cost: ['', Validators.required],
            quantity: [''],
            discount: [''],
            total: [0, Validators.required],
        });

        this._itemService.getAll({}).subscribe((items: any) => {
            this.items = items;
        });

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

        this.itemFilteredOption =
            this.formGroup.controls.item.valueChanges.pipe(
                startWith(''),
                map((value) => this._filterItem(value || '')),
            );

        this.route.params.subscribe(({ id }) => {
            this.id = id;
            this.loadData();
        });
    }

    loadData() {
        this._purchaseService.findById(this.id).subscribe((result: any) => {
            this.isLoaded = true;
            this.formGroup.patchValue(result);
        });
    }

    recalculateTotal() {
        const cost = this.formGroup.controls.cost.value || 0;
        const quantity = this.formGroup.controls.quantity.value || 0;
        const discount = this.formGroup.controls.discount.value || 0;
        const total = cost * quantity - discount;
        this.formGroup.controls.total.setValue(total);
    }

    displayItemFn(item: any): string {
        return item && item.name ? item.name : '';
    }

    submit() {
        if (!this.formGroup.valid) {
            return this._confirmService.error(
                MESSAGES.REQUIRED_ALL_FIELDS,
                'Invalid',
            );
        }

        this._confirmService
            .confirm(MESSAGES.CONFIRM_UPDATE_PURCHASE)
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    confirmSubmit() {
        const data = clone(this.formGroup.value);
        //
        this._purchaseService.update(this.id, data).subscribe(() => {
            this._router.navigate(['/pharmacy', 'purchases']);
        });
    }

    onItemSelect(event: MatAutocompleteSelectedEvent): void {
        const selectedItem = event.option.value;
        if (!selectedItem) return;
        this.formGroup.controls.item.setValue(selectedItem);
        this.formGroup.controls.unit.setValue(selectedItem.trackingUnit);
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
