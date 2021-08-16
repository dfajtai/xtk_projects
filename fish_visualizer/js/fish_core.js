var renderer;

var current_vol_name = null;

var vol_dict = {};
var mesh_dict = {};

var preset_dict = {};

var camera_init_position = null;

var dafault_camera_distance = 400;
var default_camera_slice_rotation = 45;
var camera_distance = null;

var use_expert_gui = false;
var expert_gui;

var rendering_modes = { volume: "volume", slice: "slice" };
var default_rendering_mode = rendering_modes.volume;
var current_rendering_mode = null;

var default_volume_color = { min: [0, 0, 0], max: [0, 255, 255] };
var default_slice_color = { min: [0, 0, 0], max: [1, 1, 1] };
var default_slice_opacity = 0.8;



function disable_input() {
  if (!renderer) return;
  renderer.interactor.config.MOUSEWHEEL_ENABLED = false;
  renderer.interactor.config.MOUSECLICKS_ENABLED = false;
  renderer.interactor.config.KEYBOARD_ENABLED = false;
  renderer.interactor.config.HOVERING_ENABLED = false;
  renderer.interactor.config.TOUCH_ENABLED = false;

  renderer.interactor.init();
}

function load_settings(vol_json_path, mesh_json_path) {
  test_settings();
}

function test_settings() {
  ct_bone_level = { low_thr: 150, high_thr: 3000, window_low: 150, window_high: 800, opacity: 0.08 };
  ct_interior_level = { low_thr: -750, high_thr: -150, window_low: -600, window_high: 800, opacity: 0.08 };
  ct_muscle_level = { low_thr: -400, high_thr: 70, window_low: 0, window_high: 800, opacity: 0.08 };
  ct_gut_level = { low_thr: -50, high_thr: 90, window_low: 70, window_high: 200, opacity: 0.08 };
  ct_levels = { "bone": ct_bone_level, "interior": ct_interior_level, "muscle": ct_muscle_level, "gut": ct_gut_level };
  ct_params = {
    path: '../img/ct.nii.gz', volume: null, is_loaded: false, default_level: "bone", current_level: "", levels: ct_levels, min_val: -900, max_val: 1500,
    volume_min_color: null, volume_max_color: null, slice_min_color: null, slice_max_color: null
  };

  t1_interior_level = { low_thr: 300, high_thr: 1000, window_low: 500, window_high: 1300, opacity: 0.08 };
  t1_gut_level = { low_thr: 600, high_thr: 800, window_low: 500, window_high: 800, opacity: 0.08 };
  t1_levels = { "interior": t1_interior_level, "gut": t1_gut_level };
  t1_params = {
    path: '../img/mr-t1_n4corr.nii.gz', volume: null, is_loaded: false, default_level: "gut", current_level: "", levels: t1_levels, min_val: 10, max_val: 1000,
    volume_min_color: null, volume_max_color: null, slice_min_color: null, slice_max_color: null
  };


  t2_gut_level = { low_thr: 400, high_thr: 600, window_low: 450, window_high: 1000, opacity: 0.08 };
  t2_levels = { "gut": t2_gut_level };
  t2_params = {
    path: '../img/mrl-t2.nii.gz', volume: null, is_loaded: false, default_level: "gut", current_level: "", levels: t2_levels, min_val: 10, max_val: 1000,
    volume_min_color: null, volume_max_color: null, slice_min_color: null, slice_max_color: null
  };

  vol_dict = { "CT": ct_params, "T1": t1_params, "T2": t2_params };

  surface_params = { path: '../img/surface.stl', mesh: null, color: [.5, .5, .5], is_loaded: false, hide_others: true };
  bone_params = { path: '../img/bones.stl', mesh: null, color: [1, .95, .85], is_loaded: false, hide_others: false };
  bladder_params = { path: '../img/bladder.stl', mesh: null, color: [0, .1, .9], is_loaded: false, hide_others: false };
  mesh_dict = { "Surface": surface_params, "Bone": bone_params, "Swim Bladder": bladder_params };
}


function init_camera_position(distance) {
  renderer.camera.focus = [0, 0, 0];
  if (!camera_init_position) {
    position = new Float32Array([0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 0, 0, - distance, 1]);
    renderer.camera.o = [...position];
    camera_init_position = [...position];
    camera_distance = distance;
  }
  else {
    renderer.camera.o = [...camera_init_position];
  }
}

function set_camera_distance(distance = null) {
  renderer.camera.focus = [0, 0, 0];
  position = new Float32Array([0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 0, 0, - distance, 1]);
  renderer.camera.o = [...position];
  camera_distance = distance;
}


