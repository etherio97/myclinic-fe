import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/services/user.service';

@Component({
    selector: 'auth-login',
    templateUrl: './login.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm!: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signInForm!: FormGroup;
    newPasswordForm!: FormGroup;
    showAlert: boolean = false;

    @ViewChild('createNewPasswordModal') createNewPasswordModal: any;

    private _modal: any;

    showNewPasswordAlert: boolean = false;
    newPasswordAlert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _dialogModal: MatDialog,
        private _userService: UserService,
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signInForm = this._formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', Validators.required],
        });

        this.newPasswordForm = this._formBuilder.group({
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        this._authService.signIn(this.signInForm.value).subscribe(
            ({ error, message, isDefaultPassword }) => {
                if (isDefaultPassword) {
                    return this.openCreateNewPasswordModal();
                }

                if (error) {
                    // Set the alert
                    this.alert = {
                        type: 'error',
                        message: message || 'Something went wrong!',
                    };

                    // Show the alert
                    this.showAlert = true;
                    // Re-enable the form
                    this.signInForm.enable();

                    // Reset the form
                    this.signInNgForm.resetForm();
                    return;
                }
                // Set the redirect url.
                // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                // to the correct page after a successful sign in. This way, that url can be set via
                // routing file and we don't have to touch here.
                const redirectURL =
                    this._activatedRoute.snapshot.queryParamMap.get(
                        'redirectURL',
                    ) || '/';

                // Navigate to the redirect url
                this._router.navigateByUrl(redirectURL);
            },
            (response) => {
                // Re-enable the form
                this.signInForm.enable();

                // Reset the form
                this.signInNgForm.resetForm();

                // Set the alert
                this.alert = {
                    type: 'error',
                    message: 'Something went wrong!',
                };

                // Show the alert
                this.showAlert = true;
            },
        );
    }

    submitNewPassword() {
        if (this.newPasswordForm.invalid) {
            this.showNewPasswordAlert = true;
            this.newPasswordAlert = {
                type: 'error',
                message: 'Password must be at least 6 characters or nubmers',
            };
            return;
        }

        if (
            this.newPasswordForm.value.newPassword !==
            this.newPasswordForm.value.confirmPassword
        ) {
            this.showNewPasswordAlert = true;
            this.newPasswordAlert = {
                type: 'error',
                message: 'Both password must be same.',
            };
            return;
        }

        this._userService
            .newPassword(
                this.signInForm.value.username,
                this.signInForm.value.password,
                this.newPasswordForm.value.newPassword,
            )
            .subscribe(({ error, message }: any) => {
                if (error) {
                    this.showNewPasswordAlert = true;
                    this.newPasswordAlert = {
                        type: 'error',
                        message: message || 'Unexcepted Error',
                    };
                    return;
                }

                this.signInForm.controls.password.setValue(
                    this.newPasswordForm.value.newPassword,
                );
                this._modal.close();
                this.signIn();
            });
    }

    private openCreateNewPasswordModal() {
        this._modal = this._dialogModal.open(this.createNewPasswordModal, {
            width: '100%',
            minWidth: '320px',
            maxWidth: '520px',
            disableClose: true,
        });
    }
}
