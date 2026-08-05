import { Queue, QueueScheduler } from 'bullmq';
import Redis from './redis';

export const aiQueue = new Queue('ai-jobs', { connection: Redis });
export const aiQueueScheduler = new QueueScheduler('ai-jobs', { connection: Redis });
