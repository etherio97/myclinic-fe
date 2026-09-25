import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { APP_CONFIG, MESSAGES, MY_DATE_FORMATS } from 'app/app.config';
import { firstValueFrom, forkJoin, Observable, of } from 'rxjs';
import { startWith, map, catchError } from 'rxjs/operators';
import { clone, cloneDeep } from 'lodash';
import { ConfirmService } from 'app/services/confirm.service';
import { PharmItemService } from 'app/services/pharm-item.service';
import moment from 'moment';
import { PharmPurchaseService } from 'app/services/pharm-purchase.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { slideInRight, slideOutRight } from '@fuse/animations/slide';

@Component({
    selector: 'app-create-multiple-purchase',
    templateUrl: './create-multiple-purchase.component.html',
    animations: [slideInRight, slideOutRight],
})
export class CreateMultiplePurchaseComponent implements OnInit {
    formGroup!: FormGroup;

    formGroups: FormGroup[] = [];

    itemFilteredOptions: Observable<string[]>[] = [];

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
            purchasedDate: [moment(), Validators.required],
            supplier: [''],
        });

        this.initializeData();

        this.addPurchase();
    }

    initializeData() {
        this._itemService.getAll({}).subscribe((items: any) => {
            this.items = items;
        });
    }

    addPurchase() {
        const fb = this._fb.group({
            item: ['', Validators.required],
            unit: ['', Validators.required],
            expiryDate: [''],
            cost: ['', Validators.required],
            quantity: ['', Validators.required],
            discount: [''],
            total: [0, Validators.required],
        });

        const filterOption = fb.controls.item.valueChanges.pipe(
            startWith(''),
            map((value) => this._filterItem(value || '')),
        );

        this.itemFilteredOptions.push(filterOption);

        fb.controls.cost.valueChanges.subscribe(() => {
            this.recalculateTotal(fb);
        });

        fb.controls.quantity.valueChanges.subscribe(() => {
            this.recalculateTotal(fb);
        });

        fb.controls.discount.valueChanges.subscribe(() => {
            this.recalculateTotal(fb);
        });

        this.formGroups.push(fb);
    }

    removePurchase(index: number) {
        this.formGroups.splice(index, 1);
    }

    recalculateTotal(fb: FormGroup) {
        const cost = fb.controls.cost.value || 0;
        const quantity = fb.controls.quantity.value || 0;
        const discount = fb.controls.discount.value || 0;

        const total = cost * quantity - discount;

        fb.controls.total.setValue(total);
    }

    submit() {
        if (!this.formGroup.valid) {
            return this._confirmService.error(
                MESSAGES.REQUIRED_ALL_FIELDS,
                'Invalid',
            );
        }

        for (let fb of this.formGroups) {
            if (fb.invalid) {
                return this._confirmService.error(
                    MESSAGES.REQUIRED_ALL_FIELDS,
                    'Invalid',
                );
            }
        }

        this._confirmService
            .confirm(MESSAGES.CONFIRM_CREATE_ITEM)
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    async confirmSubmit() {
        const errors: string[] = [];
        const { supplier, purchasedDate } = clone(this.formGroup.value);
        const tasks = this.formGroups.map((fb, index) => {
            const data = cloneDeep(fb.value);
            data.supplier = supplier;
            data.purchasedDate = purchasedDate;
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

            return this._purchaseService.create(data).pipe(
                map((res: any) => ({
                    index,
                    itemCode: data.item,
                    error: res?.error || null,
                })),
                catchError((err) => {
                    const httpErrorMsg =
                        err?.error?.message ||
                        err?.message ||
                        'Internal Server Error';
                    return of({
                        index,
                        itemCode: data.item,
                        error: httpErrorMsg,
                    });
                }),
            );
        });

        if (tasks.length === 0) return;

        const results = await firstValueFrom(forkJoin(tasks));

        const successfulIndices: number[] = [];

        for (const res of results) {
            if (res.error) {
                errors.push(`[${res.itemCode}] ${res.error}`);
            } else {
                successfulIndices.push(res.index);
            }
        }

        successfulIndices
            .sort((a, b) => b - a)
            .forEach((idx) => this.removePurchase(idx));

        if (errors.length) {
            this._confirmService.error(errors.join('\n'));
        } else {
            this._router.navigateByUrl('/pharmacy/purchases');
        }
    }

    onItemSelect(event: MatAutocompleteSelectedEvent, fb: FormGroup): void {
        const selectedItem = event.option.value;

        if (!selectedItem) return;

        fb.controls.item.setValue(selectedItem);
        fb.controls.unit.setValue(selectedItem.trackingUnit);
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
