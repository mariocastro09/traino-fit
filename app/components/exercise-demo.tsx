import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { photoUrl } from "~/lib/exercise-library";
import { cn } from "~/lib/utils";

/**
 * Two-photo demonstration of an exercise: start and end position, alternating.
 * `still` shows only the start position (for long lists). Without a photo, or
 * if it fails to load, a neutral placeholder keeps the layout.
 */
export function ExerciseDemo({
  image,
  name,
  still,
  className,
}: {
  image?: string | null;
  name: string;
  still?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!image || failed) {
    return (
      <span className={cn("flex items-center justify-center bg-zinc-800 text-zinc-600", className)} aria-hidden>
        <Dumbbell className="size-1/3" />
      </span>
    );
  }
  return (
    <span className={cn("relative block overflow-hidden bg-zinc-200", className)}>
      <img
        src={photoUrl(image, 0)}
        alt={`Cómo se hace: ${name}`}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className="size-full object-cover"
      />
      {!still && (
        <img
          src={photoUrl(image, 1)}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover animate-flip motion-reduce:hidden"
        />
      )}
    </span>
  );
}
