/**
 * Components Index
 * Central export point for all application components following atomic design principles
 * 
 * Structure:
 * - Atoms: Basic building blocks (Button, Text, Input, etc.)
 * - Molecules: Simple combinations of atoms (Card, FormField, ListItem, etc.)
 * - Organisms: Complex components composed of molecules and atoms
 * - Forms: Specialized form components
 * - Modals: Modal dialogs and overlays
 */

// Atoms - Basic building blocks
export * from './atoms';

// Molecules - Simple combinations of atoms
export * from './molecules';

// Organisms - Complex components
export * from './organisms';

// Forms - Specialized form components
export * from './form';

// Modals - Modal dialogs
export * from './modals';

// Re-export commonly used components for convenience
export { default as Button } from './atoms/Button/Button';
export { default as Text } from './atoms/Text/Text';
export { default as Input } from './atoms/Input/Input';
export { default as Card } from './molecules/Card/Card';
export { default as EmptyState } from './molecules/EmptyState/EmptyState';
export { default as ErrorBoundary } from './ErrorBoundary';
