var renderer_3d;
var renderer_sliceX;
var renderer_sliceY;
var renderer_sliceZ;

var gui;
var volumegui;
var labelmapgui;
var current_volume_name = "";
var new_volume_name = "";

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
      
      // renderer_3d.remove(vol_dict[current_volume_name].volume);
      // renderer_sliceX.remove(vol_dict[current_volume_name].volume);
      // renderer_sliceY.remove(vol_dict[current_volume_name].volume);
      // renderer_sliceZ.remove(vol_dict[current_volume_name].volume);
    }
  }
  new_volume_name = volume_name;
  if (!vol_dict[volume_name].is_loaded) {
    vol_dict[volume_name].volume = new X.volume();
    vol_dict[volume_name].volume.file = vol_dict[volume_name].path;
    vol_dict[volume_name].volume.volumeRendering = false;
    vol_dict[volume_name].volume.opacity = 1;
    vol_dict[volume_name].volume.visible = true;
    vol_dict[volume_name].volume.minColor = [0,0,0];
    // vol_dict[volume_name].volume.maxColor = [255,255,255];
    vol_dict[volume_name].volume.maxColor = [.9,.9,.9];
    if (vol_dict[volume_name].labelmap_file != null){
      vol_dict[volume_name].volume.labelmap.file = vol_dict[volume_name].labelmap_file;
      vol_dict[volume_name].volume.colortable.file = vol_dict[volume_name].colortable_file;
    }

    vol_dict[volume_name].is_loaded = true;

    renderer_3d.add(vol_dict[volume_name].volume);
    renderer_3d.render();


  }
  else {
    renderer_3d.add(vol_dict[volume_name].volume);
    renderer_3d.render();
    renderer_sliceX.add(vol_dict[new_volume_name].volume);
    renderer_sliceX.render();
    renderer_sliceY.add(vol_dict[new_volume_name].volume);
    renderer_sliceY.render();
    renderer_sliceZ.add(vol_dict[new_volume_name].volume);
    renderer_sliceZ.render();

    vol_dict[volume_name].volume.visible = true;
    update_gui();
  }
  
}


function add_volume_gui(vol_name) {
  window_low = (vol_dict[vol_name].hasOwnProperty("window_low")) ? vol_dict[vol_name].window_low : vol_dict[vol_name].volume.min;
  window_high = (vol_dict[vol_name].hasOwnProperty("window_high")) ? vol_dict[vol_name].window_high : vol_dict[vol_name].volume.max;

  lowerThreshold = (vol_dict[vol_name].hasOwnProperty("low_thr")) ? vol_dict[vol_name].low_thr : vol_dict[vol_name].volume.min;
  upperThreshold = (vol_dict[vol_name].hasOwnProperty("high_thr")) ? vol_dict[vol_name].high_thr : vol_dict[vol_name].volume.max;

  volumegui = gui.addFolder(vol_name + ' volume control');
  var vController = volumegui.add(vol_dict[vol_name].volume, 'visible');
  // var vrController = volumegui.add(vol_dict[vol_name].volume, 'volumeRendering');

  // var minColorController = volumegui.addColor(vol_dict[vol_name].volume, 'minColor');
  // var maxColorController = volumegui.addColor(vol_dict[vol_name].volume, 'maxColor');

  // var opacityController = volumegui.add(vol_dict[vol_name].volume, 'opacity', 0.01, 0.1).listen();

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

  var renderer_sliceXController = volumegui.add(vol_dict[vol_name].volume, 'indexX', 0,
    vol_dict[vol_name].volume.range[0] - 1);
  var sliceYController = volumegui.add(vol_dict[vol_name].volume, 'indexY', 0,
    vol_dict[vol_name].volume.range[1] - 1);
  var sliceZController = volumegui.add(vol_dict[vol_name].volume, 'indexZ', 0,
    vol_dict[vol_name].volume.range[2] - 1);


  volumegui.open();

  labelmapgui = gui.addFolder(vol_name + ' label control');
  var labelMapVisibleController = labelmapgui.add(vol_dict[vol_name].volume.labelmap, 'visible');
  var labelMapOpacityController = labelmapgui.add(vol_dict[vol_name].volume.labelmap, 'opacity',
        0, 1);
  labelmapgui.open();


}

