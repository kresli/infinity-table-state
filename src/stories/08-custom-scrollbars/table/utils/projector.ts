interface Point {
  x: number;
  y: number;
}

export interface ProjectorRect {
  x: number;
  y: number;
  width: number;
  height: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
}
export class Projector {
  private source: ProjectorRect;
  private target: ProjectorRect;
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
