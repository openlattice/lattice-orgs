/*
 * @flow
 */

const APP_CONTAINER_MAX_WIDTH :number = 2000;

// 1020 = 960 for content + 2*30 for edges padding
const APP_CONTAINER_WIDTH :number = 1020;
const APP_CONTENT_PADDING :number = 30;
const APP_CONTENT_WIDTH :number = APP_CONTAINER_WIDTH - (APP_CONTENT_PADDING * 2);

export {
  APP_CONTAINER_MAX_WIDTH,
  APP_CONTAINER_WIDTH,
  APP_CONTENT_PADDING,
  APP_CONTENT_WIDTH,
};
