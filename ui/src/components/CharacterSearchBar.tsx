import { FiSearch } from "react-icons/fi";
import styles from "../app/page.module.css";

type CharacterSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CharacterSearchBar({
  value,
  onChange,
}: CharacterSearchBarProps) {
  return (
    <div className={styles.searchWrap}>
      <span className={styles.searchIcon}>
        <FiSearch aria-hidden="true" />
      </span>
      <input
        className={styles.search}
        placeholder="Find your character..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
