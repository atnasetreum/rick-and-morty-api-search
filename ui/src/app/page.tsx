"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  getCharacters as getCharactersFromClient,
  type Character as ApiCharacter,
  type Info,
} from "rickmortyapi";
import styles from "./page.module.css";

type Character = ApiCharacter;

async function getCharacters(query: string): Promise<Character[]> {
  const response = await getCharactersFromClient({
    name: query,
    page: 1,
  });

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
  const [quickFilter, setQuickFilter] = useState<"rick" | "morty">("rick");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const cached = window.localStorage.getItem("rm-favorites");
    if (!cached) {
      return;
    }

    try {
      setFavorites(JSON.parse(cached) as number[]);
    } catch {
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      const query = nameFilter.trim() || quickFilter;
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
  }, [nameFilter, quickFilter]);

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

  const toggleFavorite = (characterId: number) => {
    setFavorites((current) => {
      const next = current.includes(characterId)
        ? current.filter((id) => id !== characterId)
        : [...current, characterId];

      window.localStorage.setItem("rm-favorites", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.brand}>Rick and Morty</h1>

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
                  {selected.location.name}
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
            <span className={styles.searchIcon}>Q</span>
            <input
              className={styles.search}
              placeholder="Find your character..."
              value={nameFilter}
              onChange={(event) => setNameFilter(event.target.value)}
            />
          </div>

          <div className={styles.tabRow}>
            <button
              type="button"
              className={`${styles.tab} ${
                quickFilter === "rick" ? styles.tabActive : ""
              }`}
              onClick={() => setQuickFilter("rick")}
            >
              RICK
            </button>
            <button
              type="button"
              className={`${styles.tab} ${
                quickFilter === "morty" ? styles.tabActive : ""
              }`}
              onClick={() => setQuickFilter("morty")}
            >
              MORTY
            </button>
          </div>

          {isLoading ? (
            <p className={styles.status}>Loading characters...</p>
          ) : null}
          {error ? <p className={styles.error}>{error}</p> : null}

          {!isLoading && !error ? (
            <ul className={styles.characterGrid}>
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
                        toggleFavorite(character.id);
                      }}
                    >
                      {isFavorite ? "<3 Liked" : "<3 Like"}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </aside>
      </main>
    </div>
  );
}
