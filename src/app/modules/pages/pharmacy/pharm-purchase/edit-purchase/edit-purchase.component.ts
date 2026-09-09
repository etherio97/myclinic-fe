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

@Component({
    selector: 'app-edit-purchase',
    templateUrl: './edit-purchase.component.html',
})
export class EditPurchaseComponent implements OnInit {
    isLoaded = false;

    formGroup!: FormGroup;

    categories: any = [];

    itemTypes: any = APP_CONFIG.ITEM_TYPES;

    itemTypeFilteredOptions!: Observable<string[]>;

    categoryFilteredOptions!: Observable<string[]>;

    id!: string;

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

        this.formGroup.controls.cost.valueChanges.subscribe(() => {
            this.recalculateTotal();
        });

        this.formGroup.controls.quantity.valueChanges.subscribe(() => {
            this.recalculateTotal();
        });

        this.formGroup.controls.discount.valueChanges.subscribe(() => {
            this.recalculateTotal();
        });

        this.route.params.subscribe(({ id }) => {
            this.id = id;
            this.loadData();
        });
    }

    loadData() {
        this._purchaseService.findById(this.id).subscribe((result: any) => {
            this.isLoaded = true;
            this.formGroup.patchValue(result);
            this.formGroup.controls.item.setValue(result.item.name);
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
            .confirm(MESSAGES.CONFIRM_UPDATE_ITEM)
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    confirmSubmit() {
        const data = clone(this.formGroup.value);
        delete data.item;
        delete data.unit;
        delete data.quantity;
        this._itemService.update(this.id, data).subscribe(() => {
            this._router.navigate(['/items']);
        });
    }

    private _filterItemType(value: string) {
        const filterValue = value.toString().toLowerCase();

        return this.itemTypes.filter((option: string) =>
            option.toLowerCase().includes(filterValue),
        );
    }

    private _filterCategory(value: string) {
        const filterValue = value.toString().toLowerCase();

        return this.categories.filter((option: string) =>
            option.toLowerCase().includes(filterValue),
        );
    }
}
