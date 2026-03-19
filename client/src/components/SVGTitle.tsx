"use client";

import React, { useEffect, useRef } from "react";
// anime.js v4 — svg.createDrawable lives on the `svg` namespace
import { animate, svg, stagger } from "animejs";

/* ─────────────────────────────────────────────────────────────────────────
 * Animates the company name like the anime.js createDrawable demo:
 *   draw: ['0 0', '0 1', '1 1']
 *   - '0 0'  → fully hidden (start position at 0, length 0)
 *   - '0 1'  → stroke drawn all the way across
 *   - '1 1'  → stroke erases from the left (reveal complete, then wipe)
 * ───────────────────────────────────────────────────────────────────────── */

export const SVGTitle = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const textRef = useRef<SVGTextElement>(null);

    useEffect(() => {
        const el = textRef.current;
        if (!el) return;

        // Create a drawable handle around the SVG element
        const drawable = svg.createDrawable(el);

        // Animate exactly like the demo — draw in, then wipe
        animate(drawable, {
            draw: ["0 0", "0 1", "1 1"],
            ease: "inOutQuad",
            duration: 2400,
            loop: true,
            delay: 200,
        });

        // Slide the SVG in on first load
        animate(svgRef.current!, {
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 700,
            ease: "outExpo",
        });
    }, []);

    return (
        <svg
            ref={svgRef}
            viewBox="0 0 920 96"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full max-w-4xl"
            style={{ overflow: "visible", opacity: 0 }}
            aria-label="AJU ED SOLUTIONS"
        >
            <defs>
                <linearGradient id="nameGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <filter id="glow" x="-10%" y="-40%" width="120%" height="180%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* The text starts transparent-fill with a glowing stroke.
          anime.js draws / erases the stroke via dashoffset. */}
            <text
                ref={textRef}
                x="460"
                y="78"
                textAnchor="middle"
                fontFamily="'Inter', 'Outfit', system-ui, sans-serif"
                fontWeight="900"
                fontSize="78"
                letterSpacing="4"
                fill="transparent"
                stroke="url(#nameGrad)"
                strokeWidth="1.4"
                filter="url(#glow)"
            >
                AJU ED SOLUTIONS
            </text>
        </svg>
    );
};
