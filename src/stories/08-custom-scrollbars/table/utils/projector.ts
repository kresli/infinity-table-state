interface Point {
  x: number;
  y: number;
}

export class ProjectorRect {
  x: number;
  y: number;
  width: number;
  height: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.left = x;
    this.top = y;
    this.right = x + width;
    this.bottom = y + height;
  }
}
export class Projector {
  private source: ProjectorRect;
  readonly target: ProjectorRect;
  readonly scaleX: number;
  readonly scaleY: number;
  constructor(source: ProjectorRect, target: ProjectorRect) {
    this.source = source;
    this.target = target;
    this.scaleX = this.target.width / this.source.width;
    this.scaleY = this.target.height / this.source.height;
    if (isNaN(this.scaleX)) this.scaleX = 0;
    if (isNaN(this.scaleY)) this.scaleY = 0;
  }

  /**
   * Returns a new Projector with the source rect expanded by the given ProjectorRect delta.
   */
  addSource(delta: ProjectorRect): Projector {
    const { x: dx, y: dy, width: dw, height: dh } = delta;
    const expanded = new ProjectorRect(
      this.source.x + dx,
      this.source.y + dy,
      this.source.width + dw,
      this.source.height + dh
    );
    return new Projector(expanded, this.target);
  }

  addTarget(delta: Partial<ProjectorRect>): Projector {
    const { x: dx, y: dy, width: dw, height: dh } = delta;
    const expanded = new ProjectorRect(
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
  // ensureMinWidth(minWidth: number, rect: ProjectorRect): Projector {
  //   const projected = this.projectClientPositionRect(rect);
  //   if (projected.width >= minWidth) {
  //     return this;
  //   }
  //   // Compute how many source pixels correspond to the missing target width
  //   const extraSourceWidth = (minWidth - projected.width) / this.scaleX;
  //   // Only expand width (no offset)
  //   const delta = new ProjectorRect(0, 0, extraSourceWidth, 0);
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

  projectClientPositionRect(rect: ProjectorRect): ProjectorRect {
    const x = (rect.x - this.source.x) * this.scaleX;
    const y = (rect.y - this.source.y) * this.scaleY;
    const width = rect.width * this.scaleX;
    const height = rect.height * this.scaleY;
    const right = x + width;
    const bottom = y + height;
    return { x, y, width, height, left: x, top: y, right, bottom };
  }
}
