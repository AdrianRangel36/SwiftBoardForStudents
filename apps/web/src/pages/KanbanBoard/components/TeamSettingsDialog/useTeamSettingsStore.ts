
import { create } from "zustand";
import type { TeamMember } from "@/interfaces";

interface TeamSettingsState {
  draftName: string;
  /** Mapa userId → role para cambios pendientes */
  draftRoles: Record<number, string>;
  draftDeletions: number[];
  inviteEmail: string;
  isLoading: boolean;
  isSaving: boolean;
}

interface TeamSettingsActions {
  initializeDraft: (teamName: string, members: TeamMember[]) => void;
  setDraftName: (name: string) => void;
  setDraftRole: (userId: number, role: string) => void;
  markForDeletion: (userId: number) => void;
  setInviteEmail: (email: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
}

export type TeamSettingsStore = TeamSettingsState & TeamSettingsActions;
const INITIAL_STATE: TeamSettingsState = {
  draftName: "",
  draftRoles: {},
  draftDeletions: [],
  inviteEmail: "",
  isLoading: false,
  isSaving: false,
};

export const useTeamSettingsStore = create<TeamSettingsStore>((set) => ({
  ...INITIAL_STATE,

  initializeDraft: (teamName, members) => {
    const initialRoles: Record<number, string> = {};
    members.forEach((m) => {
      initialRoles[m.userId] = m.role;
    });
    set({
      draftName: teamName,
      draftRoles: initialRoles,
      draftDeletions: [],
      inviteEmail: "",
    });
  },

  setDraftName: (draftName) => set({ draftName }),

  setDraftRole: (userId, role) =>
    set((state) => ({
      draftRoles: { ...state.draftRoles, [userId]: role },
    })),

  markForDeletion: (userId) =>
    set((state) => ({
      draftDeletions: state.draftDeletions.includes(userId)
        ? state.draftDeletions
        : [...state.draftDeletions, userId],
    })),

  setInviteEmail: (inviteEmail) => set({ inviteEmail }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsSaving: (isSaving) => set({ isSaving }),
}));

export const selectHasNameChanged = (
  draftName: string,
  originalName: string
): boolean => draftName.trim() !== "" && draftName !== originalName;

export const selectRolesToUpdate = (
  draftRoles: Record<number, string>,
  draftDeletions: number[],
  members: TeamMember[]
): TeamMember[] => {
  const deletionsSet = new Set(draftDeletions);
  return members.filter(
    (m) =>
      draftRoles[m.userId] !== undefined &&
      draftRoles[m.userId] !== m.role &&
      !deletionsSet.has(m.userId)
  );
};

export const selectHasUnsavedChanges = (
  draftName: string,
  draftRoles: Record<number, string>,
  draftDeletions: number[],
  teamName: string,
  members: TeamMember[]
): boolean => {
  const hasNameChanged = selectHasNameChanged(draftName, teamName);
  const rolesToUpdate = selectRolesToUpdate(draftRoles, draftDeletions, members);
  return hasNameChanged || rolesToUpdate.length > 0 || draftDeletions.length > 0;
};

export const selectVisibleMembers = (
  members: TeamMember[],
  draftDeletions: number[]
): TeamMember[] => {
  const deletionsSet = new Set(draftDeletions);
  return members.filter((m) => !deletionsSet.has(m.userId));
};
