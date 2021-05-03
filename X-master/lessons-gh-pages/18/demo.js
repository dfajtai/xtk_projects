goog.require('X.renderer3D');
goog.require('X.renderer2D');
goog.require('X.volume');
window.onload = function() {

  //
  // try to create the 3D renderer
  //
  _webGLFriendly = true;
  try {
    // try to create and initialize a 3D renderer
    threeD = new X.renderer3D();
    threeD.container = '3d';
    threeD.init();
  } catch (Exception) {

    // no webgl on this machine
    _webGLFriendly = false;

  }

  //
  // create the 2D renderers
  // .. for the X orientation
  sliceX = new X.renderer2D();
  sliceX.container = 'sliceX';
  sliceX.orientation = 'X';
  sliceX.init();
  // .. for Y
  var sliceY = new X.renderer2D();
  sliceY.container = 'sliceY';
  sliceY.orientation = 'Y';
  sliceY.init();
  // .. and for Z
  var sliceZ = new X.renderer2D();
  sliceZ.container = 'sliceZ';
  sliceZ.orientation = 'Z';
  sliceZ.init();


  //
  // THE VOLUME DATA
  //
  // create a X.volume
  volume = new X.volume();
  // .. and attach the single-file dicom in .NRRD format
  // this works with gzip/gz/raw encoded NRRD files but XTK also supports other
  // formats like MGH/MGZ
  volume.file = 'vol.nii';
  // we also attach a label map to show segmentations on a slice-by-slice base

  // add the volume in the main renderer
  // we choose the sliceX here, since this should work also on
  // non-webGL-friendly devices like Safari on iOS
  sliceX.add(volume);

  // start the loading/rendering
  sliceX.render();


  //
  // THE GUI
  //
  // the onShowtime method gets executed after all files were fully loaded and
  // just before the first rendering attempt
  sliceX.onShowtime = function() {

    //
    // add the volume to the other 3 renderers
    //
    sliceY.add(volume);
    sliceY.render();
    sliceZ.add(volume);
    sliceZ.render();

    if (_webGLFriendly) {
      threeD.add(volume);
      threeD.render();
    }

    return;
    
    // now the real GUI
    var gui = new dat.GUI();

    // the following configures the gui for interacting with the X.volume
    var volumegui = gui.addFolder('Volume');
    // now we can configure controllers which..
    // .. switch between slicing and volume rendering
    var vrController = volumegui.add(volume, 'volumeRendering');
    // .. configure the volume rendering opacity
    var opacityController = volumegui.add(volume, 'opacity', 0, 1);
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
        volume.dimensions[0] - 1);
    var sliceYController = volumegui.add(volume, 'indexY', 0,
        volume.dimensions[1] - 1);
    var sliceZController = volumegui.add(volume, 'indexZ', 0,
        volume.dimensions[2] - 1);
    volumegui.open();

  };



  sliceX.interactor.onMouseMove = showIJKX;
  sliceX.onScroll = showIJKX;  
  sliceY.interactor.onMouseMove = showIJKY;
  sliceY.onScroll = showIJKY;  
  sliceZ.interactor.onMouseMove = showIJKZ;
  sliceZ.onScroll = showIJKZ;  
  
  
  function showIJKX(e) {showIJK(sliceX, 'X',e); }
  function showIJKY(e) {showIJK(sliceY, 'Y',e); }
  function showIJKZ(e) {showIJK(sliceZ, 'Z',e); }
    
  function showIJK(r, which,e) {
    
    var ijk = r.xy2ijk(r.interactor.mousePosition[0],
        r.interactor.mousePosition[1]);
    
    if (!ijk) {document.getElementById('info'+which).innerHTML = 'NA'; return;}
    
    if (e.shiftKey) {
      
      // propagate to slices
      if (r==sliceX) {
        
        volume.indexY = ijk[1];
        volume.indexZ = ijk[2];
        
      } else if (r==sliceY) {
        
        volume.indexX = ijk[0];
        volume.indexZ = ijk[2];
        
      } else if (r==sliceZ) {
        
        volume.indexX = ijk[0];
        volume.indexY = ijk[1];
        
      }
      
    }
    
      document.getElementById('info'+which).innerHTML = ijk;

  }


};

