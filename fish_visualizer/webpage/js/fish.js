var renderer;

var gui;
var volumegui;
var current_volume_name = "";

var vol_dict = {}

var mesh_dict = {};


dat.GUI.prototype.removeFolder = function (name) {
  var folder = this.__folders[name];
  if (!folder) {
    return;
  }
  folder.close();
  this.__ul.removeChild(folder.domElement.parentNode);
  delete this.__folders[name];
  this.onResize();
}


function load_volume(volume_name) {
  if (!vol_dict.hasOwnProperty(volume_name)) return;

  if (vol_dict.hasOwnProperty(current_volume_name)) {
    if (vol_dict[current_volume_name].is_loaded) {
      vol_dict[current_volume_name].volume.visible = false;
      vol_dict[current_volume_name].volume.volumeRendering = false;
    }
  }
  if (!vol_dict[volume_name].is_loaded) {
    vol_dict[volume_name].volume = new X.volume();
    vol_dict[volume_name].volume.file = vol_dict[volume_name].path;
    vol_dict[volume_name].volume.volumeRendering = true;
    vol_dict[volume_name].volume.opacity = 0.05;
    vol_dict[volume_name].volume.visible = true;

    vol_dict[volume_name].is_loaded = true;


    renderer.add(vol_dict[volume_name].volume);
    renderer.onShowtime = function () {
      update_gui(volume_name, current_volume_name);
      current_volume_name = volume_name;
    };
  }
  else {
    vol_dict[volume_name].volume.visible = true;
    vol_dict[volume_name].volume.volumeRendering = true;
    update_gui(volume_name, current_volume_name);
    current_volume_name = volume_name;
  }
}

function add_volume_gui(vol_name) {
  window_low = (vol_dict[vol_name].hasOwnProperty("window_low")) ? vol_dict[vol_name].window_low : vol_dict[vol_name].volume.min;
  window_high = (vol_dict[vol_name].hasOwnProperty("window_high")) ? vol_dict[vol_name].window_high : vol_dict[vol_name].volume.max;

  lowerThreshold = (vol_dict[vol_name].hasOwnProperty("low_thr")) ? vol_dict[vol_name].low_thr : vol_dict[vol_name].volume.min;
  upperThreshold = (vol_dict[vol_name].hasOwnProperty("high_thr")) ? vol_dict[vol_name].high_thr : vol_dict[vol_name].volume.max;

  volumegui = gui.addFolder(vol_name + ' volume');
  var vrController = volumegui.add(vol_dict[vol_name].volume, 'volumeRendering');

  var minColorController = volumegui.addColor(vol_dict[vol_name].volume, 'minColor');
  var maxColorController = volumegui.addColor(vol_dict[vol_name].volume, 'maxColor');

  var opacityController = volumegui.add(vol_dict[vol_name].volume, 'opacity', 0.01, 0.1).listen();

  vol_dict[vol_name].volume.lowerThreshold = lowerThreshold;
  vol_dict[vol_name].volume.upperThreshold = upperThreshold;

  var lowerThresholdController = volumegui.add(vol_dict[vol_name].volume, 'lowerThreshold',
    vol_dict[vol_name].volume.min, vol_dict[vol_name].volume.max);

  var upperThresholdController = volumegui.add(vol_dict[vol_name].volume, 'upperThreshold',
    vol_dict[vol_name].volume.min, vol_dict[vol_name].volume.max);

  vol_dict[vol_name].volume.windowLow = window_low;
  vol_dict[vol_name].volume.windowHigh = window_high;

  var lowerWindowController = volumegui.add(vol_dict[vol_name].volume, 'windowLow', vol_dict[vol_name].volume.min,
  vol_dict[vol_name].volume.max);
    var upperWindowController = volumegui.add(vol_dict[vol_name].volume, 'windowHigh', vol_dict[vol_name].volume.min,
    vol_dict[vol_name].volume.max);


  var sliceXController = volumegui.add(vol_dict[vol_name].volume, 'indexX', 0,
    vol_dict[vol_name].volume.range[0] - 1);
  var sliceYController = volumegui.add(vol_dict[vol_name].volume, 'indexY', 0,
    vol_dict[vol_name].volume.range[1] - 1);
  var sliceZController = volumegui.add(vol_dict[vol_name].volume, 'indexZ', 0,
    vol_dict[vol_name].volume.range[2] - 1);

  volumegui.open();

}

function add_meshes_to_scene() {
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

function add_mesh_gui(mesh_name) {
  if (!mesh_dict.hasOwnProperty(mesh_name)) return;
  gui.removeFolder(mesh_name + ' mesh');

  mesh_dict[mesh_name].gui = gui.addFolder(mesh_name + ' mesh');
  var meshVisibleController = mesh_dict[mesh_name].gui.add(mesh_dict[mesh_name].mesh, 'visible');

  mesh_dict[mesh_name].gui.open();

  // callbacks
  meshVisibleController.onChange(function (value) {

    if (!mesh_dict[mesh_name].is_loaded) {
      renderer.add(mesh_dict[mesh_name].mesh);
      renderer.onShowtime = function () {

      };
      mesh_dict[mesh_name].is_loaded = true;
    }
  });
}

function update_gui(target_vol_name, old_vol_name) {
  if (!vol_dict.hasOwnProperty(target_vol_name)) return;

  gui.removeFolder(old_vol_name + ' volume');

  add_volume_gui(target_vol_name);

  for (var mesh_name in mesh_dict) {
    add_mesh_gui(mesh_name);
  }

}


window.onload = function () {

  // create and initialize a 3D renderer
  renderer = new X.renderer3D();
  renderer.init();

  ct_params = { path: '../img/ct.nii.gz', volume: null, is_loaded: false, low_thr: -600, window_low: -300, window_high: 600 };
  t1_params = { path: '../img/mr-t1_n4corr.nii.gz', volume: null, is_loaded: false, low_thr: 10, window_low: 10, window_high: 1000 };
  t2_params = { path: '../img/mrl-t2.nii.gz', volume: null, is_loaded: false, low_thr: 10, window_low: 10, window_high: 1000 };
  vol_dict = { "CT": ct_params, "T1": t1_params, "T2": t2_params };

  surface_params = { path: '../img/surface.stl', mesh: null, color: [.5, .5, .5], is_loaded: false, gui: null };
  bone_params = { path: '../img/bones.stl', mesh: null, color: [1, .95, .75], is_loaded: false, gui: null };
  bladder_params = { path: '../img/bladder.stl', mesh: null, color: [0, .1, .9], is_loaded: false, gui: null };
  mesh_dict = { "Surface": surface_params, "Bone": bone_params, "Swim Bladder": bladder_params };

  renderer.onShowtime = function () {

    gui = new dat.GUI();

    load_volume("CT");
    add_meshes_to_scene();

  };

  renderer.camera.focus = [0, 0, 0];
  renderer.camera.o = new Float32Array([-0.11675607413053513, -0.04434124007821083, -0.9921701550483704, 0, -0.02909557707607746, -0.9984213709831238, 0.048044800758361816, 0, -0.9927340149879456, 0.03447747603058815, 0.11528141051530838, 0, 0, 0, -340, 1]);

  renderer.render();
};
