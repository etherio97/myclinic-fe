import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { APP_CONFIG, MESSAGES } from 'app/app.config';
import { UserService } from 'app/core/user/user.service';
import { ConfirmService } from 'app/services/confirm.service';
import { PharmItemService } from 'app/services/pharm-item.service';

@Component({
    selector: 'app-list-item',
    templateUrl: './list-item.component.html',
})
export class ListItemComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = [
        'code',
        'name',
        'defaultUnit',
        'unitPrice',
        'eachPrice',
        'stocks',
        'actions',
    ];

    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

    formGroup!: FormGroup;

    searchResult: any[] = [];

    categories: any = [];

    itemTypes: any = APP_CONFIG.ITEM_TYPES;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    role!: string;

    constructor(
        private _fb: FormBuilder,
        private confirmService: ConfirmService,
        private _itemService: PharmItemService,
        private _userService: UserService,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            name: '',
            code: '',
            barcode: '',
        });

        this._userService.get().subscribe(({ role }) => {
            this.role = role;

            if (this.role == 'lab-admin') {
                this.formGroup.controls.itemType.setValue('Laboratory');
            }

            this.initializeData();
        });
    }

    initializeData() {
        this.reloadData();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }

    reloadData() {
        this._itemService
            .getAll(this.formGroup.value)
            .subscribe((result: any) => {
                this.searchResult = this.dataSource.data = result;
            });
    }

    removeItem(id: string) {
        this.confirmService
            .confirm(MESSAGES.CONFIRM_DELETE_PHARM_ITEM)
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmRemoveItem(id),
            );
    }

    confirmRemoveItem(id: string) {
        this._itemService.remove(id).subscribe(() => {
            this.confirmService
                .success(MESSAGES.SUCCESS_DELETE_PHARM_ITEM)
                .afterOpened()
                .subscribe(() => this.reloadData());
        });
    }
}
