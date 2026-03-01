/** Modal close transition duration in ms — keep in sync with CSS duration-300 */
export const MODAL_TRANSITION_MS = 300

/** Explicit stagger delay classes for animations (avoids dynamic interpolation) */
export const STAGGER_CLASSES = [
  "stagger-1",
  "stagger-2",
  "stagger-3",
  "stagger-4",
  "stagger-5",
] as const
