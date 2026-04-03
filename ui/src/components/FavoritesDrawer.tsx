import { type RefObject } from "react";
import { type Character as ApiCharacter } from "rickmortyapi";
import { FiTrash2 } from "react-icons/fi";
import styles from "../app/page.module.css";

type Character = ApiCharacter;

type FavoritesDrawerProps = {
  isOpen: boolean;
  favoritesButtonRef: RefObject<HTMLButtonElement | null>;
  favoritesDropdownRef: RefObject<HTMLDivElement | null>;
  favoriteCharacters: Character[];
  onToggleOpen: () => void;
  onToggleFavorite: (characterId: number) => void;
};

export function FavoritesDrawer({
  isOpen,
  favoritesButtonRef,
  favoritesDropdownRef,
  favoriteCharacters,
  onToggleOpen,
  onToggleFavorite,
}: FavoritesDrawerProps) {
  return (
    <>
      <button
        type="button"
        className={styles.favsButton}
        ref={favoritesButtonRef}
        onClick={onToggleOpen}
      >
        FAVS
      </button>

      {isOpen ? (
        <div className={styles.favsDropdown} ref={favoritesDropdownRef}>
          <ul className={styles.favsList}>
            {favoriteCharacters.length ? (
              favoriteCharacters.map((character) => (
                <li key={character.id} className={styles.favsItem}>
                  <span className={styles.favsItemName}>
                    {character.name.toUpperCase()}
                  </span>
                  <button
                    type="button"
                    className={styles.favsRemoveButton}
                    onClick={() => onToggleFavorite(character.id)}
                    aria-label={`Quitar a ${character.name} de favoritos`}
                  >
                    <FiTrash2 aria-hidden="true" />
                  </button>
                </li>
              ))
            ) : (
              <li className={styles.favsItem}>SIN FAVORITOS</li>
            )}
          </ul>
        </div>
      ) : null}
    </>
  );
}
