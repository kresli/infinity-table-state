interface Point {
  x: number;
  y: number;
}

export class Projector {
  readonly source: DOMRect;
  readonly target: DOMRect;
  readonly scaleX: number;
  readonly scaleY: number;
  constructor(source: DOMRect, target: DOMRect) {
    this.source = source;
    this.target = target;
    this.scaleX = this.target.width / this.source.width;
    this.scaleY = this.target.height / this.source.height;
    if (isNaN(this.scaleX)) this.scaleX = 0;
    if (isNaN(this.scaleY)) this.scaleY = 0;
  }

  /**
   * Returns a new Projector with the source rect expanded by the given DOMRect delta.
   */
  addSource(delta: DOMRect): Projector {
    const { x: dx, y: dy, width: dw, height: dh } = delta;
    const expanded = new DOMRect(
      this.source.x + dx,
      this.source.y + dy,
      this.source.width + dw,
      this.source.height + dh
    );
    return new Projector(expanded, this.target);
  }

  addTarget(delta: Partial<DOMRect>): Projector {
    const { x: dx, y: dy, width: dw, height: dh } = delta;
    const expanded = new DOMRect(
      this.target.x + (dx ?? 0),
      this.target.y + (dy ?? 0),
      this.target.width + (dw ?? 0),
      this.target.height + (dh ?? 0)
    );
    return new Projector(this.source, expanded);
  }

  // /**
  //  * Ensures that projecting `rect` produces at least `minWidth` in the target,
  //  * expanding the source's width if necessary.
  //  */
  // ensureMinWidth(minWidth: number, rect: DOMRect): Projector {
  //   const projected = this.projectClientPositionRect(rect);
  //   if (projected.width >= minWidth) {
  //     return this;
  //   }
  //   // Compute how many source pixels correspond to the missing target width
  //   const extraSourceWidth = (minWidth - projected.width) / this.scaleX;
  //   // Only expand width (no offset)
  //   const delta = new DOMRect(0, 0, extraSourceWidth, 0);
  //   return this.add(delta);
  // }

  localToLocalX(x: number): number {
    if (!this.source.width) return 0;
    const relativeX = x / this.source.width;
    return relativeX * this.target.width;
  }

  projectClientPositionY(y: number): number {
    if (!this.source.height) return 0;
    const relativeY = (y - this.source.y) / this.source.height;
    return relativeY * this.target.height;
  }

  projectClientPositionX(x: number): number {
    if (!this.source.width) return 0;
    const relativeX = (x - this.source.x) / this.source.width;
    return relativeX * this.target.width;
  }

  projectClientPositionPoint(point: Point): Point {
    if (!this.source.width || !this.source.height) return { x: 0, y: 0 };
    const relativeX = (point.x - this.source.x) / this.source.width;
    const relativeY = (point.y - this.source.y) / this.source.height;
    return {
      x: relativeX * this.target.width,
      y: relativeY * this.target.height,
    };
  }

  projectClientPositionRect(rect: DOMRect): DOMRect {
    const x = (rect.x - this.source.x) * this.scaleX;
    const y = (rect.y - this.source.y) * this.scaleY;
    const width = rect.width * this.scaleX;
    const height = rect.height * this.scaleY;
    return new DOMRect(x, y, width, height);
  }
}
