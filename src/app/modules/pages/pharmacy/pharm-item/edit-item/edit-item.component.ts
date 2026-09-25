import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_CONFIG, MESSAGES } from 'app/app.config';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { clone } from 'lodash';
import { ConfirmService } from 'app/services/confirm.service';
import { PharmItemService } from 'app/services/pharm-item.service';

@Component({
    selector: 'app-edit-item',
    templateUrl: './edit-item.component.html',
})
export class EditItemComponent implements OnInit {
    isLoaded = false;

    formGroup!: FormGroup;

    id!: string;

    constructor(
        private _itemService: PharmItemService,
        private _fb: FormBuilder,
        private _confirmService: ConfirmService,
        private _router: Router,
        private route: ActivatedRoute,
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
            stocks: [''],
        });

        this.formGroup.controls.units.valueChanges.subscribe((value) => {
            if (!value) return;
            let units = value.split(',').map((x: string) => x.trim());
            setTimeout(() =>
                this.formGroup.controls.defaultUnit.setValue(units[0]),
            );
            setTimeout(() =>
                this.formGroup.controls.trackingUnit.setValue(
                    units[units.length - 1],
                ),
            );
        });

        this.route.params.subscribe(({ id }) => {
            this.id = id;
            this.loadData();
        });
    }

    loadData() {
        this._itemService.findById(this.id).subscribe((result: any) => {
            this.isLoaded = true;
            result.units = result.units.join(',');
            this.formGroup.patchValue(result);
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
            .confirm(MESSAGES.CONFIRM_UPDATE_ITEM)
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    confirmSubmit() {
        const data = clone(this.formGroup.value);
        data.units = data.units.split(',').map((unit: string) => unit.trim());
        data.name = data.name.trim();
        this._itemService.update(this.id, data).subscribe(() => {
            this._router.navigate(['/pharmacy/items']);
        });
    }

    getDefaultUnits() {
        if (!this.formGroup.controls.units.value) return [];
        return this.formGroup.controls.units.value
            .split(',')
            .map((i: string) => i.trim());
    }

    getTrackingUnits() {
        if (!this.formGroup.controls.units.value) return [];
        return this.formGroup.controls.units.value
            .split(',')
            .map((i: string) => i.trim());
    }
}
