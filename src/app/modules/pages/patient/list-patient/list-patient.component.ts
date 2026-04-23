import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { UserService } from 'app/core/user/user.service';
import { PatientService } from 'app/services/patient.service';

@Component({
    selector: 'app-list-patient',
    templateUrl: './list-patient.component.html',
})
export class ListPatientComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = [
        'patientNo',
        'fullName',
        'dateOfBirth',
        // 'gender',
        'phoneNumber',
        // 'bloodType',
        // 'address',
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
        private _patientService: PatientService,
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
        const condition: any = {};

        if (this.formGroup.value.searchValue) {
            condition[this.formGroup.value.searchBy] =
                this.formGroup.value.searchValue;
        }

        this._patientService.getAll(condition).subscribe((result: any) => {
            this.searchResult = this.dataSource.data = result;
        });
    }

    removePatient(id: string) {
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
                    value === 'confirmed' && this.confirmRemovePatient(id),
            );
    }

    confirmRemovePatient(id: string) {
        this._patientService.remove(id).subscribe((data: any) => {
            if (data.error) {
                this.confirmService
                    .open({
                        title: 'Error',
                        message: 'Failed to delete the pateint!',
                        icon: { color: 'error', name: 'mat_outline:cancel' },
                        actions: {
                            confirm: { show: false },
                            cancel: { label: 'OK' },
                        },
                    })
                    .afterOpened()
                    .subscribe(() => this.reloadData());
            } else {
                this.confirmService
                    .open({
                        title: 'Success',
                        message: 'Patient has been successfully deleted',
                        icon: { color: 'success', name: 'mat_outline:check' },
                        actions: {
                            confirm: { show: false },
                            cancel: { label: 'OK' },
                        },
                    })
                    .afterOpened()
                    .subscribe(() => this.reloadData());
            }
        });
    }

    calculateAge(dateOfBirth: string): number {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (
            monthDifference < 0 ||
            (monthDifference === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }

        return age;
    }
}
