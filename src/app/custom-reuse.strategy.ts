import { ComponentRef } from '@angular/core';
import { ActivatedRouteSnapshot, RouteReuseStrategy, DetachedRouteHandle } from '@angular/router';

const routesToCache: string[] = [
    "a/:code", 
    "s/:usercode",
    "profiles/:id",
    "profiles/:id/images",
    "profiles/:id/albums",
    "p/:username",
    "p/:username/images",
    "p/:username/albums"
];
const routesWhenCacheActive: string[] = [
    "i/:code",
    "a/:code/:imgCode",
    "s:/:usercode/:imgCode"
]
const storedRouteHandles = new Map<string, DetachedRouteHandle>();
const storedRouteScrollY = new Map<string, number>();

export function customReuseStrategyClear() {
    storedRouteHandles.clear();
    storedRouteScrollY.clear();
}

export class CustomReuseStrategy implements RouteReuseStrategy {
    // Decides if the route should be stored
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return routesToCache.indexOf(this.getConfiguredUrl(route)) > -1;
    }

    //Store the information for the route we're destructing
    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        const url = this.getResolvedUrl(route);
        storedRouteHandles.set(url, handle);
        storedRouteScrollY.set(url, window.scrollY);
    }

    //Return true if we have a stored route object for the next route
    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        const cUrl = this.getConfiguredUrl(route);
        const rUrl = this.getResolvedUrl(route);

        // Trying to Cleanup handles
        if (routesToCache.indexOf(cUrl) == -1 && routesWhenCacheActive.indexOf(cUrl) == -1) {
            customReuseStrategyClear();
        }

        // If url is profile
        if (cUrl.startsWith("profiles/") || cUrl.startsWith("p/")) {
            // Delete all handles which isn't of the this profile
            const deleteFrom = rUrl.indexOf('/', cUrl.indexOf('/') + 1);
            const profileUrl = rUrl.substring(0, deleteFrom == -1 ? undefined : deleteFrom);
            
            [...storedRouteHandles.entries()]
                .filter(t => !t[0].startsWith(profileUrl))
                .forEach(t => storedRouteHandles.delete(t[0]));

            [...storedRouteScrollY.entries()]
                .filter(t => !t[0].startsWith(profileUrl))
                .forEach(t => storedRouteHandles.delete(t[0]));
        }

        return storedRouteHandles.has(rUrl) && storedRouteHandles.get(rUrl) != null;
    }

    //If we returned true in shouldAttach(), now return the actual route data for restoration
    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        const url = this.getResolvedUrl(route);
        const scrollY = storedRouteScrollY.get(url);
        if (scrollY != null)
            setTimeout(() => {
                window.scrollTo({ behavior: 'auto', left: 0, top: scrollY });
            });
        
        const handle = storedRouteHandles.get(url);
        return handle;
    }

    //Reuse the route if we're going to and from the same route
    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return future.routeConfig === curr.routeConfig;
    }

    getResolvedUrl(route: ActivatedRouteSnapshot): string {
        return this.trim(
            route.pathFromRoot
                .filter(v => v.url?.length > 0)
                .map(v => v.url.map(segment => segment.toString()).join('/'))
                .join('/'),
            '/'
            );
    }

    getConfiguredUrl(route: ActivatedRouteSnapshot): string {
        return this.trim(
            '/' + route.pathFromRoot
                .filter(v => v.routeConfig?.path?.length > 0)
                .map(v => v.routeConfig!.path)
                .join('/'),
            '/'
            );
    }

    trim(str, ch) {
        var start = 0, 
            end = str.length;
    
        while(start < end && str[start] === ch)
            ++start;
    
        while(end > start && str[end - 1] === ch)
            --end;
    
        return (start > 0 || end < str.length) ? str.substring(start, end) : str;
    }
}