function load_volume(vol_name) {
  if (!vol_dict.hasOwnProperty(vol_name)) return;

  if (!vol_dict[vol_name].is_loaded) {
    vol_dict[vol_name].volume = new X.volume();
    vol_dict[vol_name].volume.file = vol_dict[vol_name].path;
    vol_dict[vol_name].is_loaded = true;

    renderer.add(vol_dict[vol_name].volume);
    init_volume_colors(vol_name);
  }
}

function init_volume_colors(vol_name) {
  if (!vol_dict.hasOwnProperty(vol_name)) return;
  if (!vol_dict[vol_name].volume_min_color) vol_dict[vol_name].volume_min_color = default_volume_color.min;
  if (!vol_dict[vol_name].volume_max_color) vol_dict[vol_name].volume_max_color = default_volume_color.max;
  if (!vol_dict[vol_name].slice_min_color) vol_dict[vol_name].slice_min_color = default_slice_color.min;
  if (!vol_dict[vol_name].slice_max_color) vol_dict[vol_name].slice_max_color = default_slice_color.max;
}

function resolve_rendering_mode(rendering_mode) {
  if (!rendering_mode) rendering_mode = current_rendering_mode;
  if (!rendering_modes.hasOwnProperty(rendering_mode)) rendering_mode = default_rendering_mode;
  current_rendering_mode = rendering_mode;
  return current_rendering_mode;
}

function show_volume(vol_name, level = null, rendering_mode = null) {
  if (!vol_dict.hasOwnProperty(vol_name)) return;

  if (vol_dict.hasOwnProperty(current_vol_name)) {
    if (vol_dict[current_vol_name].is_loaded) {
      vol_dict[current_vol_name].volume.visible = false;
      vol_dict[current_vol_name].volume.volumeRendering = false;
      try {
        renderer.remove(vol_dict[current_vol_name].volume);
      }
      catch (e) { console.log(e); }
    }
  }

  rendering_mode = resolve_rendering_mode(rendering_mode);

  if (!vol_dict[vol_name].is_loaded) {
    load_volume(vol_name);
    if (set_level(vol_name, level, rendering_mode)) {
      vol_dict[vol_name].volume.visible = true;
      renderer.onShowtime = function () {
        if (use_expert_gui) update_expert_gui(vol_name, current_vol_name);
        set_rendering_mode(vol_name, rendering_mode);
        current_vol_name = vol_name;
      };
    }
    else{
      console.log("Error during volume level selection");
    }
  }
  else {
    if (set_level(vol_name, level, rendering_mode)) {

      vol_dict[vol_name].volume.visible = true;

      if (use_expert_gui) update_expert_gui(vol_name, current_vol_name);
      set_rendering_mode(vol_name, rendering_mode);
      current_vol_name = vol_name;
    }
    else{
      console.log("Error during volume level selection");
    }
  }
}

function set_rendering_mode(vol_name, rendering_mode = null) {
  if (!vol_dict.hasOwnProperty(vol_name)) return;

  if (!vol_dict[vol_name].is_loaded) {
    load_volume(vol_name);
  }

  rendering_mode = resolve_rendering_mode(rendering_mode);

  if (rendering_mode === rendering_modes.volume) {
    try {
      renderer.remove(vol_dict[vol_name].volume)
    }
    catch (e) { console.log(e); }
    stop_slice_loop();

    vol_dict[vol_name].volume.minColor = vol_dict[vol_name].volume_min_color;
    vol_dict[vol_name].volume.maxColor = vol_dict[vol_name].volume_max_color;
    renderer.add(vol_dict[vol_name].volume)
    vol_dict[vol_name].volume.volumeRendering = true;

  }
  else {
    try {
      renderer.remove(vol_dict[vol_name].volume)
    }
    catch (e) { console.log(e); }
    vol_dict[vol_name].volume.minColor = vol_dict[vol_name].slice_min_color;
    vol_dict[vol_name].volume.maxColor = vol_dict[vol_name].slice_max_color;
    renderer.add(vol_dict[vol_name].volume)
    vol_dict[vol_name].volume.volumeRendering = false;
    init_slice_mode(vol_name);
    set_camera_y_rotation(default_camera_slice_rotation)
    start_slice_loop();
  }
}


