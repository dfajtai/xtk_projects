# XTK related projects

## Fish visualizer

XTK based js library to visualize 3 dimensional,  fish images. (Sorry for my english knowledge.)

### Logic
* There are two volume representaton used  in this project:  
    * _volume_   - stored in nii.gz files
    * _mesh_ - stored in stl files
* These representations can be simultaneously visualized with the XTK library. A simple API was created for predefined and animated visualization of fishes.

#### volumes
* Every fish may have multiple _volumes_ (**CT**, T1, T2, ... ) - a.k.a. modality/sequence - stored in several different spatial resolution. The higher the resolution the more appealing the visual appearance - in the cost of speed.
* Due to performance issues only one volume can be visualized at one time.
* Each volume may have several visualization preset called *level*s. Different *levels*  defined to visualize different internal structures of the selected fish.
* Level presets, and the default resolution are defined in the **settings.json** file for every fish.
* Volumes can be visualized in two different visualization modes: *volume* and *slice* mode. Volume mode enables the volume rendering while slice mode disables the volume rendering and shows only one slice of the volume at one time.
* In *slice* mode there is possible to step along or start/stop/invert a looped animation between the slices along a given axis. 

#### meshes
* Every fish may have multiple _meshes_ (e.g surface, bladder, bone, etc.), every mesh are created to visaualize different segmentations on the selected fish.
* Mesh parameters are defined in the **params.json** file for every fish.

### API 
#### Functions
Short description of the main functions which are safe to call manually in runtime. **Functions that not appears in this table should not be used manually.**

function name | location | purpose
-|-|-
show_volume | fish_core.js | shows (and load) a volume at a given level with the selected rendering mode
hide_volume | fish_core.js | hides the current volume
show_mesh | fish_core.js | shows the given mesh
hide_mesh | fish_core.js | hides the given mesh
hide_all_mesh | fish_core.js | hides all meshes
reset_camera |  fish_core.js | resets the camera position
start_camera_rotation | fish_animation.js | starts the camera rotation animation
stop_camera_rotation | fish_animation.js | stops the camera rotation animation
start_slice_loop | fish_animation.js | starts the looped slice stepping  animation
stop_slice_loop  | fish_animation.js | stops the looped slice stepping  animation
set_animation | fish_animation.js |  simultaneously start/stop rotation/slicing animation
invert_camera_rotation | fish_rotate.js | inverts the direction of rotation
rotate_camera_next  | fish_rotate.js | shows the next step of the rotation
rotate_camera_previous  | fish_rotate.js | shows the previous step of the rotation
init_slice_mode | fish_slice.js | configures the slice mode - this function can be used to set the slicing axis
next_slice | fish_slice.js | shows the next step of the rotation
previous_slice | fish_slice.js | shows the previous step of the rotation


#### Controlling variables
The following variables can be modified in runtime (or in the html body) to customize the visualization to match the computing power and/or the display size at the presentation site.
**Variables that not appears in this table should not be altered manually.**

variable name | location | purpose
-|-|-
param_json_path | fish_core.js | the path of the params.json file
fish_settings.camera.default_distance | params.json | initial camera distance - **WARNING**  this variable greatly affects the performance
fish_settings.rotate.default_rotate_step | params.json | rotation animation "step size" - directly affects the rotation animation speed
current_rotate_step | fish_rotate.js | this variable can override the default variable stored int he json file - can be used for real-time animation speed modification
fish_settings.slice.default_axis | params.json | default axis of the slice visualization
fish_settings.slice.loop_step_size | params.json | slice animation "step size" - indirectly affects the slice looping animation speed
fish_settings.slice.loop_frame_delay | params.json | slice animation "step size" - directly affects the slice looping animation speed

### Code structure
* _js/_
    * fish_core.js
>contins  core functionalities for rendering, loading, control, parameters, etc
    * fish_rotate.js
> camera rotation functions (which mimincs the rotation of the fish) 
    * fish_slice.js
> slicing functions
    * fish_animation.js
> high level functions to start/stop rotation/slicing animations
    * fish_expert_gui.js
> expert gui for scene refinement and setup. this shuld be diesabled in the fianl product
* _index.html_
> blank html page with script imports and ID resolving

### Data storage logic
* xtk_fish_data/ (root data directory )
    * fish_id/ (f000, f004, etc. Every fish has a unique directory.)
        * mesh1.stl
        * mesh2. stl
        * ...
        * volume1.nii.gz
        * volume2.nii.gz
        * ...
        * **params.json**