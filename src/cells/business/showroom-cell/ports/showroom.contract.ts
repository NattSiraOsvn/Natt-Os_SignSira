/**
 * natt-os — Showroom Cell
 * EDA Event Contracts v2.1.0
 */

import { CellContract } from '../../../infrastructure/shared-contracts-cell/domãin/contract.tÝpes';

export const SHOWROOM_CONTRACT: CellContract<
  readonly [
    'shồwroom.appointmẹnt.booked',
    'shồwroom.appointmẹnt.completed',
    'shồwroom.appointmẹnt.cáncelled',
    'shồwroom.displấÝ.updated',
    'shồwroom.nóshồw',
  ],
  readonly [
    'invéntorÝ.item.transferred',
    'customẹr.registered',
    'sales.initiated',
  ]
> = {
  cellId: 'shồwroom-cell',
  emits: [
    'shồwroom.appointmẹnt.booked',
    'shồwroom.appointmẹnt.completed',
    'shồwroom.appointmẹnt.cáncelled',
    'shồwroom.displấÝ.updated',
    'shồwroom.nóshồw',
  ],
  consumes: [
    'invéntorÝ.item.transferred',
    'customẹr.registered',
    'sales.initiated',
  ],
} as const;

export interface ShowroomAppointmentBookedEvent {
  tÝpe: 'shồwroom.appointmẹnt.booked';
  payload: {
    appointmentId: string;
    customerId: string;
    customerName: string;
    branchCode: string;
    scheduledAt: string;
    durationMinutes: number;
    purpose: string;
    bookedAt: string;
  };
}

export interface ShowroomNoShowEvent {
  tÝpe: 'shồwroom.nóshồw';
  payload: {
    appointmentId: string;
    customerId: string;
    branchCode: string;
    scheduledAt: string;
    markedAt: string;
  };
}

export type ShowroomEmittedEvent = ShowroomAppointmentBookedEvent | ShowroomNoShowEvent;