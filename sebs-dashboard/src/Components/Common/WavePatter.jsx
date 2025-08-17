import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
// Note: DrawSVGPlugin requires a GSAP license
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(DrawSVGPlugin);

export default function WavePattern() {
  const svgRef = useRef();
  const wave1Ref = useRef();
  const wave2Ref = useRef();
  const wave3Ref = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const waves = [wave1Ref.current, wave2Ref.current, wave3Ref.current];
      
      // If you have DrawSVGPlugin license, uncomment these:
      gsap.set(waves, { drawSVG: "0%" });
      gsap.to(waves, {
        drawSVG: "100%",
        duration: 4,
        stagger: 0.7,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true
      });

      // Alternative animation using stroke-dasharray (free approach)
      waves.forEach((wave, index) => {
        if (wave) {
          const length = wave.getTotalLength();
          gsap.set(wave, {
            strokeDasharray: length,
            strokeDashoffset: length
          });
          
          gsap.to(wave, {
            strokeDashoffset: 0,
            duration: 4,
            delay: index * 0.7,
            ease: "power2.inOut",
            repeat: -1,
            yoyo: true
          });
        }
      });

      // Gentle floating animation for the entire SVG
      gsap.to(svgRef.current, {
        y: -15,
        duration: 6,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true
      });

      // Enhanced opacity pulse for better visibility
      gsap.to(waves, {
        opacity: 0.9,
        duration: 3,
        stagger: 0.4,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true
      });

    }, svgRef);

    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full min-w-screen min-h-screen"
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Wave 1 - Primary color, spans full viewport width */}
      <path
        ref={wave1Ref}
        d="M0 300 Q240 250 480 300 T960 300 Q1200 250 1440 300 T1920 300"
        stroke="#7dd3fc"
        strokeWidth="15"
        fill="none"
        opacity="0.8"
        strokeLinecap="round"
        filter="drop-shadow(0 3px 6px rgba(125, 211, 252, 0.4))"
      />
      
      {/* Wave 2 - Secondary color, enhanced */}
      <path
        ref={wave2Ref}
        d="M0 500 Q360 450 720 500 T1440 500 Q1680 450 1920 500"
        stroke="#f8bbd9"
        strokeWidth="12"
        fill="none"
        opacity="0.7"
        strokeLinecap="round"
        filter="drop-shadow(0 3px 6px rgba(248, 187, 217, 0.4))"
      />
      
      {/* Wave 3 - Accent color, more visible */}
      <path
        ref={wave3Ref}
        d="M0 700 Q180 650 360 700 T720 700 Q900 650 1080 700 T1440 700 Q1620 650 1800 700 T1920 700"
        stroke="#fb7185"
        strokeWidth="10"
        fill="none"
        opacity="0.6"
        strokeLinecap="round"
        filter="drop-shadow(0 3px 6px rgba(251, 113, 133, 0.4))"
      />

      {/* Enhanced floating elements with glow effect */}
      <circle cx="240" cy="200" r="8" fill="#7dd3fc" opacity="0.5" filter="drop-shadow(0 0 12px rgba(125, 211, 252, 0.5))">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 0,-20; 0,0"
          dur="4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.3; 0.8; 0.3"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
      
      <circle cx="960" cy="350" r="6" fill="#f8bbd9" opacity="0.6" filter="drop-shadow(0 0 10px rgba(248, 187, 217, 0.5))">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 0,-25; 0,0"
          dur="5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.4; 0.9; 0.4"
          dur="4s"
          repeatCount="indefinite"
        />
      </circle>
      
      <circle cx="1680" cy="550" r="10" fill="#fb7185" opacity="0.5" filter="drop-shadow(0 0 15px rgba(251, 113, 133, 0.5))">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 0,-15; 0,0"
          dur="6s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.3; 0.7; 0.3"
          dur="3.5s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Additional decorative elements for full screen coverage */}
      <path
        d="M0 150 Q480 120 960 150 T1920 150"
        stroke="#7dd3fc"
        strokeWidth="4"
        fill="none"
        opacity="0.3"
        strokeLinecap="round"
      />
      
      <path
        d="M0 900 Q720 870 1440 900 T1920 900"
        stroke="#f8bbd9"
        strokeWidth="6"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
      />

      {/* Additional waves for better coverage */}
      <path
        d="M0 50 Q320 20 640 50 T1280 50 Q1600 20 1920 50"
        stroke="#7dd3fc"
        strokeWidth="2"
        fill="none"
        opacity="0.2"
        strokeLinecap="round"
      />
      
      <path
        d="M0 1030 Q480 1000 960 1030 T1920 1030"
        stroke="#fb7185"
        strokeWidth="3"
        fill="none"
        opacity="0.25"
        strokeLinecap="round"
      />
    </svg>
  );
}
