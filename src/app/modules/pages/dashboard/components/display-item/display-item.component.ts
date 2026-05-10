import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-display-item',
    templateUrl: './display-item.component.html',
})
export class DisplayItemComponent implements OnInit {
    @Input() title: string = '';

    @Input() current: number = 0;

    @Input() previous: number = 0;

    @Input() unit: string = '';

    @Input() isCurrency: boolean = false;

    constructor() {}

    ngOnInit(): void {}

    get percentage() {
        if (this.current === this.previous) {
            return 0;
        }
        if (this.current > this.previous) {
            return (
                ((this.current - this.previous) / (this.previous || 1)) * 100
            );
        }
        return ((this.previous - this.current) / this.previous) * 100;
    }

    get icon() {
        return this.current > this.previous
            ? 'arrow_drop_up'
            : 'arrow_drop_down';
    }

    get className() {
        return {
            'text-amber-500': this.current == this.previous,
            'text-teal-500': this.current > this.previous,
            'text-rose-500': this.current < this.previous,
        };
    }
}
