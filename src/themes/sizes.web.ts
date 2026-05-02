const BASE_WIDTH = 390;
const CONTAINER_WIDTH = Math.min(window.innerWidth, 450);
const scale = CONTAINER_WIDTH / BASE_WIDTH;

export const SIZES = {
  wp: (v: number) => v * scale,
  hp: (v: number) => v,
  width: CONTAINER_WIDTH,
  height: window.innerHeight,
};

export const SIZE = (size: number) => Math.round(size * scale);
