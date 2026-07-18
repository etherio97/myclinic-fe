import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_CONFIG, MESSAGES } from 'app/app.config';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { clone } from 'lodash';
import { ConfirmService } from 'app/services/confirm.service';
import { LabTestItemService } from 'app/services/lab-test-item.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-edit-lab-item',
    templateUrl: './edit-lab-item.component.html',
})
export class EditLabItemComponent implements OnInit {
    id!: string;

    isLoaded = false;

    formGroup!: FormGroup;

    categories: any = [];

    subgroups: any = [];

    itemTypes = APP_CONFIG.LAB_ITEM_TYPES;

    subgroupFilteredOptions!: Observable<string[]>;

    categoryFilteredOptions!: Observable<string[]>;

    constructor(
        private _labTestItemService: LabTestItemService,
        private _fb: FormBuilder,
        private _confirmService: ConfirmService,
        private _router: Router,
        private sanitizer: DomSanitizer,
        private _route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            name: ['', Validators.required],
            type: ['', Validators.required],
            category: ['', Validators.required],
            subgroup: [''],
            unit: [''],
            rangeLow: [''],
            rangeHigh: [''],
            rangeMaleLow: [''],
            rangeMaleHigh: [''],
            rangeFemaleLow: [''],
            rangeFemaleHigh: [''],
            enumValues: [''],
            refText: [''],
            customFooter: [''],
            priority: [''],
        });

        this._labTestItemService.getCategory().subscribe((result: any) => {
            this.categories = result;
        });

        this._labTestItemService
            .getSubGroups({ category: '' })
            .subscribe((result: any) => {
                this.subgroups = result;
            });

        this._route.params.subscribe(({ id }) => {
            this.id = id;
            this.loadData();
        });

        this.categoryFilteredOptions =
            this.formGroup.controls.category.valueChanges.pipe(
                startWith(''),
                map((value) => this._filterCategory(value || '')),
            );

        this.subgroupFilteredOptions =
            this.formGroup.controls.subgroup.valueChanges.pipe(
                startWith(''),
                map((value) => this._filterSubgroup(value || '')),
            );
    }

    loadData() {
        this._labTestItemService
            .findById(this.id)
            .subscribe((response: any) => {
                this.isLoaded = true;
                this.formGroup.patchValue({
                    name: response.name,
                    type: response.type,
                    category: response.category,
                    subgroup: response.subgroup || '',
                    unit: response.unit || '',
                    enumValues: response.enumValues || '',
                    refText: response.refText || '',
                    customFooter: response.customFooter || '',
                    priority: response.priority,
                    rangeLow: response.range ? response.range.low : '',
                    rangeHigh: response.range ? response.range.high : '',
                    rangeMaleLow: response.rangeMale
                        ? response.rangeMale.low
                        : '',
                    rangeMaleHigh: response.rangeMale
                        ? response.rangeMale.high
                        : '',
                    rangeFemaleLow: response.rangeFemale
                        ? response.rangeFemale.low
                        : '',
                    rangeFemaleHigh: response.rangeFemale
                        ? response.rangeFemale.high
                        : '',
                });
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
        const request: any = {
            range: null,
            rangeMale: null,
            rangeFemale: null,
            enumValues: null,
        };
        const data = clone(this.formGroup.value);
        data.name = data.name.trim();
        if (data.unit) data.unit = data.unit.trim();
        if (data.refText) data.refText = data.refText.trim();

        switch (data.type) {
            case 'enum':
                request.enumValues = data.enumValues
                    .split(',')
                    .map((i: string) => i.trim())
                    .join(',');
                break;
            case 'numeric':
                if (
                    data.rangeLow !== null &&
                    data.rangeHigh !== null &&
                    data.rangeLow !== '' &&
                    data.rangeHigh !== ''
                ) {
                    request.range = {
                        low: data.rangeLow,
                        high: data.rangeHigh,
                    };
                }
                if (
                    data.rangeMaleLow !== null &&
                    data.rangeMaleHigh !== null &&
                    data.rangeMaleLow !== '' &&
                    data.rangeMaleHigh !== ''
                ) {
                    request.rangeMale = {
                        low: data.rangeMaleLow,
                        high: data.rangeMaleHigh,
                    };
                }
                if (
                    data.rangeFemaleLow !== null &&
                    data.rangeFemaleHigh !== null &&
                    data.rangeFemaleLow !== '' &&
                    data.rangeFemaleHigh !== ''
                ) {
                    request.rangeFemale = {
                        low: data.rangeFemaleLow,
                        high: data.rangeFemaleHigh,
                    };
                }

                break;
        }

        this._labTestItemService
            .update(this.id, {
                name: data.name,
                type: data.type,
                category: data.category || null,
                subgroup: data.subgroup || null,
                unit: data.unit || null,
                priority: data.priority || 0,
                refText: data.refText || null,
                customFooter: data.customFooter || null,
                ...request,
            })
            .subscribe((response: any) => {
                if (response.error) {
                    return this._confirmService.error(
                        MESSAGES.UNEXPECTED_ERROR,
                    );
                }
                this._router.navigate(['/laboratory', 'items']);
            });
    }

    private _filterCategory(value: string) {
        const filterValue = value.toString().toLowerCase();

        return this.categories.filter((option: string) =>
            option.toLowerCase().includes(filterValue),
        );
    }

    private _filterSubgroup(value: string) {
        const filterValue = value.toString().toLowerCase();

        return this.subgroups.filter((option: string) =>
            option.toLowerCase().includes(filterValue),
        );
    }

    sanitize(html: string) {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}
