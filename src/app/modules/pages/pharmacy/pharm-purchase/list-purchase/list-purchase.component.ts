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
        'item.name',
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
        const condition: any = {};
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
        this._purchaseService.remove(id).subscribe(() => {
            this.confirmService
                .success(MESSAGES.SUCCESS_DELETE_PHARM_ITEM)
                .afterOpened()
                .subscribe(() => this.reloadData());
        });
    }
}
