/*
 * Home Camera sidebar panel — every home camera on one page, for every user (not only administrators).
 *
 * Two tabs under the toolbar, as in Smart Comfort: Cameras (the cameras full page: the card's illustrated header as a
 * card, then the video wall edge to edge) and, for administrators only, Settings (a header card with its illustrated
 * banner, the sidebar title, the cameras of Home Assistant not shown yet, from home_camera/discover, the cameras shown
 * as the panel's own list — reordered by drag or arrow keys, each edited with the card editor's camera fields — and
 * the card's display options, with a copy of a camera card found on a dashboard). The settings come from home_camera/subscribe,
 * open to every user and pushed again whenever they change; home_camera/update_settings (administrators)
 * saves them. The tab is in the address (/cameras/settings). The panel draws its toolbar, tabs and forms itself;
 * the camera grid is the card's (streams, privacy, HD / SD, PTZ, fullscreen).
 *
 * https://github.com/juju35/ha-camera
 */
export var HOME_CAMERA_PANEL_VERSION = '4.12.1';
