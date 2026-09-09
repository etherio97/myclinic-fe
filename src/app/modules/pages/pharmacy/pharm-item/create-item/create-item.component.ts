import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { APP_CONFIG, MESSAGES, MY_DATE_FORMATS } from 'app/app.config';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { clone } from 'lodash';
import { ConfirmService } from 'app/services/confirm.service';
import { PharmItemService } from 'app/services/pharm-item.service';

@Component({
    selector: 'app-create-item',
    templateUrl: './create-item.component.html',
})
export class CreateItemComponent implements OnInit {
    formGroup!: FormGroup;

    constructor(
        private _itemService: PharmItemService,
        private _fb: FormBuilder,
        private _confirmService: ConfirmService,
        private _router: Router,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
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
        data.units = data.units.split(',').map((unit: string) => unit.trim());
        if (data.defaultUnit == '') {
            data.defaultUnit = data.units[0];
        }
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
        this._itemService.create(data).subscribe(({ error }: any) => {
            if (error) {
                this._confirmService.error('Something went wrong');
                return;
            }
            this._router.navigate(['/pharmacy/items']);
        });
    }
}
