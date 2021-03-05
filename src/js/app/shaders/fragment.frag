varying vec2 vUv;

uniform float time;
uniform float speed;
uniform float uvScale;
uniform int segment;
uniform sampler2D uSampler;
uniform sampler2D uSampler1;
uniform sampler2D uSampler2;
uniform sampler2D uSampler3;
uniform vec2 iResolution;

// uniform sampler2D noiseSampler;
// uniform sampler2D gridSampler;

#define REFLECTION_NUMBER 16

mat2 rot(in float a){
    return mat2(cos(a),-sin(a),
                sin(a),cos(a));
}

vec4 tex(in vec2 uv, in float time){
    float t = sin(time * .1) * .5 + .5;   
    float l = length(uv - .5);
    uv = (uv - .5) * rot(-time * .4 + (l * 1.3)) + .5;    
    uv.x += sin(time * .05 + .2);
    uv.y += cos(time * .025 + .4);
    
    return  mix(
        	mix( 
        	mix(texture2D(uSampler, uv),
                texture2D(uSampler1, uv * 1.5), clamp(0., t * 4., 1.)),
            	texture2D(uSampler2, uv * 1.5), clamp(0., t * 4. - 2., 1.)), 
            	texture2D(uSampler3, uv * 1.), clamp(0., t * 4. - 3., 1.));
}

vec4 tex2(in vec2 uv, in float time){
    float t = sin(time * .1) * .5 + .5;   
    float l = length(uv - .5);
    // uv = (uv - .5) * rot(-time * .4 + (l * 1.3)) + .5;    
    // uv.x += sin(time * .05 + .2);
    // uv.y += cos(time * .025 + .4);
    
    return  mix(
        	mix( 
        	mix(texture2D(uSampler, uv),
                texture2D(uSampler1, uv * 1.5), clamp(0., t * 4., 1.)),
            	texture2D(uSampler2, uv * 1.5), clamp(0., t * 4. - 2., 1.)), 
            	texture2D(uSampler3, uv * 1.), clamp(0., t * 4. - 3., 1.));
}

float random(vec2 uv)
{
	return fract(sin(dot(uv.xy, vec2(12.9898, 78.233))) * 43758.5453123);    
}

mat3 rotation(float angle)
{
	float c = cos(angle);
    float s = sin(angle);
    return mat3( c, -s, 0.,  s, c, 0.,  0., 0., 1.);
}

// #define MAX_ITERS 19

// #define LARGE_FLOAT 10000.0
// #define INTERSECT_DIST 0.001
// #define FEATHER_DIST .1
// #define SEQUENCE_LENGTH 24.0

// float easeIn(float t0, float t1, float t)
// {
// 	return 2.0*smoothstep(t0,2.*t1-t0,t);
// }

// float easeOut(float t0, float t1, float t)
// {
// 	float dt = t1 - t0;
// 	return 2.*(smoothstep(t0-dt,t1,t)-.5);
	
// 	//return max(0.,2.0*(smoothstep(t0,2.*t1-t0,t)-.5));
// }
// float filmDirt( vec2 pp, float time )
// {
// 	float aaRad = 0.1;
// 	vec2 nseLookup2 = pp + vec2(.5,.9) + time*100.;
// 	vec3 nse2 =
// 		texture2D(noiseSampler,.1*nseLookup2.xy,0.).xyz +
// 		texture2D(noiseSampler,.01*nseLookup2.xy,0.).xyz +
// 		texture2D(noiseSampler,.004*nseLookup2.xy+0.4,0.).xyz
// 		;
// 	float thresh = .4;
// 	float mul1 = smoothstep(thresh-aaRad,thresh+aaRad,nse2.x);
// 	float mul2 = smoothstep(thresh-aaRad,thresh+aaRad,nse2.y);
// 	float mul3 = smoothstep(thresh-aaRad,thresh+aaRad,nse2.z);
	
// 	float seed = texture2D(noiseSampler,vec2(time*.35,time),0.).x;
	
// 	// this makes the intensity of the overall image flicker 30%, and
// 	// gradually ramp up over the coarse of the sequence to further unsettle
// 	// the viewer
// 	float result = clamp(0.,1.,seed+.7) + .3*smoothstep(0.,SEQUENCE_LENGTH,time);
	
// 	// add even more intensity for the wide eyed moment before the exp
// 	result += .06*easeIn(19.2,19.4,time);

// 	float band = .05;
// 	if( 0.3 < seed && .3+band > seed )
// 		return mul1 * result;
// 	if( 0.6 < seed && .6+band > seed )
// 		return mul2 * result;
// 	if( 0.9 < seed && .9+band > seed )
// 		return mul3 * result;
// 	return result;
// }

void main()
{
    float iTime = time;
    vec2 fragCoord = vUv.xy * iResolution.xy;

    vec2 uv = (fragCoord/iResolution.y - iResolution.xy/iResolution.y*.5)*2.;
    uv *= uvScale;
    vec3 huv = vec3(uv, 0.);
    huv *= rotation(iTime*.2);
    
    vec3 axisOrigin = vec3(0., 0., 1.);
    vec3 axisDirection = vec3(normalize(vec2(1., 1.)), 0.);
    
    for(int i = 0; i < REFLECTION_NUMBER; i++)
    {
        float offset = (3.1415 * 2. / float(segment) ) * float(i);
        float axisRotation = offset;
    	vec3 tuv = (huv - axisOrigin) * rotation(-axisRotation);
    	if(tuv.y < 0.)
    	{
    		vec3 invuv = tuv;
        	invuv.y = -invuv.y;
        	invuv = (invuv * rotation(axisRotation)) + axisOrigin;
        	huv = invuv;
    	}
    }

    // vec3 col1 = vec3(texture2D(uSampler1, huv.xy - vec2(iTime *.2, 0.)));
    // vec3 col2 = vec3(texture2D(uSampler2, huv.xy - vec2(iTime *.2, 0.)));
    // vec3 col3 = vec3(texture2D(uSampler3, huv.xy - vec2(iTime *.2, 0.)));
    
    // vec3 col = vec3(texture2D(uSampler, huv.xy - vec2(iTime *.2, 0.) ));
    // vec3 col = (col1 + col2 + col3) / 3.0;
    // vec4 col = tex2(huv.xy - vec2(iTime *.2, 0.), iTime);
    vec4 col = tex(huv.xy, iTime);
    // col += texture2D(gridSampler, huv.xy);
    gl_FragColor = col;
    // gl_FragColor = col * filmDirt(huv.xy, iTime);
}