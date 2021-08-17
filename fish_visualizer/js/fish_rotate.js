var camera_views = { top: 1, side: 2, front: 3 }
var axis_view_dict = { x: camera_views.side, y: camera_views.top, z: camera_views.front };

// camera rotation settings
current_rotate_step = null;
// fish_settings.rotate.default_rotate_step = 5;

// camera rotation "step" forward
function rotate_camera_next(rotate_step = null) {
  if (!rotate_step) rotate_step = current_rotate_step;
  if (!rotate_step) rotate_step = fish_settings.rotate.default_rotate_step;
  current_rotate_step = rotate_step;
  renderer.camera.rotate([rotate_step, 0]);
}

// camera rotation "step" backward
function rotate_camera_previous(rotate_step = null) {
  if (!rotate_step) rotate_step = current_rotate_step;
  if (!rotate_step) rotate_step = fish_settings.rotate.default_rotate_step;
  current_rotate_step = rotate_step;
  renderer.camera.rotate([-rotate_step, 0]);
}

// inverts the camera rotation direction
function invert_camera_rotation() {
  current_rotate_step = -current_rotate_step;
}

// sets camera rotation along the y axis 
function set_camera_y_rotation(angle) {
  reset_camera();
  let rad = angle * (Math.PI / 180);
  let M = [...renderer.camera.o]
  M[0] = Math.cos(rad);
  M[2] = Math.sin(rad);
  M[8] = -Math.sin(rad);
  M[10] = Math.cos(rad);
  renderer.camera.o = M;
}


// sets camera to one of the three main views
function set_camera_to_view(view, distance = null) {
  var position = null;
  if (!distance) distance = camera_distance;
  switch (view) {
    case camera_views.top:
      position = new Float32Array([0, 1, 0, 0, 0, 0, -1, 0, -1, 0, 0, 0, 0, 0, - distance, 1]);
      break;
    case camera_views.front:
      position = new Float32Array([1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, - distance, 1]);
      break;
    case camera_views.side:
      position = new Float32Array([0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 0, 0, - distance, 1]);
      break;
    default:
      return false;
  }
  renderer.camera.focus = [0, 0, 0];
  renderer.camera.o = [...position];
}