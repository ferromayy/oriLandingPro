type Props = {
  soldOut: boolean;
  isLaunch: boolean;
  size?: "card" | "detail";
};

const sizeClass = {
  card: "px-2 py-1 text-[10px]",
  detail: "px-3 py-1 text-xs lg:left-8 lg:top-8",
} as const;

export function ProductBadges({
  soldOut,
  isLaunch,
  size = "card",
}: Props) {
  if (!soldOut && !isLaunch) return null;

  const badgeClass = sizeClass[size];
  const positionClass =
    size === "detail"
      ? "absolute left-6 top-6 z-10"
      : "absolute left-3 top-3 z-10";

  return (
    <div className={`${positionClass} flex flex-col items-start gap-2`}>
      {isLaunch && (
        <span
          className={`bg-gray-900 font-medium uppercase tracking-widest text-white ${badgeClass}`}
        >
          Lanzamiento
        </span>
      )}
      {soldOut && (
        <span
          className={`bg-black font-medium uppercase tracking-widest text-white ${badgeClass}`}
        >
          Sold Out
        </span>
      )}
    </div>
  );
}
