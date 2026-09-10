import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MESSAGES } from 'app/app.config';
import { UserService } from 'app/core/user/user.service';
import { ConfirmService } from 'app/services/confirm.service';
import { utils, writeFile } from 'xlsx';
import moment from 'moment';
import { PharmReceiptService } from 'app/services/pharm-receipt.service';

@Component({
    selector: 'app-list-receipt',
    templateUrl: './list-receipt.component.html',
})
export class ListReceiptComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = [
        'receiptNo',
        'date',
        'patient.fullName',
        'items',
        'subTotal',
        // 'discountAmount',
        'grandTotal',
        'actions',
    ];

    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

    formGroup!: FormGroup;

    searchResult: any[] = [];

    role!: string;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(
        private _fb: FormBuilder,
        private confirmService: ConfirmService,
        private _receiptService: PharmReceiptService,
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

    showItem(items: any[]) {
        let data = items.map(
            (item) => item.code + ' * ' + item.quantity + item.unit,
        );
        let l = data.length;
        if (l > 5) {
            let n = l - 5;
            return (
                '<li>' +
                data.slice(0, 5).join('</li><li>') +
                '</li><p class="text-teal-600 text-xs">+' +
                n +
                ' more items</p>'
            );
        }
        return '<li>' + data.join('</li><li>') + '</li>';
    }
}
