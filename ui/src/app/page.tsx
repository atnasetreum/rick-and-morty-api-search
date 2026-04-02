"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiChevronUp, FiHeart, FiSearch } from "react-icons/fi";
import {
  getCharacters as getCharactersFromClient,
  type Character as ApiCharacter,
  type Info,
} from "rickmortyapi";
import styles from "./page.module.css";

type Character = ApiCharacter;
type FavoriteRecord = { id: number; characterId: number };

const FAVORITES_API = "http://localhost:3001/favorites";

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
  const [nameFilter, setNameFilter] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const characterGridRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const response = await fetch(FAVORITES_API);

        if (!response.ok) {
          throw new Error("Could not load favorites");
        }

        const data = (await response.json()) as FavoriteRecord[];
        setFavorites(data.map((item) => item.characterId));
      } catch {
        setFavorites([]);
      }
    };

    void loadFavorites();
  }, []);

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

  const toggleFavorite = async (characterId: number) => {
    const isFavorite = favorites.includes(characterId);

    try {
      if (isFavorite) {
        const existingResponse = await fetch(
          `${FAVORITES_API}?characterId=${characterId}`,
        );

        if (!existingResponse.ok) {
          throw new Error("Could not remove favorite");
        }

        const existing = (await existingResponse.json()) as FavoriteRecord[];
        await Promise.all(
          existing.map((item) =>
            fetch(`${FAVORITES_API}/${item.id}`, {
              method: "DELETE",
            }),
          ),
        );
      } else {
        const createResponse = await fetch(FAVORITES_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ characterId }),
        });

        if (!createResponse.ok) {
          throw new Error("Could not add favorite");
        }
      }

      setFavorites((current) =>
        isFavorite
          ? current.filter((id) => id !== characterId)
          : [...current, characterId],
      );
    } catch {
      // Keep UI responsive even if mock API is not running.
    }
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

  return (
    <div className={styles.page}>
      <main className={styles.dashboard}>
        <section className={styles.leftPanel}>
          {selected ? (
            <>
              <div className={styles.liveBadge}>
                <span className={styles.liveDot} />
                LIVE
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
                      <img
                        src={character.image}
                        alt={character.name}
                        className={styles.cardThumb}
                      />
                      <button
                        type="button"
                        className={`${styles.likeBtn} ${
                          isFavorite ? styles.likeActive : ""
                        }`}
                        onClick={(event) => {
                          event.stopPropagation();
                          void toggleFavorite(character.id);
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

              <button type="button" className={styles.favsButton}>
                FAVS
              </button>
            </>
          ) : null}
        </aside>
      </main>
    </div>
  );
}
