import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
    CalendarOptions,
    DateSelectArg,
    EventClickArg,
} from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { AppointmentService } from 'app/services/appointment.service';
import { Router } from '@angular/router';
import moment from 'moment';

@Component({
    selector: 'app-appointment-calendar',
    templateUrl: './appointment-calendar.component.html',
})
export class AppointmentCalendarComponent implements OnInit {
    calendarOptions: CalendarOptions = {
        plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        },
        initialView: 'dayGridMonth',
        initialEvents: [],
        weekends: true,
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        eventClick: this.handleEventClick.bind(this),
    };

    appointments: any[] = [];

    calendarVisible = true;

    constructor(
        private _changeDetection: ChangeDetectorRef,
        private _appointmentService: AppointmentService,
        private _router: Router,
    ) {}

    ngOnInit(): void {
        this.reloadData();
    }

    reloadData() {
        const startDate = moment().subtract(1, 'month').toISOString();
        const endDate = moment().add(2, 'month').toISOString();
        this.calendarVisible = false;
        this._appointmentService
            .getAll({ startDate, endDate })
            .subscribe((appointments: any) => {
                for (let appointment of appointments) {
                    // if (
                    //     ['Cancelled', 'No Show'].includes(
                    //         appointment.status,
                    //     )
                    // )
                    //     break;
                    this.appointments.push({
                        id: appointment.id,
                        status: appointment.status,
                        title: appointment.patient.fullName,
                        date: moment(appointment.appointmentDate).toISOString(),
                    });
                }
                this.calendarVisible = true;
            });
    }

    handleEventClick(clickInfo: EventClickArg) {
        this._router.navigate(['/appointments', 'view', clickInfo.event.id]);
    }

    ngClass(id: string) {
        const event = this.appointments.find((a) => a.id == id);
        return {
            'bg-teal-600': ['Completed'].includes(event.status),
            'bg-amber-600': ['Booked'].includes(event.status),
            'bg-indigo-600': [''].includes(event.status),
            'bg-rose-600': ['Cancelled', 'No Show'].includes(event.status),
        };
    }
}
