#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 reso;
uniform sampler2D noise_mat;

// ノイズ取得
float getNoise(vec2 p){
	p.x /= reso.x;
	p.y /= reso.y;
	p.y = 1.0 - p.y;
	vec4 col = texture2D(noise_mat, p).rgba;
	float req = 
		col.r / pow(255.0, 0.0) +
		col.g / pow(255.0, 1.0) +
		col.b / pow(255.0, 2.0) +
		col.a / pow(255.0, 3.0);
	return req;
}

void main(void){
	// ノイズ取得
	float noise = getNoise(gl_FragCoord.xy);

	gl_FragColor = vec4(vec3(noise), 1.0);
}
