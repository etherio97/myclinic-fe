import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { APP_CONFIG } from 'app/app.config';
import { ConfirmService } from 'app/services/confirm.service';
import { ItemService } from 'app/services/item.service';

@Component({
    selector: 'app-list-item',
    templateUrl: './list-item.component.html',
})
export class ListItemComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = [
        'name',
        'itemType',
        'category',
        'basePrice',
        'sellingPrice',
        // 'isActive',
        'actions',
    ];

    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

    formGroup!: FormGroup;

    searchResult: any[] = [];

    categories: any = [];

    itemTypes: any = APP_CONFIG.ITEM_TYPES;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(
        private _fb: FormBuilder,
        private confirmService: ConfirmService,
        private _itemService: ItemService,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            name: '',
            itemType: '',
            category: '',
        });

        this._itemService.getUtils().subscribe((result: any) => {
            this.categories = result;
        });

        this.formGroup.controls.itemType.valueChanges.subscribe((value) => {
            this.formGroup.controls.category.setValue('');
            this._itemService.getUtils(value).subscribe((result: any) => {
                this.categories = result;
            });
        });

        this.reloadData();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }

    reloadData() {
        this._itemService
            .getAll(this.formGroup.value)
            .subscribe((result: any) => {
                this.searchResult = this.dataSource.data = result;
            });
    }

    removeItem(id: string) {
        this.confirmService
            .confirm('Are you sure to delete?')
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmRemoveItem(id),
            );
    }

    confirmRemoveItem(id: string) {
        this._itemService.remove(id).subscribe(() => {
            this.confirmService
                .success('Item has been successfully deleted')
                .afterOpened()
                .subscribe(() => this.reloadData());
        });
    }
}
