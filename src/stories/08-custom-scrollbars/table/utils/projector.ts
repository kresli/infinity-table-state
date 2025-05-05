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

  offsetTargetSize(x?: number, y?: number): Projector {
    const expanded = new DOMRect(
      this.target.x,
      this.target.y,
      this.target.width + (x ?? 0),
      this.target.height + (y ?? 0)
    );
    return new Projector(this.source, expanded);
  }

  offsetSourceSize(x?: number, y?: number): Projector {
    const expanded = new DOMRect(
      this.source.x,
      this.source.y,
      this.source.width + (x ?? 0),
      this.source.height + (y ?? 0)
    );
    return new Projector(expanded, this.target);
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
