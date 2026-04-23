import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MY_DATE_FORMATS } from 'app/app.config';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { ReceiptService } from 'app/services/receipt.service';

@Component({
    selector: 'app-view-receipt',
    templateUrl: './view-receipt.component.html',
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class ViewReceiptComponent implements OnInit {
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
