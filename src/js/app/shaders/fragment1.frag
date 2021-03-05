varying vec2 vUv;

uniform float iTime;
uniform sampler2D uSampler;
uniform vec2 iResolution;

void main()
{
    vec2 fragCoord = vUv.xy * iResolution.xy;

	vec2 p = fragCoord.xy - iResolution.xy * 0.5;
 	
    vec2 offset = vec2(iTime, iTime) * -4.0;
    
    float zoom = 1.0 + sin(iTime * 0.01) * 0.5;
    
    float r = length(p);
    float angle = atan(p.y, p.x);
    
    float slices = 6.0 + sin(iTime * 0.01) * 2.0;
    float slice = 6.28 / slices;
    
    angle = mod(angle, slice);
    angle = abs(angle - 0.5 * slice);
    angle += iTime * 0.1;
    
    p = vec2(cos(angle), sin(angle)) * r;
    
    gl_FragColor = texture2D(uSampler, (p + offset) / iResolution.xy * zoom);
    
    angle *= -1.0;
    
    p = vec2(cos(angle), sin(angle)) * r;
    
    gl_FragColor += texture2D(uSampler, (p + offset) / iResolution.xy * zoom) * 0.5;
}