function add_meshes_to_scene() {
  for (var mesh_name in mesh_dict) {
    if (mesh_dict.hasOwnProperty(mesh_name)) {
      mesh_dict[mesh_name].mesh = new X.mesh();
      mesh_dict[mesh_name].mesh.file = mesh_dict[mesh_name].path;
      mesh_dict[mesh_name].mesh.color = mesh_dict[mesh_name].color.map(x=>x/256);
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
  //var meshOpacityController = mesh_dict[mesh_name].gui.add(mesh_dict[mesh_name].mesh, 'opacity',0,1);

  mesh_dict[mesh_name].gui.open();

  // callbacks
  meshVisibleController.onChange(function (value) {

    if (!mesh_dict[mesh_name].is_loaded) {
      renderer_3d.add(mesh_dict[mesh_name].mesh);
      renderer_3d.onShowtime = function () {

      };
      mesh_dict[mesh_name].is_loaded = true;
    }
  });
}

function update_gui() {
  if (!vol_dict.hasOwnProperty(new_volume_name)) return;

  gui.removeFolder(current_volume_name + ' volume');
  add_volume_gui(new_volume_name);
  for (var mesh_name in mesh_dict) {
    add_mesh_gui(mesh_name);
  }
  current_volume_name = new_volume_name;
}

function init_renderers(){
    //
  // try to create the 3D renderer
  //
  _webGLFriendly = true;
  try {
    // try to create and initialize a 3D renderer
    renderer_3d = new X.renderer3D();
    renderer_3d.container = '3d';
    renderer_3d.init();
  } catch (Exception) {
    // no webgl on this machine
    _webGLFriendly = false;
  }
  
  //
  // create the 2D renderers
  // .. for the X orientation
  renderer_sliceX = new X.renderer2D();
  renderer_sliceX.container = 'sliceX';
  renderer_sliceX.orientation = 'X';
  renderer_sliceX.init();
  // .. for Y
  renderer_sliceY = new X.renderer2D();
  renderer_sliceY.container = 'sliceY';
  renderer_sliceY.orientation = 'Y';
  renderer_sliceY.init();
  // .. and for Z
  renderer_sliceZ = new X.renderer2D();
  renderer_sliceZ.container = 'sliceZ';
  renderer_sliceZ.orientation = 'Z';
  renderer_sliceZ.init();
}

window.onload = function() {
  init_renderers();  
  //
  // THE VOLUME DATA
  //
  ct_params = { path: '../xtk_data/C-i-A-cropped_ct.nii.gz', volume: null, is_loaded: false, low_thr: -1000, window_low: -1024, window_high: 3000 };
  labeled_params = { path: '../xtk_data/C-i-A-cropped_ct.nii.gz', volume: null, is_loaded: false, low_thr: -1000, window_low: -1024, window_high: 3000 ,
                     labelmap_file: '../xtk_data/C-i-A-label.nii.gz', colortable_file : '../xtk_data/segmentation_ctbl.txt'};
  
  vol_dict = { "CT": ct_params, "Labeled CT":labeled_params};
  
  skeleton = { path: '../xtk_data/skeleton.stl', mesh: null, color: [241, 214, 145], is_loaded: false, gui: null };
  caudalthoracal = { path: '../xtk_data/caudalthoracal.stl', mesh: null, color: [177, 122, 101], is_loaded: false, gui: null };
  cranialthoracal = { path: '../xtk_data/cranialthoracal.stl', mesh: null, color: [111,184,210], is_loaded: false, gui: null };
  femoral = { path: '../xtk_data/femoral.stl', mesh: null, color: [216,101,79], is_loaded: false, gui: null };
  clavicular = { path: '../xtk_data/clavicular.stl', mesh: null, color: [221,130,101], is_loaded: false, gui: null };
  axillar = { path: '../xtk_data/axillar.stl', mesh: null, color: [183,156,220], is_loaded: false, gui: null };
  pulmonary = { path: '../xtk_data/pulmonary.stl', mesh: null, color: [220,245,20], is_loaded: false, gui: null };
  cervical = { path: '../xtk_data/cervical.stl', mesh: null, color: [120,244,134], is_loaded: false, gui: null };
  abdominal = { path: '../xtk_data/abdominal.stl', mesh: null, color: [128,174,128], is_loaded: false, gui: null };
  humeral = { path: '../xtk_data/humeral.stl', mesh: null, color: [0,151,206], is_loaded: false, gui: null };
  trachea = { path: '../xtk_data/trachea.stl', mesh: null, color: [244,214,49], is_loaded: false, gui: null };


  mesh_dict = {"skeleton": skeleton, "caudalthoracal":caudalthoracal, "cranialthoracal":cranialthoracal,"femoral": femoral,"clavicular":clavicular,"axillar":axillar,"pulmonary":pulmonary,
                "cervical":cervical,"abdominal":abdominal,"humeral":humeral,"trachea":trachea};


  gui = new dat.GUI();
  add_meshes_to_scene();
  load_volume("Labeled CT");
  // load_volume("CT");

  renderer_3d.onShowtime = function() {

    renderer_3d.camera.o[14] = -800;

    renderer_sliceX.add(vol_dict[new_volume_name].volume);
    renderer_sliceX.render();
    renderer_sliceX.camera.o[14] = 0.4;

    renderer_sliceY.add(vol_dict[new_volume_name].volume);
    renderer_sliceY.render();
    renderer_sliceY.camera.o[14] = 0.9;

    renderer_sliceZ.add(vol_dict[new_volume_name].volume);
    renderer_sliceZ.render();
    renderer_sliceZ.camera.o[14] = 0.9;

    update_gui();
  }

};
