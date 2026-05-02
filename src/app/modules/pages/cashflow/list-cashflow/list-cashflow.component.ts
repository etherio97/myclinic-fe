import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { APP_CONFIG } from 'app/app.config';
import { UserService } from 'app/core/user/user.service';
import { CashflowService } from 'app/services/cashflow.service';
import { ConfirmService } from 'app/services/confirm.service';
import { clone } from 'lodash';
import moment from 'moment';

@Component({
    selector: 'app-list-cashflow',
    templateUrl: './list-cashflow.component.html',
})
export class ListCashflowComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = [
        'date',
        'description',
        'category',
        'cashIn',
        'cashOut',
        // 'remarks',
        'actions',
    ];

    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

    searchFormGroup!: FormGroup;

    searchResult: any[] = [];

    role!: string;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    @ViewChild('createModal') createModal: any;
    @ViewChild('detailModal') detailModal: any;

    _modal: any;

    data: any;

    cashIn = 0;
    cashOut = 0;
    balance = 0;

    createFormGroup!: FormGroup;

    categories = APP_CONFIG.CASHFLOW_CATEGORY;

    constructor(
        private _fb: FormBuilder,
        private confirmService: ConfirmService,
        private _userService: UserService,
        private _cashflowService: CashflowService,
        private _dialog: MatDialog,
        private _confirmService: ConfirmService,
    ) {}

    ngOnInit(): void {
        this.searchFormGroup = this._fb.group({
            startDate: [moment().startOf('month')],
            endDate: [moment().endOf('month')],
        });

        this.createFormGroup = this._fb.group({
            date: [moment(), Validators.required],
            description: ['', Validators.required],
            category: ['', Validators.required],
            cashIn: [''],
            cashOut: [''],
            remarks: [''],
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
        if (moment.isMoment(this.searchFormGroup.controls.startDate.value)) {
            condition.startDate =
                this.searchFormGroup.controls.startDate.value.format(
                    'yyyy-MM-DD',
                );
        } else {
            condition.startDate = moment(
                this.searchFormGroup.controls.startDate.value,
            ).format('yyyy-MM-DD');
        }
        if (moment.isMoment(this.searchFormGroup.controls.endDate.value)) {
            condition.endDate =
                this.searchFormGroup.controls.endDate.value.format(
                    'yyyy-MM-DD',
                );
        } else {
            condition.endDate = moment(
                this.searchFormGroup.controls.endDate.value,
            ).format('yyyy-MM-DD');
        }
        this._cashflowService.getAll(condition).subscribe((result: any) => {
            if (!Array.isArray(result))
                return (this.searchResult = this.dataSource.data = []);

            let cashIn = 0,
                cashOut = 0,
                balance = 0;

            for (let item of result) {
                if (Number.parseFloat(item.cashIn))
                    cashIn += Number.parseFloat(item.cashIn);
                if (Number.parseFloat(item.cashOut))
                    cashOut += Number.parseFloat(item.cashOut);
            }

            this.searchResult = this.dataSource.data = result;
            this.cashIn = cashIn;
            this.cashOut = cashOut;
            this.balance = cashIn - cashOut;
        });
    }

    openCreateCashflowModal() {
        this.createFormGroup.reset({ date: moment() });
        this._modal = this._dialog.open(this.createModal, {
            width: '100%',
            minWidth: '280px',
            maxWidth: '380px',
        });
    }

    submit() {
        if (this.createFormGroup.invalid)
            return this._confirmService.error(
                'Please fill all the required fields.',
                'Invalid',
            );
        if (
            !this.createFormGroup.value.cashIn &&
            !this.createFormGroup.value.cashOut
        )
            return this._confirmService.error(
                'Must input cash in or cash out amount.',
                'Invalid',
            );
        if (
            this.createFormGroup.value.cashIn &&
            this.createFormGroup.value.cashOut
        )
            return this._confirmService.error(
                'Both cash in and cash out cannot be inputted.',
                'Invalid',
            );
        this._confirmService
            .confirm('Are you sure to add this cashflow?')
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    private confirmSubmit() {
        const data = clone(this.createFormGroup.value);
        data.cashIn = Number.parseFloat(data.cashIn || 0);
        data.cashOut = Number.parseFloat(data.cashOut || 0);
        this._cashflowService.create(data).subscribe(() => {
            this._modal.close();
            this.reloadData();
        });
    }

    openDetailCashflowModal(element: any) {
        this.data = element;
        this._modal = this._dialog.open(this.detailModal, {
            width: '100%',
            minWidth: '280px',
            maxWidth: '380px',
        });
    }

    openEditCashflowModal(element: any) {
        //
    }

    removeCashflow(id: string) {
        this.confirmService
            .confirm('Are you sure to delete?')
            .beforeClosed()
            .subscribe(
                (value) =>
                    value === 'confirmed' && this.confirmRemoveCashflow(id),
            );
    }

    private confirmRemoveCashflow(id: string) {
        this._cashflowService.remove(id).subscribe(() => {
            this.confirmService
                .success('Cashflow has been successfully deleted')
                .afterOpened()
                .subscribe(() => this.reloadData());
        });
    }

    showDescription(text: string) {
        let max = 50;
        if (text.length > max) {
            return text.slice(0, max) + '...';
        }
        return text;
    }
}
