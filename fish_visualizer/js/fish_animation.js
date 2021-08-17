// global variables to store the actual state of the animations. DO NOT MODIFY THESE VARIABLES MANUALLY
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
  if (current_rendering_mode != rendering_modes.slice) return;
  renderer.onRender = function () {
    fish_animation(camera_rotate_switch,true);
  };
}

function stop_slice_loop() {
  renderer.onRender = function () {
    fish_animation(camera_rotate_switch,false);
  };
}

// start/stop anmations in one function call 
// this can fix the concurrent read/write problem in my test case, if the problem reoccures, implement a semaphore or mutex
function set_animation(rotate, loop){
  renderer.onRender = function () {
    fish_animation(rotate,loop);
  };
}

function fish_animation(rotate = false, loop = false){
  if (rotate) rotate_camera_next();
  if (loop) loop_slices(); 
  camera_rotate_switch = rotate;
  slice_loop_switch = loop;
}