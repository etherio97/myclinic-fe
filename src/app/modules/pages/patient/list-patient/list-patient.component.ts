import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from 'app/core/user/user.service';
import { ConfirmService } from 'app/services/confirm.service';
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
        private confirmService: ConfirmService,
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
            .confirm('Are you sure to delete?')
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
                    .error('Failed to delete the pateint!')
                    .afterOpened()
                    .subscribe(() => this.reloadData());
            } else {
                this.confirmService
                    .success('Patient has been successfully deleted')
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
