import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MY_DATE_FORMATS } from 'app/app.config';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { ReceiptService } from 'app/services/receipt.service';

@Component({
    selector: 'app-view-deleted-receipt',
    templateUrl: './view-deleted-receipt.component.html',
})
export class ViewDeletedReceiptComponent implements OnInit {
    id!: string;

    data!: any;

    constructor(
        private _receiptService: ReceiptService,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(({ id }) => {
            this.id = id;
            this.loadData();
        });
    }

    loadData() {
        this._receiptService.findById(this.id).subscribe((result) => {
            this.data = result;
        });
    }

    handlePrint() {
        window.print();
    }
}
