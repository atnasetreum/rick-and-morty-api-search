"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiHeart,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import {
  getCharacter as getCharacterFromClient,
  getCharacters as getCharactersFromClient,
  type Character as ApiCharacter,
  type Info,
} from "rickmortyapi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  loadFavoritesRequest,
  selectFavoriteIds,
  toggleFavoriteRequest,
} from "../store/favoritesSlice";
import styles from "./page.module.css";

type Character = ApiCharacter;

async function getCharacters(query?: string): Promise<Character[]> {
  const response = await getCharactersFromClient(
    query
      ? {
          name: query,
          page: 1,
        }
      : {
          page: 1,
        },
  );

  if (response.status === 404) {
    return [];
  }

  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusMessage || "Could not load characters");
  }

  const data = response.data as Info<Character[]>;
  return data.results ?? [];
}

export default function Home() {
  const dispatch = useAppDispatch();
  const [nameFilter, setNameFilter] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [favoriteCharacters, setFavoriteCharacters] = useState<Character[]>([]);
  const favorites = useAppSelector(selectFavoriteIds);
  const characterGridRef = useRef<HTMLUListElement | null>(null);
  const favoritesButtonRef = useRef<HTMLButtonElement | null>(null);
  const favoritesDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    dispatch(loadFavoritesRequest());
  }, [dispatch]);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      const query = nameFilter.trim();

      setIsLoading(true);
      setError(null);

      try {
        const data = await getCharacters(query);
        setCharacters(data.slice(0, 8));
        setSelectedId((current) => current ?? data[0]?.id ?? null);
      } catch (requestError) {
        setCharacters([]);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unexpected error",
        );
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [nameFilter]);

  const selected = useMemo(() => {
    if (!characters.length) {
      return null;
    }

    return (
      characters.find((character) => character.id === selectedId) ??
      characters[0] ??
      null
    );
  }, [characters, selectedId]);

  useEffect(() => {
    if (!selected && characters[0]) {
      setSelectedId(characters[0].id);
    }
  }, [characters, selected]);

  useEffect(() => {
    const loadFavoriteCharacters = async () => {
      if (!favorites.length) {
        setFavoriteCharacters([]);
        return;
      }

      try {
        const response = await getCharacterFromClient(
          favorites.length === 1 ? favorites[0] : favorites,
        );

        if (response.status < 200 || response.status >= 300) {
          setFavoriteCharacters([]);
          return;
        }

        const payload = response.data as Character | Character[];
        const list = Array.isArray(payload) ? payload : [payload];
        const ordered = favorites
          .map((favoriteId) =>
            list.find((character) => character.id === favoriteId),
          )
          .filter((character): character is Character => Boolean(character));

        setFavoriteCharacters(ordered);
      } catch {
        setFavoriteCharacters([]);
      }
    };

    void loadFavoriteCharacters();
  }, [favorites]);

  useEffect(() => {
    if (!isFavoritesOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;

      if (!target) {
        return;
      }

      const clickedInsideDropdown =
        favoritesDropdownRef.current?.contains(target) ?? false;
      const clickedToggleButton =
        favoritesButtonRef.current?.contains(target) ?? false;

      if (!clickedInsideDropdown && !clickedToggleButton) {
        setIsFavoritesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isFavoritesOpen]);

  const toggleFavorite = (characterId: number) => {
    dispatch(toggleFavoriteRequest(characterId));
  };

  const scrollCharacters = (direction: "up" | "down") => {
    if (!characterGridRef.current) {
      return;
    }

    characterGridRef.current.scrollBy({
      top: direction === "up" ? -240 : 240,
      behavior: "smooth",
    });
  };

  const { statusBadgeText, isDeadStatus } = useMemo(() => {
    const normalizedStatus = selected?.status?.toLowerCase();
    const isDead = normalizedStatus === "dead";
    const badgeText = isDead ? "MUERTO" : "VIVO";

    return {
      statusBadgeText: badgeText,
      isDeadStatus: isDead,
    };
  }, [selected?.status]);

  return (
    <div className={styles.page}>
      <main className={styles.dashboard}>
        <section className={styles.leftPanel}>
          {selected ? (
            <>
              <div className={styles.liveBadge}>
                <span
                  className={`${styles.liveDot} ${
                    isDeadStatus ? styles.deadDot : ""
                  }`}
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
                    <span className={styles.statsValue}>
                      {selected.origin.name}
                    </span>
                  </li>
                  <li>
                    <span className={styles.statsLabel}>Location</span>
                    <span className={styles.statsValue}>
                      {selected.location.name}
                    </span>
                  </li>
                  <li>
                    <span className={styles.statsLabel}>Gender</span>
                    <span className={styles.statsValue}>{selected.gender}</span>
                  </li>
                  <li>
                    <span className={styles.statsLabel}>Episodes</span>
                    <span className={styles.statsValue}>
                      {selected.episode.length}
                    </span>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <p className={styles.status}>No character selected</p>
          )}
        </section>

        <aside className={styles.rightPanel}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>
              <FiSearch aria-hidden="true" />
            </span>
            <input
              className={styles.search}
              placeholder="Find your character..."
              value={nameFilter}
              onChange={(event) => setNameFilter(event.target.value)}
            />
          </div>

          {isLoading ? (
            <p className={styles.status}>Loading characters...</p>
          ) : null}
          {error ? <p className={styles.error}>{error}</p> : null}

          {!isLoading && !error ? (
            <>
              <button
                type="button"
                className={`${styles.scrollButton} ${styles.scrollButtonTop}`}
                onClick={() => scrollCharacters("up")}
                aria-label="Scroll up"
              >
                <FiChevronUp aria-hidden="true" />
              </button>

              <ul ref={characterGridRef} className={styles.characterGrid}>
                {characters.map((character) => {
                  const isFavorite = favorites.includes(character.id);

                  return (
                    <li
                      key={character.id}
                      className={`${styles.characterCard} ${
                        selected?.id === character.id ? styles.activeCard : ""
                      }`}
                      onClick={() => setSelectedId(character.id)}
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
                        className={`${styles.likeBtn} ${
                          isFavorite ? styles.likeActive : ""
                        }`}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleFavorite(character.id);
                        }}
                      >
                        <FiHeart aria-hidden="true" />
                        <span>Like</span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                className={`${styles.scrollButton} ${styles.scrollButtonBottom}`}
                onClick={() => scrollCharacters("down")}
                aria-label="Scroll down"
              >
                <FiChevronDown aria-hidden="true" />
              </button>

              <button
                type="button"
                className={styles.favsButton}
                ref={favoritesButtonRef}
                onClick={() => setIsFavoritesOpen((current) => !current)}
              >
                FAVS
              </button>

              {isFavoritesOpen ? (
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
                            onClick={() => toggleFavorite(character.id)}
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
          ) : null}
        </aside>
      </main>
    </div>
  );
}
