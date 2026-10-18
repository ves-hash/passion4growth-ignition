/** Keeps a client's onboarding answers while they move around the app. Demo only: nothing is saved. */
export const clientOnboardingMemory = {
  step: 0,
  marks: {} as Record<string, 'right' | 'wrong'>,
  files: {} as Record<string, string>,
  answers: {} as Record<string, string>,
};
