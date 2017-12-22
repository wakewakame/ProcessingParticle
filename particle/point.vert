#define PROCESSING_POINT_SHADER

uniform mat4 projection;
uniform mat4 transform;

attribute vec4 vertex;
attribute vec4 color;
attribute vec2 offset;

varying vec4 vertColor;

uniform vec2 mat_reso;
uniform vec2 scr_reso;
uniform sampler2D pos_mat;

// 座標取得
vec2 getPosition(vec2 p){
	p.x /= mat_reso.x;
	p.y /= mat_reso.y;
	vec4 col = texture2D(pos_mat, p).rgba;
	vec2 req = vec2(
		col.r / pow(255.0, 0.0) +
		col.g / pow(255.0, 1.0),
		col.b / pow(255.0, 0.0) +
		col.a / pow(255.0, 1.0)
	);
	return req;
}
// サイズ取得
float getSize(vec2 p){
	p.x /= mat_reso.x;
	p.y /= mat_reso.y;
	vec4 col = texture2D(pos_mat, p).rgba;
	float req = 
		col.r / pow(255.0, 0.0) +
		col.g / pow(255.0, 1.0) +
		col.b / pow(255.0, 2.0) +
		col.a / pow(255.0, 3.0);
	return req;
}

void main() {
	// samplerのインデックス取得(フラグメントシェーダのgl_FragCoordと等しい)
	vec4 index = vertex;

	// パーティクルの座標取得
	vec2 position = getPosition(index.xy + vec2(0.0, mat_reso.y / 2.0));
	position.x *= scr_reso.x;
	position.y *= scr_reso.y;

	// パーティクルのサイズ取得
	float size = getSize(index.xy);
	
	// 座標変換
	vec4 clip = transform * vec4(position, vertex.z, vertex.w);
	gl_Position = clip + projection * vec4(offset, 0, 0);

	// 色指定
	vec3 col1 = vec3(204.0, 52.0, 151.0) / 255.0;
	vec3 col2 = vec3(157.0, 20.0, 204.0) / 255.0;
	vertColor = vec4(col1 * size + col2 * (1.0 - size), size);
}