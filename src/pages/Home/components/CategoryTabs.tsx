import type { CategoryFilterItem, FilterCategoryId } from '../types';
import styles from './CategoryTabs.module.css';

interface CategoryTabsProps {
  readonly activeFilter: FilterCategoryId;
  readonly onFilterChange: (filter: FilterCategoryId) => void;
  readonly categories: readonly CategoryFilterItem[];
}

export function CategoryTabs({ activeFilter, onFilterChange, categories }: CategoryTabsProps) {
  return (
    <nav className={styles.tabsNav} aria-label="Kategori Mainan">
      <div className={styles.tabsList} role="tablist">
        {categories.map((category) => {
          const isActive = category.id === activeFilter;

          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${styles.tabButton} ${isActive ? styles.active : ''}`}
              onClick={() => onFilterChange(category.id)}
            >
              <span className={styles.emoji} aria-hidden="true">
                {category.emoji}
              </span>
              <span className={styles.label}>{category.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
