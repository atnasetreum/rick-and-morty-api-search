"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiHeart,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import { type Character as ApiCharacter } from "rickmortyapi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  loadFavoritesRequest,
  selectFavoriteIds,
  toggleFavoriteRequest,
} from "../store/favoritesSlice";
import {
  buildSelectedCharacterUrl,
  type SelectedCharacterPayload,
} from "../lib/jsonServer";
import {
  fetchCharacters,
  fetchFavoriteCharacters,
} from "../lib/rickmortyClient";
import styles from "./page.module.css";

type Character = ApiCharacter;
const SELECTED_CHARACTER_URL = buildSelectedCharacterUrl(
  process.env.NEXT_PUBLIC_JSON_SERVER_PORT,
);

async function loadSelectedCharacter(): Promise<SelectedCharacterPayload | null> {
  const response = await fetch(SELECTED_CHARACTER_URL);

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as SelectedCharacterPayload;
}

async function saveSelectedCharacter(
  character: Character | null,
): Promise<void> {
  await fetch(SELECTED_CHARACTER_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: 1,
      characterId: character?.id ?? null,
      character,
    }),
  });
}

export default function Home() {
  const dispatch = useAppDispatch();
  const [nameFilter, setNameFilter] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );
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
    const clearSelectedCharacter = async () => {
      try {
        setSelectedId(null);
        setSelectedCharacter(null);
        await saveSelectedCharacter(null);
      } catch {
        // If json-server is unavailable, the app keeps running with local state.
      }
    };

    void clearSelectedCharacter();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      const query = nameFilter.trim();
      const normalizedQuery = query.toLowerCase();

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchCharacters(query);
        const limitedData = data.slice(0, 8);
        setCharacters(limitedData);

        const exactSingleMatch =
          limitedData.length === 1 &&
          normalizedQuery.length > 0 &&
          limitedData[0].name.toLowerCase() === normalizedQuery;

        if (exactSingleMatch) {
          const [singleCharacter] = limitedData;
          setSelectedId(singleCharacter.id);
          setSelectedCharacter(singleCharacter);
          void saveSelectedCharacter(singleCharacter).catch(() => {
            // Ignore persistence failures to keep selection interaction responsive.
          });
          return;
        }

        const storedSelection = await loadSelectedCharacter();
        const storedCharacterId =
          storedSelection && typeof storedSelection.characterId === "number"
            ? storedSelection.characterId
            : null;

        if (
          storedCharacterId !== null &&
          limitedData.some((character) => character.id === storedCharacterId)
        ) {
          const matchedCharacter =
            limitedData.find(
              (character) => character.id === storedCharacterId,
            ) ?? null;
          setSelectedId(storedCharacterId);
          setSelectedCharacter(matchedCharacter);
        } else if (storedSelection?.character) {
          setSelectedId(storedSelection.character.id);
          setSelectedCharacter(storedSelection.character);
        } else {
          setSelectedId((current) => {
            if (current === null) {
              return null;
            }

            return limitedData.some((character) => character.id === current)
              ? current
              : null;
          });

          setSelectedCharacter((current) => {
            if (!current) {
              return null;
            }

            return (
              limitedData.find((character) => character.id === current.id) ??
              current
            );
          });
        }
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
    if (selectedCharacter) {
      return selectedCharacter;
    }

    if (!characters.length || selectedId === null) {
      return null;
    }

    return characters.find((character) => character.id === selectedId) ?? null;
  }, [characters, selectedCharacter, selectedId]);

  useEffect(() => {
    const loadFavoriteCharacters = async () => {
      if (!favorites.length) {
        setFavoriteCharacters([]);
        return;
      }

      try {
        const ordered = await fetchFavoriteCharacters(favorites);
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

  const handleSelectCharacter = (character: Character) => {
    setSelectedId(character.id);
    setSelectedCharacter(character);

    void saveSelectedCharacter(character).catch(() => {
      // Ignore persistence failures to keep selection interaction responsive.
    });
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

  const selectedListIndex = useMemo(() => {
    if (!selected) {
      return -1;
    }

    return characters.findIndex((character) => character.id === selected.id);
  }, [characters, selected]);

  const isSingleExactMatch = useMemo(() => {
    const query = nameFilter.trim().toLowerCase();

    if (!query || characters.length !== 1) {
      return false;
    }

    return characters[0].name.toLowerCase() === query;
  }, [characters, nameFilter]);

  const canSelectPrevious = selectedListIndex > 0;
  const canSelectNext =
    selectedListIndex !== -1 && selectedListIndex < characters.length - 1;

  const selectAdjacentCharacter = (direction: "left" | "right") => {
    if (!selected || selectedListIndex === -1) {
      return;
    }

    const nextIndex =
      direction === "left" ? selectedListIndex - 1 : selectedListIndex + 1;
    const nextCharacter = characters[nextIndex];

    if (!nextCharacter) {
      return;
    }

    handleSelectCharacter(nextCharacter);
  };

  return (
    <div className={styles.page}>
      <main className={styles.dashboard}>
        <section className={styles.leftPanel}>
          {selected ? (
            <>
              {!isSingleExactMatch ? (
                <>
                  <button
                    type="button"
                    className={`${styles.mobileCharacterNav} ${styles.mobileCharacterNavLeft}`}
                    onClick={() => selectAdjacentCharacter("left")}
                    disabled={!canSelectPrevious}
                    aria-label="Seleccionar personaje anterior"
                  >
                    <FiChevronLeft aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    className={`${styles.mobileCharacterNav} ${styles.mobileCharacterNavRight}`}
                    onClick={() => selectAdjacentCharacter("right")}
                    disabled={!canSelectNext}
                    aria-label="Seleccionar siguiente personaje"
                  >
                    <FiChevronRight aria-hidden="true" />
                  </button>
                </>
              ) : null}

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
              {!isSingleExactMatch ? (
                <button
                  type="button"
                  className={`${styles.scrollButton} ${styles.scrollButtonTop}`}
                  onClick={() => scrollCharacters("up")}
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
                        selected?.id === character.id ? styles.activeCard : ""
                      }`}
                      onClick={() => handleSelectCharacter(character)}
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

              {!isSingleExactMatch ? (
                <button
                  type="button"
                  className={`${styles.scrollButton} ${styles.scrollButtonBottom}`}
                  onClick={() => scrollCharacters("down")}
                  aria-label="Scroll down"
                >
                  <FiChevronDown aria-hidden="true" />
                </button>
              ) : null}

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
