import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { UserService } from 'app/core/user/user.service';
import { DoctorService } from 'app/services/doctor.service';

@Component({
    selector: 'app-list-doctor',
    templateUrl: './list-doctor.component.html',
})
export class ListDoctorComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = [
        'doctorNo',
        'fullName',
        // 'licenseNo',
        'specialization',
        'phoneNumber',
        'isActive',
        // 'createdAt',
        'actions',
    ];

    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

    formGroup!: FormGroup;

    searchResult: any[] = [];

    role!: string;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(
        private _fb: FormBuilder,
        private confirmService: FuseConfirmationService,
        private _doctorService: DoctorService,
        private _userService: UserService,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            searchValue: '',
            searchBy: 'fullName',
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
        const condition: any = { listAll: 1 };

        if (this.formGroup.value.searchValue) {
            condition[this.formGroup.value.searchBy] =
                this.formGroup.value.searchValue;
        }

        this._doctorService.getAll(condition).subscribe((result: any) => {
            this.searchResult = this.dataSource.data = result;
        });
    }

    removeDoctor(id: string) {
        this.confirmService
            .open({
                title: 'Confirmation',
                message: 'Are you sure to delete?',
                icon: { color: 'primary' },
                actions: { confirm: { color: 'primary' } },
                dismissible: true,
            })
            .beforeClosed()
            .subscribe(
                (value) =>
                    value === 'confirmed' && this.confirmRemoveDoctor(id),
            );
    }

    confirmRemoveDoctor(id: string) {
        this._doctorService.remove(id).subscribe(() => {
            this.confirmService
                .open({
                    title: 'Success',
                    message: 'Doctor has been successfully deleted',
                    icon: { color: 'success', name: '' },
                    actions: {
                        confirm: { show: false },
                        cancel: { label: 'OK' },
                    },
                })
                .afterOpened()
                .subscribe(() => this.reloadData());
        });
    }
}
