import { ActivatedRouteSnapshot, RouteReuseStrategy, DetachedRouteHandle } from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {
    routesToCache: string[] = [
        "a/:code", 
        "s/:usercode",
        "profiles/:id",
        "profiles/:id/images",
        "profiles/:id/albums",
        "p/:username",
        "p/:username/images",
        "p/:username/albums"
    ];
    routesWhenCacheActive: string[] = [
        "i/:code",
        "a/:code/:imgCode",
        "s:/:usercode/:imgCode"
    ]
    storedRouteHandles = new Map<string, DetachedRouteHandle>();

    // Decides if the route should be stored
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return this.routesToCache.indexOf(this.getConfiguredUrl(route)) > -1;
    }

    //Store the information for the route we're destructing
    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        this.storedRouteHandles.set(this.getResolvedUrl(route), handle);
    }

    //Return true if we have a stored route object for the next route
    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        const cUrl = this.getConfiguredUrl(route);
        const rUrl = this.getResolvedUrl(route);

        // Trying to Cleanup handles
        if (this.routesToCache.indexOf(cUrl) == -1 && this.routesWhenCacheActive.indexOf(cUrl) == -1)
            this.storedRouteHandles.clear();

        // If url is profile
        if (cUrl.startsWith("profiles/") || cUrl.startsWith("p/")) {
            // Delete all handles which isn't of the this profile
            const id = route.params["id"];
            const username = route.params["username"];
            [...this.storedRouteHandles.entries()]
                .filter(
                    t => !t[0].startsWith("profiles/" + id + "/") && t[0] != "profiles/" + id && 
                        !t[0].startsWith("p/" + username + "/") && t[0] != "p/" + username)
                .forEach(t => this.storedRouteHandles.delete(t[0]));
        }

        return this.storedRouteHandles.has(rUrl) && this.storedRouteHandles.get(rUrl) != null;
    }

    //If we returned true in shouldAttach(), now return the actual route data for restoration
    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        return this.storedRouteHandles.get(this.getResolvedUrl(route));
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