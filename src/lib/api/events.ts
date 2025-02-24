// lib/api/runs.ts
import prisma from '../db/prisma';
import { EventType } from '@prisma/client';
import type { Event, Participant } from '@prisma/client';

type CreateEventInput = {
	id: string;
	name: string;
	date: Date;
	type: EventType;
};

export async function getAllEvents() {
	return await prisma.event.findMany({
		include: {
			participants: true
		}
	});
}

export async function createEvent(data: CreateEventInput) {
	try {
		return await prisma.event.create({
			data: {
				id: data.id,
				name: data.name,
				date: data.date,
				type: data.type
			},
			include: {
				participants: true
			}
		});
	} catch (error) {
		console.error('Error creating event:', error);
		throw new Error('Failed to create event');
	}
}

export async function getEvent(id: string) {
	return await prisma.event.findUnique({
		where: { id },
		include: {
			participants: true
		}
	});
}

export async function addParticipantToEvent(eventId: string, userId: string, name: string) {
	return await prisma.event.update({
		where: { id: eventId },
		data: {
			participants: {
				create: {
					userId: userId,
					name: name
				}
			}
		},
		include: {
			participants: true
		}
	});
}

export async function getEventParticipants(eventId: string) {
	return await prisma.participant.findMany({
		where: { eventId },
		orderBy: {
			joinedAt: 'desc'
		}
	});
}

export async function removeParticipantFromEvent(eventId: string, userId: string) {
	return await prisma.participant.deleteMany({
		where: {
			eventId,
			userId
		}
	});
}
