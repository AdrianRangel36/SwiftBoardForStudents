// ─────────────────────────────────────────────────────────────────────────────
// Barrel export — punto de entrada único para la capa de servicios.
//
// Uso:
//   import { authService, tasksService } from "@/services";
// ─────────────────────────────────────────────────────────────────────────────

export { authService } from "./auth.service";
export { tasksService } from "./tasks.service";
export { teamService } from "./team.service";
export { teamMembersService } from "./teamMembers.service";
