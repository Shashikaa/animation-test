// app/utils/scrollVelocity.ts
let _velocity = 0;
export const getScrollVelocity = () => _velocity;
export const setScrollVelocity = (v: number) => { _velocity = v; };