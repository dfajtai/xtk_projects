var camera_rotate_step = null;
var default_camerate_rotate_step = 5;


function rotate_camera_next(rotate_step = null){
  if (!rotate_step) rotate_step = camera_rotate_step;
  if (!rotate_step) rotate_step = default_camerate_rotate_step;
  camera_rotate_step = rotate_step;
  renderer.camera.rotate([rotate_step, 0]);
}

function rotate_camera_previous(rotate_step = null){
  if (!rotate_step) rotate_step = camera_rotate_step;
  if (!rotate_step) rotate_step = default_camerate_rotate_step;
  camera_rotate_step = rotate_step;
  renderer.camera.rotate([rotate_step, 0]);
}

function invert_camera_rotation() {
  camera_rotate_step = -camera_rotate_step;
}

function set_camera_y_rotation(angle){
  init_camera_position();
  let rad = angle * (Math.PI/180);
  let M = [...renderer.camera.o]
  M[0] = Math.cos(rad);
  M[2] = Math.sin(rad);
  M[8] = -Math.sin(rad);
  M[10] = Math.cos(rad);
  renderer.camera.o = M;
}