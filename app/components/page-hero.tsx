import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

// Opening shot shared by the inner pages: footage behind a headline that
// rises out of a mask, the same entrance as the home hero.
export function PageHero({
  media,
  position = "center",
  eyebrow,
  title,
  subtitle,
  children,
}: {
  /** Base name of the clip and poster in /public, e.g. "page-clases" */
  media: string;
  /** Keeps the subject in frame on narrow screens */
  position?: string;
  eyebrow: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref);
  const reduceMotion = useReducedMotion();

  // The clip only plays while the hero is on screen.
  useEffect(() => {
    if (inView && !reduceMotion) video.current?.play().catch(() => {});
    else video.current?.pause();
  }, [inView, reduceMotion]);

  return (
    <header
      ref={ref}
      className="relative isolate overflow-hidden bg-black text-white min-h-[26rem] h-[58dvh] flex flex-col justify-end"
    >
      <div className="absolute inset-0 -z-10" aria-hidden>
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="metadata"
          poster={`/${media}.jpg`}
          className="size-full object-cover"
          style={{ objectPosition: position }}
        >
          <source src={`/${media}.mp4`} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-black/60 to-black/35" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 pb-10 sm:pb-14">
        <p className="eyebrow mb-4 animate-fade-up">{eyebrow}</p>
        <h1 className="font-display uppercase leading-[0.9] text-6xl sm:text-8xl lg:text-9xl">
          <span className="block overflow-hidden pt-[0.14em] -mt-[0.14em]">
            <span className="block animate-rise">{title}</span>
          </span>
        </h1>
        <p className="mt-5 text-base md:text-lg text-gray-200 max-w-2xl leading-relaxed animate-fade-up [animation-delay:350ms]">
          {subtitle}
        </p>
        {children && (
          <div className="mt-7 animate-fade-up [animation-delay:500ms]">{children}</div>
        )}
      </div>
    </header>
  );
}
