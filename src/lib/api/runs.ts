// lib/api/runs.ts
import prisma from '../db/prisma'
import type { Run, Participant } from '@prisma/client'

export async function getAllRuns() {
  return await prisma.run.findMany({
    include: {
      participants: true
    }
  })
}

export async function getRun(id: string) {
  return await prisma.run.findUnique({
    where: { id },
    include: {
      participants: true
    }
  })
}

export async function addParticipantToRun(runId: string, userId: string) {
  return await prisma.run.update({
    where: { id: runId },
    data: {
      participants: {
        create: {
          userId
        }
      }
    },
    include: {
      participants: true
    }
  })
}

export async function getRunParticipants(runId: string) {
  return await prisma.participant.findMany({
    where: { runId },
    orderBy: {
      joinedAt: 'desc'
    }
  })
}