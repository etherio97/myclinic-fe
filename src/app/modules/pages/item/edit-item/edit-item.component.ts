import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_CONFIG, MY_DATE_FORMATS } from 'app/app.config';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { ItemService } from 'app/services/item.service';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { clone } from 'lodash';
import { ConfirmService } from 'app/services/confirm.service';

@Component({
    selector: 'app-edit-item',
    templateUrl: './edit-item.component.html',
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class EditItemComponent implements OnInit {
    formGroup!: FormGroup;

    categories: any = [];

    itemTypes: any = APP_CONFIG.ITEM_TYPES;

    itemTypeFilteredOptions!: Observable<string[]>;

    categoryFilteredOptions!: Observable<string[]>;

    id!: string;

    constructor(
        private _itemService: ItemService,
        private _fb: FormBuilder,
        private _confirmService: ConfirmService,
        private _router: Router,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            name: ['', Validators.required],
            itemType: ['', Validators.required],
            category: ['', Validators.required],
            sellingPrice: ['', Validators.required],
            basePrice: [''],
        });

        this.formGroup.controls.itemType.valueChanges.subscribe((value) => {
            this._itemService.getUtils(value).subscribe((result: any) => {
                this.categories = result;
            });
        });

        this.itemTypeFilteredOptions =
            this.formGroup.controls.itemType.valueChanges.pipe(
                startWith(''),
                map((value) => this._filterItemType(value || '')),
            );

        this.categoryFilteredOptions =
            this.formGroup.controls.category.valueChanges.pipe(
                startWith(''),
                map((value) => this._filterCategory(value || '')),
            );

        this.route.params.subscribe(({ id }) => {
            this.id = id;
            this.loadData();
        });
    }

    loadData() {
        this._itemService.findById(this.id).subscribe((result: any) => {
            this.formGroup.controls.name.setValue(result.name);
            this.formGroup.controls.itemType.setValue(result.itemType);
            this.formGroup.controls.category.setValue(result.category);
            this.formGroup.controls.sellingPrice.setValue(result.sellingPrice);
            this.formGroup.controls.basePrice.setValue(result.basePrice);
        });
    }

    submit() {
        if (!this.formGroup.valid) {
            return this._confirmService.error(
                'Please fill all the required fields.',
                'Invalid',
            );
        }

        this._confirmService
            .confirm('Are you sure to edit this item?')
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    confirmSubmit() {
        const data = clone(this.formGroup.value);
        if (!data.basePrice) data.basePrice = 0;
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
