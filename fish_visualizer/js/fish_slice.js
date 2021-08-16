bbox = null;
axis_dict = { x: 0, y: 1, z: 2 };
default_slice_axis = "z";
current_slice_axis = null;

// parameters
var loop_step_size = 2;
var loop_frame_delay = 1;

// loop controlling variables. no not modify these values manually
var loop_direction = 1;
var loop_frame_index = 0;
var loop_slice_index = 0;
var loop_vol_name = "";

var loop_max_index = null;


function init_slice_mode(vol_name, axis = null, show_bbox = false) {
  if (!vol_dict.hasOwnProperty(vol_name)) return;

  if (!vol_dict[vol_name].is_loaded) {
    load_volume(vol_name);
  }

  if (!axis) axis = default_slice_axis;
  current_slice_axis = axis;

  vol_dict[vol_name].volume.visible = false;
  vol_dict[vol_name].volume.visible = true;
  for (let i = 0; i < vol_dict[vol_name].volume.range.length; i++) {
    if (i != axis_dict[axis]) {
      vol_dict[vol_name].volume.children[i].visible = false;
    }
  }

  loop_direction = 1;
  loop_frame_index = 0;
  loop_slice_index = 0;
  loop_max_index = get_max_slice(vol_name, axis);
  loop_vol_name = vol_name;

  show_volume_slice(vol_name, axis, loop_slice_index);

  if (show_bbox) draw_bbox(vol_name);

}

function show_volume_slice(vol_name, axis, index) {
  if (!axis_dict.hasOwnProperty(axis)) return;
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

function next_slice() {
  new_slice_index = loop_slice_index + loop_direction * loop_step_size;
  show_volume_slice(loop_vol_name, current_slice_axis, new_slice_index);
  loop_slice_index = new_slice_index;
  if (new_slice_index < 0 | new_slice_index > loop_max_index) loop_direction = loop_direction * (-1);
  if(new_slice_index<0) new_slice_index =0;
  if(new_slice_index>loop_max_index) new_slice_index = loop_max_index;
  return new_slice_index;
}

function previous_slice() {
  new_slice_index = loop_slice_index - loop_direction * loop_step_size;
  show_volume_slice(loop_vol_name, current_slice_axis, new_slice_index);
  loop_slice_index = new_slice_index;
  if (new_slice_index < 0 | new_slice_index > loop_max_index) loop_direction = loop_direction * (-1);
  if(new_slice_index<0) new_slice_index =0;
  if(new_slice_index>loop_max_index) new_slice_index = loop_max_index;
  return new_slice_index;
}

function loop_slices() {
  loop_frame_index += 1;
  if (loop_frame_index > loop_frame_delay) {
    new_slice_index = next_slice();
    
    loop_frame_index = 0;
  }
}

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


