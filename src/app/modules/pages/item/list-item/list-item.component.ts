import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FuseConfirmationService } from '@fuse/services/confirmation';
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

    itemTypes: any = [];

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(
        private _fb: FormBuilder,
        private confirmService: FuseConfirmationService,
        private _itemService: ItemService,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            name: '',
            itemType: '',
            category: '',
        });

        this._itemService.getUtils().subscribe((result: any) => {
            this.categories = result.categories;
            this.itemTypes = result.itemTypes;
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
            .open({
                title: 'Confirmation',
                message: 'Are you sure to delete?',
                icon: { color: 'primary' },
                actions: { confirm: { color: 'primary' } },
                dismissible: true,
            })
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmRemoveItem(id),
            );
    }

    confirmRemoveItem(id: string) {
        this._itemService.remove(id).subscribe(() => {
            this.confirmService
                .open({
                    title: 'Success',
                    message: 'Item has been successfully deleted',
                    icon: { color: 'success', name: '' },
                    actions: {
                        confirm: { show: false },
                        cancel: { label: 'OK' },
                    },
                })
                .afterOpened()
                .subscribe(() => this.reloadData());
        });
    }
}
