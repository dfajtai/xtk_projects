var renderer;

var gui;

var volume;
var volumegui;

var bone_mesh;
var bone_mesh_gui;
var bone_load_flag;

var surface_mesh;
var surface_mesh_gui;
var surface_load_flag;

var bladder_mesh;
var bladder_mesh_gui;
var bladder_load_flag;


function add_gui(){
  dat.GUI.prototype.removeFolder = function(name) {
    var folder = this.__folders[name];
    if (!folder) {
      return;
    }
    folder.close();
    this.__ul.removeChild(folder.domElement.parentNode);
    delete this.__folders[name];
    this.onResize();
  }
  gui = new dat.GUI();

}

function add_volume_gui() {
  gui.removeFolder("Volume");

  volumegui = gui.addFolder('Volume');

  var vrController = volumegui.add(volume, 'volumeRendering');


  var minColorController = volumegui.addColor(volume, 'minColor');
  var maxColorController = volumegui.addColor(volume, 'maxColor');


  // var opacityController = volumegui.add(volume, 'opacity', 0, 1).listen();

  var lowerThresholdController = volumegui.add(volume, 'lowerThreshold',
    volume.min, volume.max);
  var upperThresholdController = volumegui.add(volume, 'upperThreshold',
    volume.min, volume.max);

  // var lowerWindowController = volumegui.add(volume, 'windowLow', volume.min,  volume.max);
  // var upperWindowController = volumegui.add(volume, 'windowHigh', volume.min,  volume.max);

  volumegui.open();

}

function add_mesh_gui(mesh,mesh_gui,load_flag,name){
      mesh_gui = gui.addFolder(name + ' mesh');
      var meshVisibleController = mesh_gui.add(mesh, 'visible');
      // var meshColorController = mesh_gui.addColor(mesh, 'color');

      mesh_gui.open();

      load_flag = false;
      // callbacks
      meshVisibleController.onChange(function (value) {
  
        if (!load_flag) {
  
          renderer.add(mesh);
  

          renderer.onShowtime = function () {
          };

          load_flag = true;
  
        }
  
      });

}

window.onload = function () {

  // create and initialize a 3D renderer
  renderer = new X.renderer3D();
  renderer.init();

  volume = new X.volume();
  volume.file = '../img/sample.nii.gz';
  volume.volumeRendering = true;
  volume.opacity = 0.05;
  volume.lowerThreshold = -600;
  renderer.add(volume);

  bone_mesh = new X.mesh();
  bone_mesh.file = '../img/bones.stl';
  bone_mesh.color = [1, 0.95, 0.75];
  bone_mesh.opacity = 1;
  bone_mesh.visible = false;

  surface_mesh = new X.mesh();
  surface_mesh.file = '../img/surface.stl';
  surface_mesh.color = [.5, 0.5, 0.5];
  surface_mesh.opacity = 1;
  surface_mesh.visible = false;

  bladder_mesh = new X.mesh();
  bladder_mesh.file = '../img/bladder.stl';
  bladder_mesh.color = [0, 0.1, 0.9];
  bladder_mesh.opacity = 1;
  bladder_mesh.visible = false;


  

  renderer.onShowtime = function () {
    add_gui();
    add_volume_gui();
    add_mesh_gui(surface_mesh,surface_mesh_gui,surface_load_flag,"Surface");
    add_mesh_gui(bone_mesh,bone_mesh_gui,bone_load_flag,"Bone");
    add_mesh_gui(bladder_mesh,bladder_mesh_gui,bladder_load_flag,"Swim Bladder");
    

  };

  renderer.camera.focus = [0,0,0];
  renderer.camera.o = new Float32Array([ -0.11675607413053513, -0.04434124007821083, -0.9921701550483704, 0, -0.02909557707607746, -0.9984213709831238, 0.048044800758361816, 0, -0.9927340149879456, 0.03447747603058815,0.11528141051530838, 0,0,0,-340,1 ]);

  renderer.render();

  
};
