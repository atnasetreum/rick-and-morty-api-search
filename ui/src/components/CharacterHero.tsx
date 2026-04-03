import Image from "next/image";
import { type Character as ApiCharacter } from "rickmortyapi";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import styles from "../app/page.module.css";

type Character = ApiCharacter;

type CharacterHeroProps = {
  selected: Character | null;
  isSingleExactMatch: boolean;
  canSelectPrevious: boolean;
  canSelectNext: boolean;
  onSelectAdjacent: (direction: "left" | "right") => void;
  statusBadgeText: string;
  isDeadStatus: boolean;
};

export function CharacterHero({
  selected,
  isSingleExactMatch,
  canSelectPrevious,
  canSelectNext,
  onSelectAdjacent,
  statusBadgeText,
  isDeadStatus,
}: CharacterHeroProps) {
  return (
    <section className={styles.leftPanel}>
      {selected ? (
        <>
          {!isSingleExactMatch ? (
            <>
              <button
                type="button"
                className={`${styles.mobileCharacterNav} ${styles.mobileCharacterNavLeft}`}
                onClick={() => onSelectAdjacent("left")}
                disabled={!canSelectPrevious}
                aria-label="Seleccionar personaje anterior"
              >
                <FiChevronLeft aria-hidden="true" />
              </button>

              <button
                type="button"
                className={`${styles.mobileCharacterNav} ${styles.mobileCharacterNavRight}`}
                onClick={() => onSelectAdjacent("right")}
                disabled={!canSelectNext}
                aria-label="Seleccionar siguiente personaje"
              >
                <FiChevronRight aria-hidden="true" />
              </button>
            </>
          ) : null}

          <div className={styles.liveBadge}>
            <span
              className={`${styles.liveDot} ${isDeadStatus ? styles.deadDot : ""}`}
            />
            {statusBadgeText}
          </div>

          <Image
            src={selected.image}
            alt={selected.name}
            fill
            priority
            className={styles.heroImage}
            sizes="(max-width: 980px) 100vw, 65vw"
          />

          <div className={styles.heroOverlay}>
            <h2 className={styles.heroName}>{selected.name}</h2>
            <p className={styles.heroMetaPrimary}>{selected.species}</p>
            <p className={styles.heroMetaSecondary}>
              {selected.type || selected.location.name}
            </p>

            <ul className={styles.stats}>
              <li>
                <span className={styles.statsLabel}>Origin</span>
                <span className={styles.statsValue}>{selected.origin.name}</span>
              </li>
              <li>
                <span className={styles.statsLabel}>Location</span>
                <span className={styles.statsValue}>{selected.location.name}</span>
              </li>
              <li>
                <span className={styles.statsLabel}>Gender</span>
                <span className={styles.statsValue}>{selected.gender}</span>
              </li>
              <li>
                <span className={styles.statsLabel}>Episodes</span>
                <span className={styles.statsValue}>{selected.episode.length}</span>
              </li>
            </ul>
          </div>
        </>
      ) : (
        <p className={styles.status}>No character selected</p>
      )}
    </section>
  );
}
