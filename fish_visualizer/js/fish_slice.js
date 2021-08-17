var bbox = null;
var axis_dict = { x: 0, y: 1, z: 2 };

// fish_settings.slice.default_axis = "x";
var current_slice_axis = null;

// parameters
// fish_settings.slice.loop_step_size = 2; // only every loop_step_size'th slice will be shown
// fish_settings.slice.loop_frame_delay = 1; // every loop_frame_delay'th frame will "step" the slice
// fish_settings.slice.loop_set_to_view = true; // if true, slice is aligned to the camera

// loop controlling variables. DO NOT MODIFY THESE VARIABLES MANUALLY
var slice_loop_control = {direction : 1, frame_index: 0, slice_index:0, vol_name : "", max_index: null }


// initializes slice mode / switch between slicing orientations
function init_slice_mode(vol_name, axis = null, show_bbox = false) {
  if (!vol_dict.hasOwnProperty(vol_name)) return;

  if (!vol_dict[vol_name].is_loaded) {
    load_volume(vol_name);
  }

  if (!axis) axis = fish_settings.slice.default_axis;
  current_slice_axis = axis;

  vol_dict[vol_name].volume.visible = false;
  vol_dict[vol_name].volume.visible = true;
  for (let i = 0; i < vol_dict[vol_name].volume.range.length; i++) {
    if (i != axis_dict[axis]) {
      vol_dict[vol_name].volume.children[i].visible = false;
    }
  }

  slice_loop_control.direction = 1;
  slice_loop_control.frame_index = 0;
  slice_loop_control.slice_index = 0;
  slice_loop_control.max_index = get_max_slice(vol_name, axis);
  slice_loop_control.vol_name = vol_name;

  set_animation(false,true);
  
  show_volume_slice(vol_name, axis);
  if(fish_settings.slice.loop_set_to_view)  set_camera_to_view(axis_view_dict[axis]);
  if (show_bbox) draw_bbox(vol_name);

}


// you should not call this function manually -  shows a given slice
function show_volume_slice(vol_name, axis, index = null) {
  if (!axis_dict.hasOwnProperty(axis)) return;
  if (!index) index = slice_loop_control.slice_index;
  max_index = get_max_slice(vol_name, axis);
  if (index < 0) index = 0;
  if (index >= max_index) index = max_index - 1;
  vol_dict[vol_name].volume["index" + String(axis).toUpperCase()] = index;
  vol_dict[vol_name].volume.visible = false;
  vol_dict[vol_name].volume.visible = true;
  for (let i = 0; i < vol_dict[vol_name].volume.range.length; i++) {
    if (i != axis_dict[axis]) {
      vol_dict[vol_name].volume.children[i].visible = false;
    }
  }
}


function get_max_slice(vol_name, axis) {
  if (!vol_dict.hasOwnProperty(vol_name)) return;

  if (!vol_dict[vol_name].is_loaded) {
    load_volume(vol_name);
  }

  if (!axis_dict.hasOwnProperty(axis)) return;

  return vol_dict[vol_name].volume.range[axis_dict[axis]];

}

// slice "forward" backward
function next_slice() {
  new_slice_index = slice_loop_control.slice_index + slice_loop_control.direction * fish_settings.slice.loop_step_size;
  show_volume_slice(slice_loop_control.vol_name, current_slice_axis, new_slice_index);
  slice_loop_control.slice_index = new_slice_index;
  if (new_slice_index < 0 | new_slice_index > slice_loop_control.max_index) slice_loop_control.direction = slice_loop_control.direction * (-1);
  if(new_slice_index<0) new_slice_index =0;
  if(new_slice_index>slice_loop_control.max_index) new_slice_index = slice_loop_control.max_index;
  return new_slice_index;
}

// slice "step" backward
function previous_slice() {
  new_slice_index = loop_slice_index - loop_direction * fish_settings.slice.loop_step_size;
  show_volume_slice(slice_loop_control.vol_name, current_slice_axis, new_slice_index);
  slice_loop_control.slice_index = new_slice_index;
  if (new_slice_index < 0 | new_slice_index > slice_loop_control.max_index) slice_loop_control.direction = slice_loop_control.direction * (-1);
  if(new_slice_index<0) new_slice_index =0;
  if(new_slice_index>slice_loop_control.max_index) new_slice_index = slice_loop_control.max_index;
  return new_slice_index;
}


// loop-like structure to... loop between slices automatically
function loop_slices() {
  slice_loop_control.frame_index += 1;
  if (slice_loop_control.frame_index > fish_settings.slice.loop_frame_delay) {
    new_slice_index = next_slice();
    
    slice_loop_control.frame_index = 0;
  }
}

// you should use this for testing purposes only
function draw_bbox(vol_name) {
  if (!vol_dict.hasOwnProperty(vol_name)) return;

  if (!vol_dict[vol_name].is_loaded) {
    load_volume(vol_name);
  }

  if (bbox) {
    try {
      renderer.remove(bbox);
    }
    catch (e) { console.log(e); }
  }

  volume = vol_dict[vol_name].volume;

  var res = [volume.bbox[0], volume.bbox[2], volume.bbox[4]];
  var res2 = [volume.bbox[1], volume.bbox[3], volume.bbox[5]];

  bbox = new X.object();
  bbox.points = new X.triplets(72);
  bbox.normals = new X.triplets(72);
  bbox.type = 'LINES';
  bbox.points.add(res2[0], res[1], res2[2]);
  bbox.points.add(res[0], res[1], res2[2]);
  bbox.points.add(res2[0], res2[1], res2[2]);
  bbox.points.add(res[0], res2[1], res2[2]);
  bbox.points.add(res2[0], res[1], res[2]);
  bbox.points.add(res[0], res[1], res[2]);
  bbox.points.add(res2[0], res2[1], res[2]);
  bbox.points.add(res[0], res2[1], res[2]);
  bbox.points.add(res2[0], res[1], res2[2]);
  bbox.points.add(res2[0], res[1], res[2]);
  bbox.points.add(res[0], res[1], res2[2]);
  bbox.points.add(res[0], res[1], res[2]);
  bbox.points.add(res2[0], res2[1], res2[2]);
  bbox.points.add(res2[0], res2[1], res[2]);
  bbox.points.add(res[0], res2[1], res2[2]);
  bbox.points.add(res[0], res2[1], res[2]);
  bbox.points.add(res2[0], res2[1], res2[2]);
  bbox.points.add(res2[0], res[1], res2[2]);
  bbox.points.add(res[0], res2[1], res2[2]);
  bbox.points.add(res[0], res[1], res2[2]);
  bbox.points.add(res[0], res2[1], res[2]);
  bbox.points.add(res[0], res[1], res[2]);
  bbox.points.add(res2[0], res2[1], res[2]);
  bbox.points.add(res2[0], res[1], res[2]);
  for (var i = 0; i < 24; ++i) {
    bbox.normals.add(0, 0, 0);
  }
  renderer.add(bbox);
  bbox.visible = true;
}

function hide_bbox() {
  if (bbox) {
    try {
      renderer.remove(bbox);
      bbox = null;
    }
    catch (e) { console.log(e); }
  }
}


