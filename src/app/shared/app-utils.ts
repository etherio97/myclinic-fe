import { Navigation } from '../core/navigation/navigation.types';
import { FuseNavigationItem } from '../../@fuse/components/navigation';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AppUtils {
    hideNotAllowItem(userRoles: string[], navigation: Navigation): Navigation {
        if (navigation.default) {
            this.setHiddenPropertyList(userRoles, navigation.default);
        }

        if (navigation.compact) {
            this.setHiddenPropertyList(userRoles, navigation.compact);
        }

        if (navigation.futuristic) {
            this.setHiddenPropertyList(userRoles, navigation.futuristic);
        }

        if (navigation.horizontal) {
            this.setHiddenPropertyList(userRoles, navigation.horizontal);
        }

        return navigation;
    }

    setHiddenPropertyList(
        userRoles: string[],
        fuseItems: FuseNavigationItem[],
    ): void {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < fuseItems.length; i++) {
            this.setHiddenProperty(userRoles, fuseItems[i]);
            if (fuseItems[i].children && fuseItems[i].children.length > 0) {
                this.setHiddenPropertyList(userRoles, fuseItems[i].children);
            }
        }
    }

    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    setHiddenProperty(userRoles: string[], fuseItem: FuseNavigationItem): void {
        if (
            fuseItem.meta &&
            fuseItem.meta.roles &&
            fuseItem.meta.roles.length > 0
        ) {
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < fuseItem.meta.roles.length; i++) {
                if (userRoles.includes(fuseItem.meta.roles[i])) {
                    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
                    fuseItem.hidden = () => false;
                    return;
                }
            }
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            fuseItem.hidden = () => true;
        }
    }
}
