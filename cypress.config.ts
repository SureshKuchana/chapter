import { execSync } from 'child_process';

import { defineConfig } from 'cypress';
import { config } from 'dotenv';
import coverage from '@cypress/code-coverage/task';

import { prisma } from './server/src/prisma';
import { InstanceRole } from './server/prisma/init/factories/instanceRoles.factory';

const getChapterMembers = (chapterId: number) =>
  prisma.chapter_users.findMany({
    where: { chapter_id: chapterId },
    include: { user: true },
  });

export type ChapterMembers = Awaited<ReturnType<typeof getChapterMembers>>;

const getEventUsers = (eventId: number) =>
  prisma.event_users.findMany({
    where: { event_id: eventId },
    include: { user: true, rsvp: true },
  });

export type EventUsers = Awaited<ReturnType<typeof getEventUsers>>;

const getUser = async (email: string) =>
  await prisma.users.findUnique({
    where: { email },
    include: { instance_role: true },
  });

export type User = Awaited<ReturnType<typeof getUser>>;

const promoteToOwner = async ({ email }: { email: string }) => {
  const name: InstanceRole['name'] = 'owner';
  return await prisma.users.update({
    where: { email },
    data: { instance_role: { connect: { name } } },
  });
};

const seedDb = () => execSync('node server/prisma/seed/seed.js');

config();

export default defineConfig({
  e2e: {
    projectId: 're65q6',
    baseUrl: 'http://localhost:3000',
    retries: { runMode: 3, openMode: 0 },
    setupNodeEvents(on, config) {
      // `on` is used to hook into various events Cypress emits
      // `config` is the resolved Cypress config

      config.env = config.env || {};
      // TODO: ideally the email address should have a common source (since it's
      // used in the db generator, too)

      config.env.SERVER_URL =
        process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
      config.env.GQL_URL = `${config.env.SERVER_URL}/graphql`;

      // This makes sure the db is populated before running any tests. Without this,
      // it's difficult (when running docker-compose up) to guarantee that both the
      // docker container is running and that the db has been seeded.
      on('before:run', () => {
        execSync('npm run db:reset');
      });

      on('task', {
        getChapterMembers,
        getEventUsers,
        getUser,
        seedDb,
        promoteToOwner,
      });
      coverage(on, config);
      return config;
    },
  },
  env: {
    mailHogUrl: 'http://localhost:8025',
    codeCoverage: {
      url: 'http://localhost:5000/__coverage__',
    },
  },
});
