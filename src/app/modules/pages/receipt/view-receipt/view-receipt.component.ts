import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReceiptService } from 'app/services/receipt.service';
import { UserService } from 'app/core/user/user.service';
import moment from 'moment';

@Component({
    selector: 'app-view-receipt',
    templateUrl: './view-receipt.component.html',
})
export class ViewReceiptComponent implements OnInit {
    id!: string;

    data!: any;

    role!: string;

    userId!: string;

    constructor(
        private _receiptService: ReceiptService,
        private route: ActivatedRoute,
        private _userService: UserService,
    ) {}

    ngOnInit(): void {
        this._userService.get().subscribe((result) => {
            this.role = result.role;
            this.userId = result.id;
        });

        this.route.params.subscribe(({ id }) => {
            this.id = id;
            this.loadData();
        });
    }

    loadData() {
        this._receiptService.findById(this.id).subscribe((result) => {
            this.data = result;

            this.route.queryParams.subscribe(
                (params) =>
                    params.print === 'true' &&
                    setTimeout(() => this.handlePrint()),
            );
        });
    }

    handlePrint() {
        window.print();
    }

    checkEditPermission() {
        if (!this.data) return false;
        if (this.role === 'admin' || this.role === 'manager') return true;
        if (
            this.role === 'cashier' &&
            this.userId === this.data.user.id &&
            moment().diff(moment(this.data.createdAt), 'minutes') <= 30
        )
            return true;
        return false;
    }
}
