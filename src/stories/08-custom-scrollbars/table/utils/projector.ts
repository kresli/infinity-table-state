/**
 * Encapsulates the logic for mapping between content scroll
 * and thumb position on a 1-D scrollbar track.
 */
class ScrollProjector {
  private contentSize: number;
  private viewportSize: number;
  private trackSize: number;
  private thumbMinSize: number;

  private contentTravel: number;
  private rawThumb: number;
  private thumbSize: number;
  private trackTravel: number;

  constructor({
    contentSize,
    viewportSize,
    trackSize,
    thumbMinSize = 0,
  }: {
    contentSize: number;
    viewportSize: number;
    trackSize: number;
    thumbMinSize?: number;
  }) {
    this.contentSize = contentSize;
    this.viewportSize = viewportSize;
    this.trackSize = trackSize;
    this.thumbMinSize = thumbMinSize;

    // total scrollable distance in content
    this.contentTravel = Math.max(this.contentSize - this.viewportSize, 0);
    // "ideal" thumb length (proportional to viewport/content)
    this.rawThumb = (this.viewportSize / this.contentSize) * this.trackSize;
    // respect minimum size
    this.thumbSize = Math.max(this.rawThumb, this.thumbMinSize);
    // how far the thumb can move
    this.trackTravel = this.trackSize - this.thumbSize;
  }

  /**
   * Given the current scroll offset (0…contentTravel),
   * returns the thumb’s X position on the track (0…trackTravel).
   */
  public contentToTrack(scrollOffset: number): number {
    if (this.contentTravel === 0) return 0;
    const clamped = Math.min(Math.max(scrollOffset, 0), this.contentTravel);
    return (clamped / this.contentTravel) * this.trackTravel;
  }

  /**
   * Inverse mapping: from a point along the track (0…trackTravel)
   * back to a content scroll offset (0…contentTravel).
   */
  public trackToContent(trackPos: number): number {
    if (this.trackTravel === 0) return 0;
    const clamped = Math.min(Math.max(trackPos, 0), this.trackTravel);
    return (clamped / this.trackTravel) * this.contentTravel;
  }

  /**
   * The current thumb size (in track coordinates).
   */
  public getThumbSize(): number {
    // If content fits in viewport, thumb fills track
    return this.contentTravel === 0 ? this.trackSize : this.thumbSize;
  }
}

export { ScrollProjector };
