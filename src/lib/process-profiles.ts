/**
 * Default Process Profiles.
 * Each tenant starts with these and can customize/create new ones.
 *
 * Legacy equivalence: Papyrus' PROCESSINGQUEUE naming in trigger XML files.
 * Different queues mapped to different SLAs and post-processing routes.
 */

import type { ProcessProfile } from "./types"

export const DEFAULT_PROCESS_PROFILES: ProcessProfile[] = [
  {
    id: "profile-daily",
    name: "Diario",
    type: "daily",
    icon: "Moon",
    color: "green",
    priority: 3,
    slaMinutes: 480, // 8 hours (overnight batch)
    schedule: {
      mode: "batch",
      cron: "0 3 * * *",
    },
    pipelineSteps: [
      "Lectura de datos",
      "Validacion",
      "Clasificacion",
      "Conversion",
      "Aplicacion de template",
      "Aplicacion de diseno",
      "Generacion PDF",
      "Carta de presentacion",
      "Marcas OMR",
      "Validacion final",
    ],
    sendRuleIds: [],
    postprocessing: {
      envelopeConfigId: "env-standard-dl",
      printQueueId: "print-main",
      postalAgentId: "agent-correos",
    },
    notifications: {
      channel: "email",
      onComplete: ["operaciones@empresa.com"],
      onError: ["operaciones@empresa.com", "soporte@empresa.com"],
    },
    active: true,
    description: "Proceso nocturno estándar que corre a las 03:00. Pipeline completo con ensobrado y franqueo ordinario.",
  },
  {
    id: "profile-urgent",
    name: "Urgente",
    type: "urgent",
    icon: "Zap",
    color: "red",
    priority: 1,
    slaMinutes: 15,
    schedule: {
      mode: "immediate",
    },
    pipelineSteps: [
      "Lectura de datos",
      "Validacion",
      "Clasificacion",
      "Aplicacion de template",
      "Generacion PDF",
      "Validacion final",
    ],
    sendRuleIds: [],
    postprocessing: {
      printQueueId: "print-urgent",
      postalAgentId: "agent-mrw",
    },
    notifications: {
      channel: "both",
      onComplete: ["urgencias@empresa.com"],
      onError: ["urgencias@empresa.com", "cto@empresa.com"],
    },
    active: true,
    description: "Proceso inmediato con SLA de 15 minutos. Pipeline reducido, sin ensobrado (impresión directa). Envío urgente por MRW.",
  },
  {
    id: "profile-campaign",
    name: "Campaña",
    type: "campaign",
    icon: "Sparkles",
    color: "purple",
    priority: 4,
    slaMinutes: 2880, // 48 hours
    schedule: {
      mode: "scheduled",
    },
    pipelineSteps: [
      "Lectura de datos",
      "Validacion",
      "Segmentacion de audiencia",
      "Clasificacion",
      "Aplicacion de template",
      "Aplicacion de diseno",
      "Variantes A/B",
      "Generacion PDF",
      "Marcas tracking",
      "Validacion final",
    ],
    sendRuleIds: [],
    postprocessing: {
      envelopeConfigId: "env-campaign-c5",
      printQueueId: "print-color",
      postalAgentId: "agent-correos",
    },
    notifications: {
      channel: "email",
      onComplete: ["marketing@empresa.com"],
      onError: ["marketing@empresa.com"],
    },
    active: true,
    description: "Campañas estacionales (Navidad, renovaciones, promociones). Incluye A/B testing y tracking extra.",
  },
  {
    id: "profile-adhoc",
    name: "Ad-hoc",
    type: "adhoc",
    icon: "FileEdit",
    color: "blue",
    priority: 2,
    slaMinutes: 60,
    schedule: {
      mode: "immediate",
    },
    pipelineSteps: [
      "Lectura de datos",
      "Validacion",
      "Clasificacion",
      "Aplicacion de template",
      "Generacion PDF",
      "Validacion final",
    ],
    sendRuleIds: [],
    postprocessing: {
      envelopeConfigId: "env-standard-dl",
      printQueueId: "print-main",
    },
    notifications: {
      channel: "email",
    },
    active: true,
    description: "Procesos manuales puntuales: siniestros concretos, cartas ad-hoc, generaciones de prueba.",
  },
]

export function getProfileById(id: string): ProcessProfile | undefined {
  return DEFAULT_PROCESS_PROFILES.find((p) => p.id === id)
}

export function getProfileByType(type: ProcessProfile["type"]): ProcessProfile | undefined {
  return DEFAULT_PROCESS_PROFILES.find((p) => p.type === type)
}

/** Color classes for profile badges/cards, compatible with Tailwind */
export const PROFILE_COLOR_CLASSES: Record<string, { badge: string; card: string; icon: string }> = {
  red: {
    badge: "border-red-500/30 bg-red-500/10 text-red-500",
    card: "border-red-500/20 bg-red-500/5",
    icon: "text-red-500",
  },
  green: {
    badge: "border-green-500/30 bg-green-500/10 text-green-500",
    card: "border-green-500/20 bg-green-500/5",
    icon: "text-green-500",
  },
  blue: {
    badge: "border-blue-500/30 bg-blue-500/10 text-blue-500",
    card: "border-blue-500/20 bg-blue-500/5",
    icon: "text-blue-500",
  },
  purple: {
    badge: "border-purple-500/30 bg-purple-500/10 text-purple-500",
    card: "border-purple-500/20 bg-purple-500/5",
    icon: "text-purple-500",
  },
  yellow: {
    badge: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500",
    card: "border-yellow-500/20 bg-yellow-500/5",
    icon: "text-yellow-500",
  },
}
