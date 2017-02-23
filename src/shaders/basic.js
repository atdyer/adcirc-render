import { gl_program } from '../gl_program'

function basic_vertex () {

    return [
        'attribute vec4 vertex_position;',
        'attribute vec4 vertex_color;',
        'varying lowp vec4 vert_color;',
        'uniform mat4 projection_matrix;',
        'uniform mat4 transformation_matrix;',
        'void main( void ) {',
        '   mat4 flip = mat4(mat2(1., 0., 0., -1.));',
        '   gl_Position = projection_matrix * transformation_matrix * vertex_position;',
        '   vert_color = vertex_color;',
        '}'
    ].join('\n');

}

function basic_fragment () {

    return [
        'varying lowp vec4 vert_color;',
        'void main( void ) {',
        '   gl_FragColor = vert_color;',
        '}'
    ].join('\n');

}

function basic_shader ( gl ) {

    var program = gl_program( gl, basic_vertex(), basic_fragment() );

    gl.useProgram( program );
    program.vertex_attrib = gl.getAttribLocation( program, 'vertex_position' );
    program.color_attrib = gl.getAttribLocation( program, 'vertex_color' );
    program.projection_matrix = gl.getUniformLocation( program, 'projection_matrix' );
    program.transformation_matrix = gl.getUniformLocation( program, 'transformation_matrix');
    gl.enableVertexAttribArray( program.vertex_attrib );
    gl.enableVertexAttribArray( program.color_attrib );

    return program;

}

export { basic_shader }