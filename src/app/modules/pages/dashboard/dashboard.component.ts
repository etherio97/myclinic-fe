import { Component, OnInit } from '@angular/core';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
    role!: string;

    constructor(private _userService: UserService) {}

    ngOnInit(): void {
        this._userService.get().subscribe((user) => {
            this.role = user.role;
        });
    }
}
