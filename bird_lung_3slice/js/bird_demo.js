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
var volume;


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




window.onload = function() {
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



  //
  // DATA DEFINITION
  //
  ct_params = { path: '../xtk_data/C-i-A-cropped_ct.nii.gz', volume: null, is_loaded: false, low_thr: -1000, window_low: -1024, window_high: 3000 };
  labeled_params = { path: '../xtk_data/C-i-A-cropped_ct.nii.gz', volume: null, is_loaded: false, low_thr: -1000, window_low: -1024, window_high: 3000 ,
                     labelmap_file: '../xtk_data/C-i-A-label.nii.gz', colortable_file : '../xtk_data/segmentation_ctbl.txt'};
  
  vol_dict = { "CT": labeled_params};
  
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

  volume = new X.volume();
  volume.file = vol_dict.CT.path;
  volume.labelmap.file = vol_dict.CT.labelmap_file;
  volume.labelmap.colortable.file = vol_dict.CT.colortable_file;

  renderer_3d.add(volume);
  renderer_3d.render();

  renderer_3d.onShowtime = function(){
    renderer_sliceX.add(volume);
    renderer_sliceX.render();
    renderer_sliceY.add(volume);
    renderer_sliceY.render();
    renderer_sliceZ.add(volume);
    renderer_sliceZ.render();

    renderer_3d.camera.o = [0,0,1,0,0,1,0,0,1,0,0,0,0,0,-800,1];
    renderer_sliceX.camera.o[14] = .6;

    gui = new dat.GUI();
    var volumegui = gui.addFolder('Volume');
    // now we can configure controllers which..
    // .. configure the volume rendering opacity
    var volumeVisibility = volumegui.add(volume,"visible").listen();
    // var opacityController = volumegui.add(volume, 'opacity', 0, 1);
    // .. and the threshold in the min..max range
    var lowerThresholdController = volumegui.add(volume, 'lowerThreshold',
        volume.min, volume.max);
    var upperThresholdController = volumegui.add(volume, 'upperThreshold',
        volume.min, volume.max);
    var lowerWindowController = volumegui.add(volume, 'windowLow', volume.min,
        volume.max);
    var upperWindowController = volumegui.add(volume, 'windowHigh', volume.min,
        volume.max);
    // the indexX,Y,Z are the currently displayed slice indices in the range
    // 0..dimensions-1
    var sliceXController = volumegui.add(volume, 'indexX', 0,
        volume.range[0] - 1);
    var sliceYController = volumegui.add(volume, 'indexY', 0,
        volume.range[1] - 1);
    var sliceZController = volumegui.add(volume, 'indexZ', 0,
        volume.range[2] - 1);
    volumegui.open();

    var labelmapgui = gui.addFolder('Label Map');
    var labelMapVisibleController = labelmapgui.add(volume.labelmap, 'visible');
    var labelMapOpacityController = labelmapgui.add(volume.labelmap, 'opacity',
        0, 1);
    labelmapgui.open();
    // volume.lowerThreshold = -1000;

    add_meshes_to_scene();  

    for (var mesh_name in mesh_dict) {
      add_mesh_gui(mesh_name);
    }

  }

  

};
