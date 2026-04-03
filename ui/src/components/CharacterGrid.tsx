import Image from "next/image";
import { type RefObject } from "react";
import { type Character as ApiCharacter } from "rickmortyapi";
import { FiChevronDown, FiChevronUp, FiHeart } from "react-icons/fi";
import styles from "../app/page.module.css";

type Character = ApiCharacter;

type CharacterGridProps = {
  characters: Character[];
  selectedId: number | null;
  favorites: number[];
  isSingleExactMatch: boolean;
  characterGridRef: RefObject<HTMLUListElement | null>;
  onScroll: (direction: "up" | "down") => void;
  onSelectCharacter: (character: Character) => void;
  onToggleFavorite: (characterId: number) => void;
};

export function CharacterGrid({
  characters,
  selectedId,
  favorites,
  isSingleExactMatch,
  characterGridRef,
  onScroll,
  onSelectCharacter,
  onToggleFavorite,
}: CharacterGridProps) {
  return (
    <>
      {!isSingleExactMatch ? (
        <button
          type="button"
          className={`${styles.scrollButton} ${styles.scrollButtonTop}`}
          onClick={() => onScroll("up")}
          aria-label="Scroll up"
        >
          <FiChevronUp aria-hidden="true" />
        </button>
      ) : null}

      <ul ref={characterGridRef} className={styles.characterGrid}>
        {characters.map((character) => {
          const isFavorite = favorites.includes(character.id);

          return (
            <li
              key={character.id}
              className={`${styles.characterCard} ${
                selectedId === character.id ? styles.activeCard : ""
              }`}
              onClick={() => onSelectCharacter(character)}
            >
              <h3 className={styles.cardName}>{character.name}</h3>
              <Image
                src={character.image}
                alt={character.name}
                width={132}
                height={132}
                className={styles.cardThumb}
              />
              <button
                type="button"
                className={`${styles.likeBtn} ${isFavorite ? styles.likeActive : ""}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleFavorite(character.id);
                }}
              >
                <FiHeart aria-hidden="true" />
                <span>Like</span>
              </button>
            </li>
          );
        })}
      </ul>

      {!isSingleExactMatch ? (
        <button
          type="button"
          className={`${styles.scrollButton} ${styles.scrollButtonBottom}`}
          onClick={() => onScroll("down")}
          aria-label="Scroll down"
        >
          <FiChevronDown aria-hidden="true" />
        </button>
      ) : null}
    </>
  );
}
