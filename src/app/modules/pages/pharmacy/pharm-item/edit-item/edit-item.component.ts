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

        this.route.params.subscribe(({ id }) => {
            this.id = id;
            this.loadData();
        });
    }

    loadData() {
        this._itemService.findById(this.id).subscribe((result: any) => {
            this.isLoaded = true;
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
        this._itemService.update(this.id, data).subscribe(() => {
            this._router.navigate(['/pharmacy/items']);
        });
    }
}
