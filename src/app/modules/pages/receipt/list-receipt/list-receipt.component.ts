import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { APP_CONFIG, MESSAGES, MY_DATE_FORMATS } from 'app/app.config';
import { UserService } from 'app/core/user/user.service';
import { ConfirmService } from 'app/services/confirm.service';
import { ReceiptService } from 'app/services/receipt.service';
import { utils, writeFile } from 'xlsx';
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

    grandTotal = 0;

    clinicTotal = 0;

    labTotal = 0;

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

            if (this.role == 'lab-admin') {
                this.formGroup.controls.type.setValue('Laboratory');
            }

            this.reloadData();
        });
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
            let grandTotal = 0,
                clinicTotal = 0,
                labTotal = 0;
            if (Array.isArray(result)) {
                for (let item of result) {
                    grandTotal += Number.parseFloat(item.grandTotal);
                    switch (item.type) {
                        case 'Clinic':
                            clinicTotal += Number.parseFloat(item.grandTotal);
                            break;
                        case 'Laboratory':
                            labTotal += Number.parseFloat(item.grandTotal);
                            break;
                    }
                }
            }
            this.grandTotal = grandTotal;
            this.clinicTotal = clinicTotal;
            this.labTotal = labTotal;
        });
    }

    removeReceipt(id: string) {
        this.confirmService
            .confirm(MESSAGES.CONFIRM_DELETE_RECEIPT)
            .beforeClosed()
            .subscribe(
                (value) =>
                    value === 'confirmed' && this.confirmRemoveReceipt(id),
            );
    }

    private confirmRemoveReceipt(id: string) {
        this._receiptService.remove(id).subscribe(() => {
            this.confirmService
                .success(MESSAGES.SUCCESS_DELETE_RECEIPT)
                .afterOpened()
                .subscribe(() => this.reloadData());
        });
    }

    exportExcel() {
        const fileName = `myclinic-receipts-${moment().format('YYYYMMDDHHmmss')}.xlsx`;
        const worksheet = utils.json_to_sheet(
            [...this.searchResult].reverse().map((data) => {
                return {
                    'Receipt ID': data.receiptNo,
                    Date: moment(data.date).format('YYYY-MM-DD hh:mm:ss A'),
                    'Patient Name': data.patient.fullName,
                    'Doctor Name': data.doctor ? data.doctor.fullName : '',
                    'Cashier Name': data.user ? data.user.fullName : '',
                    Type: data.type,
                    'Payment Method': data.paymentMethod,
                    'Sub Total': parseInt(data.subTotal || '0'),
                    'Discount Amount': parseInt(data.discountAmount || '0'),
                    'Grand Total': parseInt(data.grandTotal || '0'),
                    Items: data.items
                        .map((item: any) => {
                            return `${item.name} (${item.quantity} x ${item.sellingPrice})`;
                        })
                        .join(', '),
                    'Created At': moment(data.createdAt).format(
                        'YYYY-MM-DD hh:mm:ss A',
                    ),
                };
            }),
        );
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Receipts');
        writeFile(workbook, fileName);
    }
}
