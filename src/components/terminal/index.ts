// Terminal Components - Reusable VMS-style UI elements
// Layout: import TerminalLayout from '@layouts/TerminalLayout.astro';
// Components: import { Prompt, Output, Table, ... } from '@components/terminal';

// Primitives (from before)
export { default as Panel } from './Panel.astro';
export { default as ProgressBar } from './ProgressBar.astro';
export { default as StatusItem } from './StatusItem.astro';
export { default as ActivityItem } from './ActivityItem.astro';
export { default as StatCard } from './StatCard.astro';
export { default as CertBadge } from './CertBadge.astro';
export { default as ProjectItem } from './ProjectItem.astro';

// Terminal Chrome Components
export { default as Prompt } from './Prompt.astro';
export { default as Output } from './Output.astro';
export { default as Table } from './Table.astro';
export { default as TableRow } from './TableRow.astro';
export { default as Card } from './Card.astro';
export { default as CardGrid } from './CardGrid.astro';
export { default as StatusBar } from './StatusBar.astro';
export { default as CursorBlock } from './CursorBlock.astro';

// Layout Primitives (CSS borders, no ASCII)
export { default as Section } from './Section.astro';
export { default as BracketHeader } from './BracketHeader.astro';
export { default as Divider } from './Divider.astro';
