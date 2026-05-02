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
import { APP_CONFIG } from 'app/app.config';
import { UserService } from 'app/services/user.service';
import { UserService as LoggedUserService } from 'app/core/user/user.service';
import { ConfirmService } from 'app/services/confirm.service';

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

    roles: string[] = [];

    formGroup!: FormGroup;

    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    @ViewChild('createUserModal') createUserModalRef!: TemplateRef<any>;

    @ViewChild('changeRoleModal') changeRoleModalRef!: TemplateRef<any>;

    _modal!: MatDialogRef<HTMLElement>;

    loggedUserId!: string;

    selectedUser!: any;

    role!: string;

    constructor(
        private _fb: FormBuilder,
        private _userService: UserService,
        private _loggedUserService: LoggedUserService,
        private _confirmService: ConfirmService,
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
            this.role = user.role;
            switch (this.role) {
                case 'manager':
                    this.roles = APP_CONFIG.MANAGER_ROLES;
                    break;
                case 'admin':
                    this.roles = APP_CONFIG.ADMIN_ROLES;
                    break;
            }
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
        this._modal = this.dialog.open(this.createUserModalRef, {
            width: '100%',
            minWidth: '280px',
            maxWidth: '380px',
        });
    }

    submit() {
        if (!this.formGroup.valid) {
            return this._confirmService.error(
                'Please fill all the required fields.',
                'Invalid',
            );
        }

        this._confirmService
            .confirm('Are you sure to create this user?')
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    confirmSubmit() {
        this._userService.register(this.formGroup.value).subscribe(() => {
            this._modal.close();
            this.reloadData();
            this._confirmService.success('User has been added!');
        });
    }

    removeUser(user: any) {
        this._confirmService
            .confirm('Are you sure to delete this user?')
            .beforeClosed()
            .subscribe(
                (value) =>
                    value === 'confirmed' && this.confirmRemoveUser(user),
            );
    }

    confirmRemoveUser(user: any) {
        this._userService.remove(user.id).subscribe(() => {
            this.reloadData();
            this._confirmService.success('User has been deleted!');
        });
    }

    changeRole(user: any) {
        this.selectedUser = user;
        this._modal = this.dialog.open(this.changeRoleModalRef, {
            width: '100%',
            minWidth: '280px',
            maxWidth: '380px',
        });
    }

    confirmChangeRole() {
        this._userService
            .changeRole(this.selectedUser.id, this.selectedUser.role)
            .subscribe((data) => {
                this._modal.close();
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
            .confirm(message)
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
                this._confirmService.success('User status has been changed!');
            });
    }
}