function set_volume_level(vol_name, level = null) {
  if (!vol_dict.hasOwnProperty(vol_name)) return false;

  if (!vol_dict[vol_name].is_loaded) {
    load_volume(vol_name);
  }

  if (!level) level = vol_dict[vol_name].default_level;

  if (!vol_dict[vol_name].levels.hasOwnProperty(level)) return false;

  level_info = vol_dict[vol_name].levels[level];

  if (level_info.hasOwnProperty("opacity")) vol_dict[vol_name].volume.opacity = level_info.opacity;
  if (level_info.hasOwnProperty("low_thr")) vol_dict[vol_name].volume.lowerThreshold = level_info.low_thr;
  if (level_info.hasOwnProperty("high_thr")) vol_dict[vol_name].volume.upperThreshold = level_info.high_thr;
  if (level_info.hasOwnProperty("window_low")) vol_dict[vol_name].volume.windowLow = level_info.window_low;
  if (level_info.hasOwnProperty("window_high")) vol_dict[vol_name].volume.windowHigh = level_info.window_high;
  vol_dict[vol_name].current_level = level;

  return true;
}

function set_slice_level(vol_name) {
  if (!vol_dict.hasOwnProperty(vol_name)) return false;

  if (!vol_dict[vol_name].is_loaded) {
    load_volume(vol_name);
  }
  vol_dict[vol_name].volume.opacity = default_slice_opacity;
  if (vol_dict[vol_name].hasOwnProperty("min_val")) vol_dict[vol_name].volume.lowerThreshold = vol_dict[vol_name].min_val;
  if (vol_dict[vol_name].hasOwnProperty("max_val")) vol_dict[vol_name].volume.upperThreshold = vol_dict[vol_name].max_val;
  if (vol_dict[vol_name].hasOwnProperty("min_val")) vol_dict[vol_name].volume.windowLow = vol_dict[vol_name].min_val + 1;
  if (vol_dict[vol_name].hasOwnProperty("max_val")) vol_dict[vol_name].volume.windowHigh = vol_dict[vol_name].max_val - 1;
  vol_dict[vol_name].current_level = null;

  return true;

}

function set_level(vol_name, level = null, rendering_mode = null) {
  if (!vol_dict.hasOwnProperty(vol_name)) return;

  if (!vol_dict[vol_name].is_loaded) {
    load_volume(vol_name);
  }

  rendering_mode = resolve_rendering_mode(rendering_mode);
  if (rendering_mode === rendering_modes.volume) {

    return set_volume_level(vol_name, level);
  }
  else {
    return set_slice_level(vol_name);
  }
}


function init_meshes() {
  for (var mesh_name in mesh_dict) {
    if (mesh_dict.hasOwnProperty(mesh_name)) {
      mesh_dict[mesh_name].mesh = new X.mesh();
      mesh_dict[mesh_name].mesh.file = mesh_dict[mesh_name].path;
      mesh_dict[mesh_name].mesh.color = mesh_dict[mesh_name].color;
      mesh_dict[mesh_name].mesh.opacity = 1;
      mesh_dict[mesh_name].mesh.visible = false;
      mesh_dict[mesh_name].is_loaded = false;
    }
  }
}


function set_mesh_visibility(mesh_name, visibility) {
  if (!mesh_dict.hasOwnProperty(mesh_name)) return;
  if (!mesh_dict[mesh_name].is_loaded) {
    renderer.add(mesh_dict[mesh_name].mesh);
    renderer.onShowtime = function () {

    };
    mesh_dict[mesh_name].is_loaded = true;
  }

  // this block is relevant only if the visibility is set to ture 
  if (visibility) {
    // hide meshes with 'hide_others' flag to make the new mesh visible
    if (!mesh_dict[mesh_name].hide_others) {
      Object.values(mesh_dict).forEach(_mesh => {
        if (_mesh.is_loaded & _mesh.hide_others & _mesh.mesh.visible) {
          _mesh.mesh.visible = false;
        }
      })
    }
    // new mesh with 'hide_others' flag hides other meshes...
    else {
      Object.values(mesh_dict).forEach(_mesh => {
        if (_mesh.is_loaded) {
          _mesh.mesh.visible = false;
        }
      })
    }
  }

  mesh_dict[mesh_name].mesh.visible = visibility;

  // TODO update gui with mesh_dict items visibility....

}


window.onload = function () {
  renderer = new X.renderer3D();
  renderer.init();
  disable_input();
  init_camera_position(dafault_camera_distance);

  load_settings(null, null);

  renderer.onShowtime = function () {
    if (use_expert_gui) expert_gui = new dat.GUI();
    show_volume("CT");
    start_camera_rotation();
    init_meshes();
  };

  renderer.onRender = function () {
    fish_animation();
  };

  renderer.render();
};
