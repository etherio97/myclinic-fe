import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { APP_CONFIG } from 'app/app.config';
import { UserService } from 'app/core/user/user.service';
import { ConfirmService } from 'app/services/confirm.service';
import { ExpenseService } from 'app/services/expense.service';
import { cloneDeep } from 'lodash';
import { utils, writeFile } from 'xlsx';
import moment from 'moment';

@Component({
    selector: 'app-list-expense',
    templateUrl: './list-expense.component.html',
})
export class ListExpenseComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = [
        'date',
        'description',
        'category',
        'amount',
        'actions',
    ];

    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

    formGroup!: FormGroup;

    createFormGroup!: FormGroup;

    searchResult: any[] = [];

    role!: string;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    categories = APP_CONFIG.EXPENSE_CATEGORY;

    @ViewChild('createModal') createModal: any;
    @ViewChild('detailModal') detailModal: any;

    _modal: any;

    mode = 'create';

    grandTotal = 0;

    element!: any;

    constructor(
        private _fb: FormBuilder,
        private _confirmService: ConfirmService,
        private _expenseService: ExpenseService,
        private _userService: UserService,
        private _dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            startDate: [moment()],
            endDate: [moment()],
            category: [[]],
        });

        this.createFormGroup = this._fb.group({
            date: ['', [Validators.required]],
            description: ['', [Validators.required]],
            category: ['', [Validators.required]],
            amount: ['', [Validators.required]],
            notes: ['', []],
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
        const selectedCategories = this.formGroup.controls.category.value;
        if (
            selectedCategories &&
            selectedCategories.length > 0 &&
            selectedCategories[0] !== ''
        ) {
            condition.category = selectedCategories;
        }
        // If 'All' is selected or nothing is selected, do not send category filter
        this._expenseService.getAll(condition).subscribe((data: any) => {
            let grandTotal = 0;
            this.searchResult = this.dataSource.data = data;
            if (Array.isArray(data)) {
                for (let item of data) {
                    grandTotal += Number.parseFloat(item.amount);
                }
            }
            this.grandTotal = grandTotal;
        });
    }

    viewExpenseModal(element: any) {
        this.element = element;
        this._dialog.open(this.detailModal);
    }

    openCreateModal() {
        this.createFormGroup.reset({ date: moment() });
        this.mode = 'create';
        this._modal = this._dialog.open(this.createModal);
    }

    createExpense() {
        if (this.createFormGroup.invalid)
            return this._confirmService.error(
                'Please fill all the required fields.',
                'Invalid',
            );
        if (this.mode === 'edit') return this.updateExpense();
        this._confirmService
            .confirm('Are you sure to add this expense?')
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmCreateExpense(),
            );
    }

    private confirmCreateExpense() {
        const data = cloneDeep(this.createFormGroup.value);
        data.amount = Number.parseFloat(data.amount);
        this._expenseService.create(data).subscribe(() => {
            this._modal.close();
            this._confirmService.success('Expense has been added.');
            this.reloadData();
        });
    }

    openEditModal(element: any) {
        this.createFormGroup.setValue({
            date: moment(element.date),
            description: element.description,
            amount: Number.parseFloat(element.amount),
            category: element.category,
            notes: element.notes,
        });
        this.mode = 'edit';
        this.element = element;
        this._modal = this._dialog.open(this.createModal);
    }

    private updateExpense() {
        this._confirmService
            .confirm('Are you sure to update this expense?')
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmUpdateExpense(),
            );
    }

    private confirmUpdateExpense() {
        const data = cloneDeep(this.createFormGroup.value);
        data.amount = Number.parseFloat(data.amount);
        this._expenseService.update(this.element.id, data).subscribe(() => {
            this._modal.close();
            this._confirmService.success('Expense has been updated.');
            this.reloadData();
        });
    }

    removeExpense(id: string) {
        this._confirmService
            .confirm('Are you sure to delete this expense?')
            .beforeClosed()
            .subscribe(
                (value) =>
                    value === 'confirmed' && this.confirmRemoveExpense(id),
            );
    }

    private confirmRemoveExpense(id: string) {
        this._expenseService.remove(id).subscribe(() => {
            this._confirmService
                .success('Expense has been successfully deleted')
                .afterOpened()
                .subscribe(() => this.reloadData());
        });
    }

    exportExcel() {
        const fileName = `myclinic-expenses-${moment().format('YYYYMMDDHHmmss')}.xlsx`;
        const worksheet = utils.json_to_sheet(
            this.searchResult.map((data) => {
                let i = 1;
                return {
                    'No.': i++,
                    Date: moment(data.date).format('YYYY-MM-DD hh:mm:ss A'),
                    Description: data.description,
                    Category: data.category,
                    Amount: Number.parseInt(data.amount),
                    Notes: data.notes || '',
                    'Created User': data.user.fullName,
                    'Created At': moment(data.createdAt).format(
                        'YYYY-MM-DD hh:mm:ss A',
                    ),
                };
            }),
        );
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Expenses');
        writeFile(workbook, fileName);
    }
}
