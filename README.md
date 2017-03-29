# adcirc-render

A WebGL renderer and supporting tools for the visualization of ADCIRC data.

## API Reference

The adcirc-render library consists of three main types. First, a [renderer](#renderer) which knows how to communicate with the browser in order to draw things on the screen. Second, [geometries](#geometry), which describe *what* to draw. And third, [shaders](#shaders), which describe *how* to draw.

### Renderer

<a name="adcirc-gl-renderer" href="#adcirc-gl-renderer">#</a> *adcirc*.**gl_renderer**(*selection*)

Creates a new WebGL renderer. The *selection* parameter must be an HTML canvas element selected using d3.select(). Returns the new renderer object if WebGL is available, otherwise returns undefined.

<a name="renderer-add-view" href="#renderer-add-view">#</a> *gl_renderer*.**add_view**(*view*)

Adds the <a href="adcirc-view">view</a> to the renderer. The view is rendered each time the renderer updates. The renderer updates the projection matrix of the view's active shader in response to user interaction.

<a name="renderer-clear-color" href="#renderer-clear-color">#</a> *gl_renderer*.**clear_color**([*specifier*])

Gets or sets the background color of the rendering area. If getting, the color is returned as a d3.rgb(). The color can be set by passing in a color specifier, parsing as defined by <a href="https://github.com/d3/d3-color#rgb">d3.**rgb**()</a>.

<a name="renderer-gl-context" href="#renderer-gl-context">#</a> *gl_renderer*.**gl_context**()

Returns the WebGL rendering context.

<a name="renderer-remove-view" href="#renderer-remove-view">#</a> *gl_renderer*.**remove_view**(*view*)

Removes the <a href="adcirc-view">view</a> from the renderer. The view will no longer be rendered when the renderer updates.

<a name="renderer-render" href="#renderer-render">#</a> *gl_renderer*.**render**()

Requests that the renderer redraw all views. Note that this is a deferred render, and the actual rendering will happen when the next animation frame is available.

<a name="renderer-zoom-to" href="#renderer-zoom-to">#</a> *gl_renderer*.**zoom_to**(*item*)

Translates and zooms the renderer view to the bounding box of *item*, which must provide a `bounding_box()` method.

### Geometry

Geometries are used by adcirc-render to bridge the gap between how meshes are represented from the perspective of an ADCIRC modeler and how WebGL needs to organize and view data in order for it to be rendered properly.

<a name="adcirc-geometry" href="#adcirc-geometry">#</a> *adcirc*.**geometry**(*gl*, *mesh*)

Creates a new geometry. *gl* is a WebGL rendering context, *mesh* is a <a href="#adcirc-mesh">mesh</a>.

Upon creation of the geometry, the buffers needed for rendering will be created in the WebGL context, but only the vertex position and vertex normal buffers will be filled. The vertex positions (i.e. x- and y-coordinates) will be retrieved from the mesh, and the vertex normals will be generated to allow for single-pass wireframe rendering.

Geometries are rendered using [drawArrays](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays), so vertices are duplicated within the buffers (i.e. no indexed rendering). Geometry provides the [elemental_value](#geometry-elemental-value) and [nodal_value](#geometry-nodal-value) methods which perform the correct transfer of ADCIRC data (which is indexed) to the (non-indexed) buffers in the WebGL context.

The following buffers are used to render ADCIRC data:

* `position_buffer` - The x- and y- coordinates for each vertex (node)
* `value_buffer` - The 'z-value' for each vertex. Not necessarily a vertical elevation, rather this is the data field we are interested in displaying (e.g. elevation, depth, velocity, residual, etc.). This value is used by all shaders to color vertices.
* `normal_buffer` - This is a collection of ones and zeros that are generated by the geometry, and should never be changed. They provide the data necessary for the shader to perform [single-pass wireframe rendering](http://strattonbrazil.blogspot.com/2011/09/single-pass-wireframe-rendering_11.html).

<a name="geometry-bind-buffer" href="#geometry-bind-buffer">#</a> *geometry*.**bind_buffer**(*attribute*)

Binds the requested *attribute*, if it is available, and returns the bound buffer. Returns undefined if the *attribute* is not available.

The returned buffer is an object containing the following:

* `buffer`
* `size`
* `type`
* `normalized`
* `stride`
* `offset`

See [vertexAttribPointer](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer) documentation for description of each field. The buffer field is the WebGL array buffer.

<a name="geometry-bounding-box" href="#geometry-bounding-box">#</a> *geometry*.**bounding_box**()

Returns the bounding box of the mesh that the geometry is responsible for rendering.

<a name="geometry-draw-arrays" href="#geometry-draw-arrays">#</a> *geometry*.**draw_arrays**()

Performs rendering of the entire mesh. Simply calls [drawArrays](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays) with the appropriate parameters.

_**Note to self: this is where I should implement rendering of portions of meshes. WebGL drawArrays accepts a start index and count, so this function could take a list of [start, count, start, count, ...] to allow for drawing subsets**_

<a name="geometry-elemental-value" href="#geometry-elemental-value">#</a> *geometry*.**elemental_value**(*value*)

If the mesh contains the elemental value *value*, fills the vertex value buffer with the data associated with that value.

<a name="geometry-nodal-value" href="#geometry-nodal-value">#</a> *geometry*.**nodal_value**(*value*)

If the mesh contains the nodal value *value*, fills the vertex value buffer with the data associated with that value.

### Shaders

Shaders are used by adcirc-render to describe how a <a href="#adcirc-geometry">geometry</a> should be rendered. A number of methods are provided by every shader, while specific methods are provided by individual shaders based on functionality.

<a name="shader-attribute" href="#shader-attribute">#</a> *shader*.**attribute**(*attribute*)

If it exists, returns the specified shader attribute.

<a name="shader-attributes" href="#shader-attributes">#</a> *shader*.**attributes**([*callback*])

If callback is not specified, returns a list of attributes available to the shader. If *callback* is specified, it is called for each attribute available in the shader, passing the [attribute location](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getAttribLocation) and the attribute name as arguments.

Every shader will have the following attributes:

* 'vertex_normal'
* 'vertex_position'
* 'vertex_value'

<a name="shader-set-projection" href="#shader-set-projection">#</a> *shader*.**set_projection**(*matrix*)

Sets the projection matrix used to transform vertices. This should only every need to be called by the [renderer](#adcirc-gl-renderer) in order to provide interactivity.

<a name="shader-uniform" href="#shader-uniform">#</a> *shader*.**uniform**(*uniform*)

If it exists, returns the specified shader uniform.

<a name="shader-uniforms" href="#shader-uniforms">#</a> *shader*.**uniforms**()

Returns a list of all uniforms available to the shader.

All shaders will have the 'projection_matrix' uniform, and all shaders that provide wireframe rendering will have the following uniforms:

* 'wire_alpha'
* 'wire_color'
* 'wire_width'

<a name="shader-use" href="#shader-use">#</a> *shader*.**use**()

Instructs the rendering context to use the shader program for any subsequent rendering calls.

<a name="shader-wire-alpha" href="#shader-wire-alpha">#</a> *shader*.**wire_alpha**([*alpha*])

*Only available to shaders that provide wireframe rendering*

Returns the wire alpha, a value in the range [0, 1], if *alpha* is not provided. Sets the alpha value and returns the shader if *alpha* is provided.

<a name="shader-wire-color" href="#shader-wire-color">#</a> *shader*.**wire_color**([*color*])

*Only available to shaders that provide wireframe rendering*

Returns the wire color if *color* is not provided. Sets the wire color and returns the shader if *color* is provided.

<a name="shader-wire-width" href="#shader-wire-width">#</a> *shader*.**wire_width**([*width])

*Only available to shaders that provide wireframe rendering*

Return the wire width if *width* is not provided. Sets the wire width and returns the shader if *width* is provided.

#### Basic Shader

A basic shader renders a mesh a single color. Supports wireframe.

<a name="adcirc-basic-shader" href="#adcirc-basic-shader">#</a> *adcirc*.**basic_shader**(*gl*)

Creates a basic shader using the WebGL context *gl*.

<a name="basic-shader-face-color" href="#basic-shader-face-color">#</a> *basic_shader*.**face_color**([*color*])

Gets or sets the uniform color used to render the mesh.

#### Gradient Shader

A gradient shader renders a mesh using any number of colors, linearly interpolating between the colors using the values from the `value_buffer`. Supports wireframe.

<a name="adcirc-gradient-shader" href="#adcirc-gradient-shader">#</a> *adcirc*.**gradient_shader**(*gl*, *num_colors*[, *min*, *max*])

Creates a gradient shader with *num_colors* colors using the WebGL context *gl*. Gradient shaders must have at least two colors. By default, color stops are evenly spaced between 0 and 1 with colors from [d3.**schemeCategory20**](https://github.com/d3/d3-scale#schemeCategory20). To interpolate between stops other than 0 and 1, optionally pass in *min* and *max*.

<a name="gradient-shader-gradient-colors" href="#gradient-shader-gradient-colors">#</a> *gradient_shader*.**gradient_colors**([*colors*])

Gets or sets the gradient colors. The *colors* list must contain [d3.**rgb**()](https://github.com/d3/d3-color#rgb) colors, or objects that have `r`, `g`, and `b` properties. The *colors* list must have the correct number of colors, as defined when creating the gradient shader instance.

<a name="gradient-shader-gradient-stops" href="#gradient-shader-gradient-stops">#</a> *gradient_shader*.**gradient_stops**([*stops*])

Gets or sets the gradient stops. The *stops* list must contain the correct number of stops, as defined when creating the gradient shader instance.

### View

<a name="view-elemental-value" href="#view-elemental-value">#</a> *view*.**elemental_value**(*value*)

Instructs the geometry associated with this view to use the data associated with the elemental value *value*.

<a name="view-nodal-value" href="#view-nodal-value">#</a> *view*.**nodal_value**(*value*)

Instructs the geometry associated with this view to use the data associated with the nodal value *value*.

<a name="view-render" href="#view-render">#</a> *view*.**render**()

Renders the view.

<a name="view-shader" href="#view-shader">#</a> *view*.**shader**()

Returns the shader currently being used by the view.