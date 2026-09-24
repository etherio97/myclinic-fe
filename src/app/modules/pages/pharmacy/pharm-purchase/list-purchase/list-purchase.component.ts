import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { APP_CONFIG, MESSAGES } from 'app/app.config';
import { UserService } from 'app/core/user/user.service';
import { ConfirmService } from 'app/services/confirm.service';
import { PharmPurchaseService } from 'app/services/pharm-purchase.service';
import moment from 'moment';

@Component({
    selector: 'app-list-purchase',
    templateUrl: './list-purchase.component.html',
})
export class ListPurchaseComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = [
        'purchasedDate',
        // 'item.code',
        'item.name',
        'supplier',
        'expiryDate',
        'cost',
        'quantity',
        'unit',
        'total',
        'actions',
    ];

    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

    formGroup!: FormGroup;

    searchResult: any[] = [];

    categories: any = [];

    itemTypes: any = APP_CONFIG.ITEM_TYPES;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    role!: string;

    grandTotal!: number;

    constructor(
        private _fb: FormBuilder,
        private confirmService: ConfirmService,
        private _purchaseService: PharmPurchaseService,
        private _userService: UserService,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            startDate: [moment().startOf('month')],
            endDate: [moment().endOf('month')],
            sortBy: ['date:desc'],
            status: ['Active'],
            itemCode: [''],
            itemName: [''],
        });

        this._userService.get().subscribe(({ role }) => {
            this.role = role;
            this.reloadData();
        });
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }

    reloadData() {
        const condition: any = {
            itemCode: this.formGroup.value.itemCode,
            itemName: this.formGroup.value.itemName,
            status: this.formGroup.value.status,
            sortBy: this.formGroup.value.sortBy,
        };
        if (moment.isMoment(this.formGroup.controls.startDate.value)) {
            condition.startDate =
                this.formGroup.controls.startDate.value.format('yyyy-MM-DD');
        } else {
            condition.startDate = moment(
                this.formGroup.controls.startDate.value,
            ).format('yyyy-MM-DD');
        }
        if (moment.isMoment(this.formGroup.controls.endDate.value)) {
            condition.endDate =
                this.formGroup.controls.endDate.value.format('yyyy-MM-DD');
        } else {
            condition.endDate = moment(
                this.formGroup.controls.endDate.value,
            ).format('yyyy-MM-DD');
        }
        this._purchaseService.getAll(condition).subscribe((result: any) => {
            this.searchResult = this.dataSource.data = result;
            this.grandTotal = result.reduce(
                (prev: number, current: any) =>
                    prev + parseFloat(current.total),
                0,
            );
        });
    }

    generateRemainingMonth(date: string) {
        let m = moment(date).diff(moment(), 'months');
        return m < 0 ? 'Expired' : m + ' months';
    }

    removeItem(id: string) {
        this.confirmService
            .confirm(MESSAGES.CONFIRM_DELETE_PHARM_PURCHASE)
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmRemoveItem(id),
            );
    }

    private confirmRemoveItem(id: string) {
        this._purchaseService.remove(id).subscribe(() => {
            this.confirmService
                .success(MESSAGES.SUCCESS_DELETE_PHARM_PURCHASE)
                .afterOpened()
                .subscribe(() => this.reloadData());
        });
    }

    archiveItem(id: string) {
        this.confirmService
            .confirm(MESSAGES.CONFIRM_ARCHIVE_PHARM_PURCHASE)
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmArchiveItem(id),
            );
    }

    confirmArchiveItem(id: string) {
        this._purchaseService
            .update(id, { status: 'Archive' })
            .subscribe(() => {
                this.confirmService
                    .success(MESSAGES.SUCCESS_ARCHIVE_PHARM_PURCHASE)
                    .afterOpened()
                    .subscribe(() => this.reloadData());
            });
    }

    unarchiveItem(id: string) {
        this.confirmService
            .confirm(MESSAGES.CONFIRM_UNARCHIVE_PHARM_PURCHASE)
            .beforeClosed()
            .subscribe(
                (value) =>
                    value === 'confirmed' && this.confirmUnrchiveItem(id),
            );
    }

    confirmUnrchiveItem(id: string) {
        this._purchaseService.update(id, { status: 'Active' }).subscribe(() => {
            this.confirmService
                .success(MESSAGES.SUCCESS_UNARCHIVE_PHARM_PURCHASE)
                .afterOpened()
                .subscribe(() => this.reloadData());
        });
    }
}
