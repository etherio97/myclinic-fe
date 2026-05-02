import { Component, OnInit } from '@angular/core';
import { slideInBottom, slideOutBottom } from '@fuse/animations/slide';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [slideInBottom, slideOutBottom],
})
export class AppComponent implements OnInit {
    isOnline = true;

    /**
     * Constructor
     */
    constructor() {}

    ngOnInit(): void {
        window.addEventListener('online', () => {
            this.isOnline = true;
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }
}
