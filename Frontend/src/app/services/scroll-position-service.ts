import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ScrollPositionService {
  private scrollPositions = new Map<string, number>();

  saveScrollPosition(routePath: string, position: number): void {
    this.scrollPositions.set(routePath, position);
  }

  getScrollPosition(routePath: string): number | undefined {
    return this.scrollPositions.get(routePath);
  }
}
