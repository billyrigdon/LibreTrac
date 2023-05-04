import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ScrollPositionService {
  private scrollPositions = new Map<string, number>();

  saveScrollPosition(routePath: string, position: number): void {
    // this.localStorage.set(routePath, position);
	localStorage.setItem(routePath, position.toString());
  }

  getScrollPosition(routePath: string): number | undefined {
    // return this.scrollPositions.get(routePath);
	return localStorage.getItem(routePath) ? parseInt(localStorage.getItem(routePath) as string) : undefined;
  }
}
