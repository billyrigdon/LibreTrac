import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private cache = new Map<string, DetachedRouteHandle>();

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // Define the routes you want to cache
    return route.routeConfig?.path !== 'route-to-not-cache';
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    if (route.routeConfig?.path) {
	this.cache.set(route.routeConfig.path, handle);
	}
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    if (route.routeConfig?.path) {
		return this.cache.has(route.routeConfig.path);
	} else {
		return false;
	}
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
	if (route.routeConfig?.path) {
    	return this.cache.get(route.routeConfig.path) as DetachedRouteHandle;
	} else {
		return {} as DetachedRouteHandle;
	}
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}
