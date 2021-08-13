var renderer;

var current_vol_name = "";

var vol_dict = {};
var mesh_dict = {};

var camera_rotate_step = 5;
var camera_distance = 400;

var preset_dict = {};


var use_expert_gui = false;
var expert_gui;


function disable_input(){
  if(!renderer) return;
  // to disable the mouse wheel interaction
  renderer.interactor.config.MOUSEWHEEL_ENABLED = false;
  // to disable mouse clicks
  renderer.interactor.config.MOUSECLICKS_ENABLED = false;
  // init the interactor again
  renderer.interactor.init();
}


function load_settings(vol_json_path, mesh_json_path){
  test_settings(); 
}


function test_settings(){
  ct_bone_level = {low_thr:150, high_thr:3000, window_low:150, window_high:800, opacity:0.08};
  ct_interior_level = {low_thr:-750, high_thr:-150, window_low:-600, window_high:800, opacity:0.08};
  ct_muscle_level = {low_thr:-400, high_thr:70, window_low:0, window_high:800, opacity:0.08};
  ct_gut_level = {low_thr:-50, high_thr:90, window_low:70, window_high:200, opacity:0.08};
  ct_levels = {"bone":ct_bone_level,"interior":ct_interior_level, "muscle":ct_muscle_level, "gut":ct_gut_level};
  ct_params = { path: '../img/ct.nii.gz', volume: null, is_loaded: false, default_level: "bone", current_level:"", levels: ct_levels};
  
  t1_interior_level = {low_thr:300, high_thr:1000, window_low:500, window_high:1300, opacity:0.08};
  t1_gut_level = {low_thr:600, high_thr:800, window_low:500, window_high:800, opacity:0.08};
  t1_levels = {"interior":t1_interior_level, "gut":t1_gut_level};
  t1_params = { path: '../img/mr-t1_n4corr.nii.gz', volume: null, is_loaded: false, default_level: "gut", current_level:"", levels: t1_levels};


  t2_gut_level = {low_thr:400, high_thr:600, window_low:450, window_high:1000, opacity:0.08};
  t2_levels = {"gut":t2_gut_level};
  t2_params = { path: '../img/mrl-t2.nii.gz', volume: null, is_loaded: false, default_level: "gut", current_level:"", levels: t2_levels};

  vol_dict = { "CT": ct_params, "T1": t1_params,"T2": t2_params};

  surface_params = { path: '../img/surface.stl', mesh: null, color: [.5, .5, .5], is_loaded: false, hide_others : true};
  bone_params = { path: '../img/bones.stl', mesh: null, color: [1, .95, .85], is_loaded: false, hide_others : false};
  bladder_params = { path: '../img/bladder.stl', mesh: null, color: [0, .1, .9], is_loaded: false, hide_others : false};
  mesh_dict = { "Surface": surface_params, "Bone": bone_params, "Swim Bladder": bladder_params };
}

function set_camera(distance){
  renderer.camera.focus = [0, 0, 0];
  renderer.camera.o = new Float32Array([0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 0, 0, - distance, 1]);
  camera_distance = distance;
}

function load_volume(vol_name) {
  if (!vol_dict.hasOwnProperty(vol_name)) return;

  if (!vol_dict[vol_name].is_loaded) {
    vol_dict[vol_name].volume = new X.volume();
    vol_dict[vol_name].volume.file = vol_dict[vol_name].path;
    vol_dict[vol_name].is_loaded = true;

    renderer.add(vol_dict[vol_name].volume);
  }
}

