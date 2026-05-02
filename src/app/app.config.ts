import { FuseNavigationItem } from '../@fuse/components/navigation';

export const BASE_URL = ['localhost', '127.0.0.1'].includes(location.hostname)
    ? `http://${location.hostname}:3000`
    : `${location.protocol}//${location.hostname}/api`;

export const SERVICE_URLS = {
    DOCTOR_API: `${BASE_URL}/doctor`,
    PATIENT_API: `${BASE_URL}/patient`,
    ITEM_API: `${BASE_URL}/item`,
    RECEIPT_API: `${BASE_URL}/receipt`,
    AUTH_API: `${BASE_URL}/auth`,
    APPOINTMENT_API: `${BASE_URL}/appointment`,
    DASHBOARD_API: `${BASE_URL}/dashboard`,
};

export const APP_CONFIG = {
    ROLES: ['admin', 'manager', 'cashier'],
    GENDERS: ['Male', 'Female'],
    APPOINTMENT_STATUS: ['Booked', 'Completed', 'No Show', 'Cancelled'],
    APPOINTMENT_TYPES: ['Old', 'New', 'Follow Up'],
    APPOINTMENT_CASES: [
        'OPD',
        'Laboratory',
        'Home Vist',
        'Daycare',
        'Ultrasound',
    ],
    ITEM_TYPES: ['Clinic', 'Laboratory'],
};

export const NAVIGATION_ITEMS: FuseNavigationItem[] = [
    {
        type: 'group',
        children: [
            {
                id: 'dashboard',
                title: 'Dashboard',
                type: 'basic',
                icon: 'mat_solid:dashboard',
                link: '/dashboard',
                meta: {
                    roles: ['admin', 'manager', 'cashier'],
                },
            },
            {
                id: 'patients',
                title: 'Patients',
                type: 'basic',
                icon: 'mat_solid:people',
                link: '/patients',
                meta: {
                    roles: ['admin', 'manager', 'cashier'],
                },
            },
            {
                id: 'receipts',
                title: 'Receipts',
                type: 'basic',
                icon: 'mat_solid:receipt_long',
                link: '/receipts',
                meta: {
                    roles: ['admin', 'manager', 'cashier'],
                },
            },
            {
                id: 'appointments',
                title: 'Appointments',
                type: 'basic',
                icon: 'mat_solid:edit_calendar',
                link: '/appointments',
                meta: {
                    roles: ['admin', 'manager', 'cashier'],
                },
            },
            {
                id: 'appointment-calendar',
                title: 'Appointment Calendar',
                type: 'basic',
                icon: 'heroicons_solid:calendar',
                link: '/appointment-calendar',
                meta: {
                    roles: ['admin', 'manager', 'cashier'],
                },
            },
            {
                id: 'doctors',
                title: 'Doctors',
                type: 'basic',
                icon: 'mat_solid:local_hospital',
                link: '/doctors',
                meta: {
                    roles: ['admin', 'manager', 'cashier'],
                },
            },
            {
                id: 'items',
                title: 'Items',
                type: 'basic',
                icon: 'mat_solid:inventory_2',
                link: '/items',
                meta: {
                    roles: ['admin', 'manager', 'cashier'],
                },
            },

            {
                id: 'users',
                title: 'Users',
                type: 'basic',
                icon: 'mat_solid:admin_panel_settings',
                link: '/users',
                meta: {
                    roles: ['admin'],
                },
            },
        ],
    },
];

export const MY_DATE_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY', // How the input is parsed from manual typing
    },
    display: {
        dateInput: 'DD/MM/YYYY', // How the date is displayed in the input field
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};
