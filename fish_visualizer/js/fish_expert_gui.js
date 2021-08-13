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

function add_mesh_expert_gui(mesh_name) {
  if (!mesh_dict.hasOwnProperty(mesh_name)) return;
  expert_gui.removeFolder(mesh_name + ' mesh');

  mesh_dict[mesh_name].gui = expert_gui.addFolder(mesh_name + ' mesh');
  var meshVisibleController = mesh_dict[mesh_name].gui.add(mesh_dict[mesh_name].mesh, 'visible');
  //var meshOpacityController = mesh_dict[mesh_name].gui.add(mesh_dict[mesh_name].mesh, 'opacity',0,1);

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

function add_volume_expert_gui(vol_name) {

  if (!vol_dict.hasOwnProperty(vol_name)) return;

  if (!vol_dict[vol_name].is_loaded) return;
  
  if (vol_dict[vol_name].current_level) level = vol_dict[vol_name].current_level;
  else level = vol_dict[vol_name].default_level;
  
  if (!vol_dict[vol_name].levels.hasOwnProperty(level)) return;

  level_info = vol_dict[vol_name].levels[level];

  if(level_info.hasOwnProperty("opacity")) vol_dict[vol_name].volume.opacity = level_info.opacity;
  if(level_info.hasOwnProperty("low_thr")) vol_dict[vol_name].volume.lowerThreshold = level_info.low_thr;
  if(level_info.hasOwnProperty("high_thr")) vol_dict[vol_name].volume.upperThreshold = level_info.high_thr;
  if(level_info.hasOwnProperty("window_low")) vol_dict[vol_name].volume.windowLow = level_info.window_low;
  if(level_info.hasOwnProperty("window_high")) vol_dict[vol_name].volume.windowHigh = level_info.window_high;


  volumegui = expert_gui.addFolder(vol_name + ' volume');
  var vController = volumegui.add(vol_dict[vol_name].volume, 'visible');
  var vrController = volumegui.add(vol_dict[vol_name].volume, 'volumeRendering');

  //var minColorController = volumegui.addColor(vol_dict[vol_name].volume, 'minColor');
  //var maxColorController = volumegui.addColor(vol_dict[vol_name].volume, 'maxColor');

  //var opacityController = volumegui.add(vol_dict[vol_name].volume, 'opacity', 0.01, 0.5).listen();
  var opacityController = volumegui.add(vol_dict[vol_name].volume, 'opacity', 0.01, 0.5).listen();

  var lowerThresholdController = volumegui.add(vol_dict[vol_name].volume, 'lowerThreshold',
    vol_dict[vol_name].volume.min, vol_dict[vol_name].volume.max);

  var upperThresholdController = volumegui.add(vol_dict[vol_name].volume, 'upperThreshold',
    vol_dict[vol_name].volume.min, vol_dict[vol_name].volume.max);

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


function update_expert_gui(target_vol_name, old_vol_name) {
  if (!vol_dict.hasOwnProperty(target_vol_name)) return;

  expert_gui.removeFolder(old_vol_name + ' volume');

  add_volume_expert_gui(target_vol_name);

  for (var mesh_name in mesh_dict) {
    add_mesh_expert_gui(mesh_name);
  }

}