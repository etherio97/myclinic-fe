import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { APP_CONFIG, MESSAGES } from 'app/app.config';
import { UserService } from 'app/core/user/user.service';
import { ConfirmService } from 'app/services/confirm.service';
import { LabTestItemService } from 'app/services/lab-test-item.service';

@Component({
    selector: 'app-lab-item-list',
    templateUrl: './lab-item-list.component.html',
})
export class LabItemListComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = [
        'name',
        // 'type',
        'category',
        'subgroup',
        'unit',
        'actions',
    ];

    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

    formGroup!: FormGroup;

    searchResult: any[] = [];

    categories: any = [];

    subgroups: any = [];

    itemTypes: any = APP_CONFIG.LAB_ITEM_TYPES;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    role!: string;

    constructor(
        private _fb: FormBuilder,
        private confirmService: ConfirmService,
        private _labTestItemService: LabTestItemService,
        private _userService: UserService,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            name: '',
            type: '',
            category: '',
            subgroup: '',
        });

        this._userService.get().subscribe(({ role }) => {
            this.role = role;
            this.initializeData();
        });
    }

    initializeData() {
        this._labTestItemService.getCategory().subscribe((result: any) => {
            this.categories = result;
        });

        this._labTestItemService
            .getSubGroups({ category: '' })
            .subscribe((result: any) => {
                this.subgroups = result;
            });

        this.formGroup.controls.category.valueChanges.subscribe((value) => {
            this.formGroup.controls.subgroup.setValue('');
            this._labTestItemService
                .getSubGroups({ category: value })
                .subscribe((result: any) => {
                    this.subgroups = result;
                });
        });

        this.reloadData();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }

    reloadData() {
        this._labTestItemService
            .getAll({ ...this.formGroup.value, updatedAt: 1 })
            .subscribe((result: any) => {
                this.searchResult = this.dataSource.data = result;
            });
    }

    removeItem(id: string) {
        this.confirmService
            .confirm(MESSAGES.CONFIRM_DELETE_ITEM)
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmRemoveItem(id),
            );
    }

    confirmRemoveItem(id: string) {
        this._labTestItemService.remove(id).subscribe(() => {
            this.confirmService
                .success(MESSAGES.SUCCESS_DELETE_ITEM)
                .afterOpened()
                .subscribe(() => this.reloadData());
        });
    }
}
