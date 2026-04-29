import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { BooleanInput } from '@angular/cdk/coercion';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from 'app/core/user/user.service';
import { AuthService } from 'app/core/auth/auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserService as UserApiService } from 'app/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmService } from 'app/services/confirm.service';

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'user',
})
export class UserComponent implements OnInit, OnDestroy {
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_showAvatar: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */

    @Input()
    showAvatar: boolean = true;

    user!: any;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    @ViewChild('changePasswordRef') changePasswordRef!: TemplateRef<any>;

    _modal!: MatDialogRef<HTMLElement>;

    formGroup!: FormGroup;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _userService: UserService,
        private _authService: AuthService,
        private _uesrApiService: UserApiService,
        private _confirmService: ConfirmService,
        private _dialog: MatDialog,
        private _fb: FormBuilder,
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to user changes
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: any) => {
                this.user = user;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.formGroup = this._fb.group({
            oldPassword: ['', Validators.required],
            newPassword: ['', Validators.required],
            retypePassword: ['', Validators.required],
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Sign out
     */
    signOut(): void {
        this._authService.signOut();
        this._router.navigate(['/login']);
    }

    openChangePasswordModal() {
        this.formGroup.reset();
        this._modal = this._dialog.open(this.changePasswordRef, {
            disableClose: true,
        });
    }

    submit() {
        if (!this.formGroup.valid) {
            return this._confirmService.error(
                'Please fill all the required fields.',
                'Invalid',
            );
        }

        if (
            this.formGroup.value.newPassword !=
            this.formGroup.value.retypePassword
        ) {
            return this._confirmService.error(
                'New password does not match.',
                'Invalid',
            );
        }

        this._confirmService
            .confirm('Are you sure do you want to change your password?')
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    confirmSubmit() {
        this._uesrApiService
            .changePassword(
                this.formGroup.value.oldPassword,
                this.formGroup.value.newPassword,
            )
            .subscribe((response: any) => {
                if (response.error) {
                    return this._confirmService.error(response.message);
                }
                this._confirmService.success('Password has been changed');
                this._modal.close();
            });
    }
}
