var camera_rotate_switch = false;
var slice_loop_switch = false;

function start_camera_rotation() {
  renderer.onRender = function () {
    fish_animation(true,slice_loop_switch);
  };
}

function stop_camera_rotation() {
  renderer.onRender = function () {
    fish_animation(false,slice_loop_switch);
  };
}

function start_slice_loop() {
  renderer.onRender = function () {
    fish_animation(camera_rotate_switch,true);
  };
}

function stop_slice_loop() {
  renderer.onRender = function () {
    fish_animation(camera_rotate_switch,false);
  };
}

function fish_animation(rotate = false, loop = false){
  if (rotate) rotate_camera();
  if (loop) loop_slices(); 
  camera_rotate_switch = rotate;
  slice_loop_switch = loop;
}