function show_volume(vol_name, level = null){
  if (!vol_dict.hasOwnProperty(vol_name)) return;

  if (vol_dict.hasOwnProperty(current_vol_name)) {
    if (vol_dict[current_vol_name].is_loaded) {
      vol_dict[current_vol_name].volume.visible = false;
      vol_dict[current_vol_name].volume.volumeRendering = false;
    }
  }
  if (!vol_dict[vol_name].is_loaded) {
    load_volume(vol_name);
    set_default_volume_color(vol_name);
    set_volume_level(vol_name,level);
    vol_dict[vol_name].volume.volumeRendering = true;
    vol_dict[vol_name].volume.visible = true;

    renderer.onShowtime = function () {
      if(use_expert_gui) update_expert_gui(vol_name, current_vol_name);
      current_vol_name = vol_name;
    };

  }
  else {
    set_volume_level(vol_name,level);
    vol_dict[vol_name].volume.visible = true;
    vol_dict[vol_name].volume.volumeRendering = true;
    if(use_expert_gui) update_expert_gui(vol_name, current_vol_name);
    current_vol_name = vol_name;
  }
}


function set_default_volume_color(vol_name){
  if (!vol_dict.hasOwnProperty(vol_name)) return;

  if (!vol_dict[vol_name].is_loaded) {
    load_volume(vol_name);
  }
  vol_dict[vol_name].volume.maxColor = [0,255,255]
  vol_dict[vol_name].volume.minColor = [0,0,0]
}


function set_volume_level(vol_name, level = null){
  if (!vol_dict.hasOwnProperty(vol_name)) return;

  if (!vol_dict[vol_name].is_loaded) {
    load_volume(vol_name);
  }
  
  if (! level) level = vol_dict[vol_name].default_level;
  
  if (!vol_dict[vol_name].levels.hasOwnProperty(level)) return;

  level_info = vol_dict[vol_name].levels[level];

  if(level_info.hasOwnProperty("opacity")) vol_dict[vol_name].volume.opacity = level_info.opacity;
  if(level_info.hasOwnProperty("low_thr")) vol_dict[vol_name].volume.lowerThreshold = level_info.low_thr;
  if(level_info.hasOwnProperty("high_thr")) vol_dict[vol_name].volume.upperThreshold = level_info.high_thr;
  if(level_info.hasOwnProperty("window_low")) vol_dict[vol_name].volume.windowLow = level_info.window_low;
  if(level_info.hasOwnProperty("window_high")) vol_dict[vol_name].volume.windowHigh = level_info.window_high;
  vol_dict[vol_name].current_level = level;

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


function set_mesh_visibility(mesh_name, visibility)
{
  if (!mesh_dict.hasOwnProperty(mesh_name)) return;
  if (!mesh_dict[mesh_name].is_loaded) {
    renderer.add(mesh_dict[mesh_name].mesh);    
    renderer.onShowtime = function () {

    };
    mesh_dict[mesh_name].is_loaded = true;
  }
  
  // this block is relevant only if the visibility is set to ture 
  if (visibility){
    // hide meshes with 'hide_others' flag to make the new mesh visible
    if (!mesh_dict[mesh_name].hide_others){
      Object.values(mesh_dict).forEach(_mesh => {
        if(_mesh.is_loaded & _mesh.hide_others & _mesh.mesh.visible ) 
        {
          _mesh.mesh.visible = false;
        }
      })
    }
    // new mesh with 'hide_others' flag hides other meshes...
    else
    {
      Object.values(mesh_dict).forEach(_mesh => {
        if(_mesh.is_loaded) {
          _mesh.mesh.visible = false;
        }
      })
    }
  }

  mesh_dict[mesh_name].mesh.visible = visibility;
  
  // TODO update gui with mesh_dict items visibility....

}


window.onload = function () {

  // create and initialize a 3D renderer
  renderer = new X.renderer3D();
  renderer.init();
  disable_input();
  set_camera(camera_distance);

  load_settings(null,null);

  renderer.onShowtime = function () {
    if(use_expert_gui) expert_gui = new dat.GUI();
    show_volume("CT");
    init_meshes();
  };
  
  renderer.onRender= function(){
    renderer.camera.rotate([camera_rotate_step,0]);
  };
  renderer.render();
};
