import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReceiptService } from 'app/services/receipt.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'app-view-receipt',
    templateUrl: './view-receipt.component.html',
})
export class ViewReceiptComponent implements OnInit {
    id!: string;

    data!: any;

    role!: string;

    constructor(
        private _receiptService: ReceiptService,
        private route: ActivatedRoute,
        private _userService: UserService,
    ) {}

    ngOnInit(): void {
        this._userService.get().subscribe((result) => {
            this.role = result.role;
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
}
