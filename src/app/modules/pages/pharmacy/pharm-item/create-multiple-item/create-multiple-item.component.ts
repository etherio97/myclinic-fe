import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { APP_CONFIG, MESSAGES, MY_DATE_FORMATS } from 'app/app.config';
import { firstValueFrom, forkJoin, Observable, of } from 'rxjs';
import { startWith, map, catchError } from 'rxjs/operators';
import { clone, cloneDeep } from 'lodash';
import { ConfirmService } from 'app/services/confirm.service';
import { PharmItemService } from 'app/services/pharm-item.service';
import { slideInRight, slideOutRight } from '@fuse/animations/slide';

@Component({
    selector: 'app-create-multiple-item',
    templateUrl: './create-multiple-item.component.html',
    animations: [slideInRight, slideOutRight],
})
export class CreateMultipleItemComponent implements OnInit {
    formGroups: FormGroup[] = [];

    constructor(
        private _itemService: PharmItemService,
        private _fb: FormBuilder,
        private _confirmService: ConfirmService,
        private _router: Router,
    ) {}

    ngOnInit(): void {
        this.addItem();
    }

    addItem() {
        const fb = this._fb.group({
            code: ['', Validators.required],
            name: ['', Validators.required],
            description: [''],
            barcode: [''],
            units: ['', Validators.required],
            defaultUnit: [''],
            trackingUnit: ['', Validators.required],
            qtyPerUnit: [''],
            unitPrice: ['', Validators.required],
            eachPrice: [''],
            minThreshold: [''],
            stocks: [0],
        });

        fb.controls.units.valueChanges.subscribe((value) => {
            if (!value) return;
            let units = value.split(',').map((x: string) => x.trim());
            setTimeout(() => fb.controls.defaultUnit.setValue(units[0]));
            setTimeout(() =>
                fb.controls.trackingUnit.setValue(units[units.length - 1]),
            );
        });

        this.formGroups.push(fb);
    }

    removeItem(index: number) {
        this.formGroups.splice(index, 1);
    }

    getDefaultUnits(fb: FormGroup) {
        if (!fb.controls.units.value) return [];
        return fb.controls.units.value.split(',').map((i: string) => i.trim());
    }

    getTrackingUnits(fb: FormGroup) {
        if (!fb.controls.units.value) return [];
        return fb.controls.units.value.split(',').map((i: string) => i.trim());
    }

    submit() {
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
        const tasks = this.formGroups.map((fb, index) => {
            const data = cloneDeep(fb.value);
            data.units = data.units
                .split(',')
                .map((unit: string) => unit.trim());
            data.name = data.name.trim();
            if (data.qtyPerUnit == '') {
                data.qtyPerUnit = 1;
            }
            if (!data.stocks) {
                delete data.stocks;
            }
            if (!data.barcode) {
                delete data.barcode;
            }
            if (!data.description) {
                delete data.description;
            }
            if (!data.minThreshold) {
                delete data.minThreshold;
            }
            if (!data.eachPrice) {
                delete data.eachPrice;
            }
            if (!data.discount) {
                data.discount = 0;
            }
            if (!data.supplier) {
                delete data.supplier;
            }
            if (!data.expiryDate) {
                delete data.expiryDate;
            }
            return this._itemService.create(data).pipe(
                map((res: any) => ({
                    index,
                    itemCode: data.code,
                    error: res?.error || null,
                })),
                catchError((err) => {
                    const httpErrorMsg =
                        err?.error?.message ||
                        err?.message ||
                        'Internal Server Error';
                    return of({
                        index,
                        itemCode: data.code,
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
            .forEach((idx) => this.removeItem(idx));

        if (errors.length) {
            this._confirmService.error(errors.join('\n'));
        } else {
            this._router.navigateByUrl('/pharmacy/items');
        }
    }
}
