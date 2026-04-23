import {
    AfterViewInit,
    Component,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { APP_CONFIG } from 'app/app.config';
import { UserService } from 'app/services/user.service';
import { UserService as LoggedUserService } from 'app/core/user/user.service';

@Component({
    selector: 'app-list-user',
    templateUrl: './list-user.component.html',
})
export class ListUserComponent implements OnInit, AfterViewInit {
    users: any[] = [];

    displayedColumns = [
        'fullName',
        'username',
        'status',
        'role',
        'createdAt',
        'actions',
    ];

    roles = APP_CONFIG.ROLES;

    formGroup!: FormGroup;

    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    @ViewChild('createUserModal') createUserModalRef!: TemplateRef<any>;

    _modal!: MatDialogRef<HTMLElement>;

    loggedUserId!: string;

    constructor(
        private _fb: FormBuilder,
        private _userService: UserService,
        private _loggedUserService: LoggedUserService,
        private _confirmService: FuseConfirmationService,
        private dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            fullName: ['', Validators.required],
            username: ['', Validators.required],
            password: ['', Validators.required],
            role: ['', Validators.required],
        });

        this._loggedUserService.get().subscribe((user) => {
            this.loggedUserId = user.sub;
        });

        this.reloadData();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }

    reloadData() {
        this._userService.getAll().subscribe((users: any) => {
            this.users = this.dataSource.data = users;
        });
    }

    openCreateUserModal() {
        this._modal = this.dialog.open(this.createUserModalRef);
    }

    submit() {
        if (!this.formGroup.valid) {
            return this._confirmService.open({
                title: 'Invalid',
                message: 'Please fill all the required fields.',
                actions: {
                    cancel: { label: 'OK' },
                    confirm: { show: false },
                },
                dismissible: true,
            });
        }

        this._confirmService
            .open({
                title: 'Confirmation',
                message: 'Are you sure to create this user?',
                dismissible: true,
            })
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    confirmSubmit() {
        this._userService.register(this.formGroup.value).subscribe(() => {
            this._modal.close();
            this.reloadData();
            this._confirmService.open({
                title: 'Success',
                message: 'User has been added!',
                icon: { color: 'success', name: '' },
                actions: {
                    confirm: { show: false },
                    cancel: { label: 'OK' },
                },
            });
        });
    }

    removeUser(user: any) {
        this._confirmService
            .open({
                title: 'Confirmation',
                message: 'Are you sure to delete this user?',
                dismissible: true,
            })
            .beforeClosed()
            .subscribe(
                (value) =>
                    value === 'confirmed' && this.confirmRemoveUser(user),
            );
    }

    confirmRemoveUser(user: any) {
        this._userService.remove(user.id).subscribe(() => {
            this.reloadData();
            this._confirmService.open({
                title: 'Success',
                message: 'User has been deleted!',
                icon: { color: 'success', name: '' },
                actions: {
                    confirm: { show: false },
                    cancel: { label: 'OK' },
                },
            });
        });
    }

    changeStatus(user: any) {
        let message = '';
        if (user.isActive) {
            message = 'Are you sure do you want to inactive this user?';
        } else {
            message = 'Are you sure do you want to active this user?';
        }

        this._confirmService
            .open({
                title: 'Confirmation',
                message,
                dismissible: true,
            })
            .beforeClosed()
            .subscribe(
                (value) =>
                    value === 'confirmed' && this.confirmChangeStatus(user),
            );
    }

    confirmChangeStatus(user: any) {
        this._userService
            .changeStatus(user.id, user.isActive ? false : true)
            .subscribe(() => {
                this.reloadData();
                this._confirmService.open({
                    title: 'Success',
                    message: 'User status has been changed!',
                    icon: { color: 'success', name: '' },
                    actions: {
                        confirm: { show: false },
                        cancel: { label: 'OK' },
                    },
                });
            });
    }
}
