import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { APP_CONFIG } from 'app/app.config';
import { UserService } from 'app/core/user/user.service';
import { ConfirmService } from 'app/services/confirm.service';
import { ReceiptService } from 'app/services/receipt.service';
import moment from 'moment';

@Component({
    selector: 'app-list-receipt',
    templateUrl: './list-receipt.component.html',
})
export class ListReceiptComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = [
        'receiptNo',
        'date',
        'patient.fullName',
        'doctor.fullName',
        'type',
        // 'paymentMethod',
        // 'subTotal',
        // 'discountAmount',
        'grandTotal',
        'actions',
    ];

    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

    formGroup!: FormGroup;

    searchResult: any[] = [];

    role!: string;

    types = APP_CONFIG.ITEM_TYPES;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(
        private _fb: FormBuilder,
        private confirmService: ConfirmService,
        private _receiptService: ReceiptService,
        private _userService: UserService,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            startDate: [moment()],
            endDate: [moment()],
            type: [''],
        });

        this._userService.get().subscribe((user) => {
            this.role = user.role;
        });

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
        if (this.formGroup.controls.type.value) {
            condition.type = this.formGroup.controls.type.value;
        }
        this._receiptService.getAll(condition).subscribe((result: any) => {
            this.searchResult = this.dataSource.data = result;
        });
    }

    removeReceipt(id: string) {
        this.confirmService
            .confirm('Are you sure to delete?')
            .beforeClosed()
            .subscribe(
                (value) =>
                    value === 'confirmed' && this.confirmRemoveReceipt(id),
            );
    }

    confirmRemoveReceipt(id: string) {
        this._receiptService.remove(id).subscribe(() => {
            this.confirmService
                .success('Receipt has been successfully deleted')
                .afterOpened()
                .subscribe(() => this.reloadData());
        });
    }
}
