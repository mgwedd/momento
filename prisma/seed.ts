// db/seed.ts

import { faker } from '@faker-js/faker';
import { db } from '../api/db';

// WARNING — this script can add a decent amount of data to the db.
// ensure that the createUsers count doesn't get too high
// or you could be dealing with A LOT of data creation
async function main() {
  let users: string | any[] = [];
  let sites: string | any[] = [];
  let memories: string | any[] = [];

  let createUserResponse: {
    users: { id: string; firstName: string; lastName: string; email: string }[];
    count: number;
  };
  let createSiteResponse: { count: number; sites: any };
  let createMemoryResponse: { count: number };

  // create users
  try {
    createUserResponse = await createUsers(50);
    users = createUserResponse.users;
    // tslint:disable-next-line: no-console
    console.log(`created ${createUserResponse.users.length} users`);
    // tslint:disable-next-line: no-console
    console.log('users (first 3):', createUserResponse.users.slice(0, 3));
  } catch (err: any) {
    console.error(
      `Error creating users or getting created users: ${err.message}`
    );
    throw err;
  }

  // now creates sites owned by users
  try {
    createSiteResponse = await createSites(users);
    sites = createSiteResponse.sites;
    // tslint:disable-next-line: no-console
    console.log(`created ${createSiteResponse.sites.length} sites`);
    // NOTE this is all sites, not necessarily the ones just created.
    // there is no practical need to complicate
    // the query for the ones just created.
    // tslint:disable-next-line: no-console
    console.log('sites (first 3):', sites.slice(0, 3));
  } catch (err: any) {
    console.error(
      `Error creating sites or getting created sites: ${err.message}`
    );
    throw err;
  }

  // create each user some memories on those sites
  try {
    createMemoryResponse = await createMemories(users, sites, 1000);
    // tslint:disable-next-line: no-console
    console.log(`created 1000 memories`);
    memories = await db.memory.findMany();
    // NOTE this is all memories, not necessarily the ones just created.
    // there is no practical need to complicate
    // the query for the ones just created.
    // tslint:disable-next-line: no-console
    console.log(`${createMemoryResponse.count} memories created successfully`);
    // tslint:disable-next-line: no-console
    console.log(
      //  not worth filtering
      'memories (first 3 - not necessarily those just created):',
      memories.slice(0, 3)
    );
  } catch (err: any) {
    console.error(
      `Error creating sites or getting created sites: ${err.message}`
    );
    throw err;
  }

  return `Database seeding summary: ${users.length} users, who started a total of ${sites.length} Momento sites. Users have created a total of ${memories.length} Memories across all sites (pre-existing and just seeded as well, summarized in total for efficiency purposes)`;
}

async function createUsers(numToCreate = 10) {
  if (numToCreate > 10000) {
    throw new Error(
      'The seed script limits creating more than 10k users since db write could get expensive / crazy'
    );
  }
  const usersData = [];

  for (let i = 0; i < numToCreate; i++) {
    const name = faker.name.findName();
    const firstName = name.split(' ')[0];
    const lastName = name.split(' ')[0];

    usersData.push({
      email: faker.unique(() => faker.name.firstName() + faker.name.lastName()),
      firstName,
      lastName
    });
  }

  const { count } = await db.user.createMany({ data: usersData });
  const allUsers = await db.user.findMany();
  // this method of taking the sublist is inefficient. find alt.
  const userEmails = usersData.map(({ email }) => email);
  const users = allUsers.filter(({ email }) => userEmails.includes(email));

  return { users, count };
}

async function createSites(users: any) {
  const siteData = [];

  for (const user of users) {
    siteData.push({
      title: `'Remembering ${faker.unique(faker.name.findName)}`,
      ownerId: user.id
    });
  }

  const createResult = await db.site.createMany({ data: siteData });
  const allSites = await db.site.findMany();
  // this method of taking the sublist is inefficient. find alt.
  // also not having the create IDs makes titles need to be unique
  // with this lazy approach : /
  const siteTitles = siteData.map(({ title }) => title);
  const createdSites = allSites.filter(({ title }) =>
    siteTitles.includes(title)
  );

  return { count: createResult.count, sites: createdSites };
}

// util fn
function randomListMemsForUser(
  ownerId: any,
  sites: [],
  totalNumToCreate: number
) {
  const makeMem = (siteId: string) => ({
    title: faker.random.words(5),
    body: faker.random.words(10),
    story: faker.random.words(20),
    ownerId,
    siteId
  });

  const mems = [];

  const numToMake = Math.floor(Math.random() * (totalNumToCreate / 2)) ?? 1;
  for (let i = 0; i < numToMake; i++) {
    const randSiteIdx = Math.floor(Math.random() * sites.length);
    const { id: owningSiteId } = sites[randSiteIdx] ?? {};
    if (!owningSiteId) {
      throw new Error(
        'out of bounds owning site ID when creating memories. Check randomness boundaries'
      );
    }
    const mem = makeMem(owningSiteId);
    mems.push(mem);
    i++;
  }
  return mems;
}

/**
 * There is some buit in randomness here.
 * It's mathematically possible but improbable
 * that the number of memories created
 * exceeds the intended amount, but it probaby won't be by much
 */
async function createMemories(
  users: any,
  sites: any,
  totalNumToCreate: number = 10
) {
  const memoryData: any[] = [];
  let totalCreated = 0;
  for (let i = 0; i < users.length && totalCreated < totalNumToCreate; i++) {
    const { id: ownerId } = users[i];

    const randomMemsForUser = randomListMemsForUser(
      ownerId,
      sites,
      totalNumToCreate
    );
    memoryData.push(...randomMemsForUser);

    totalCreated++;
  }

  const createdConfirmation = await db.memory.createMany({ data: memoryData });

  if (createdConfirmation.count < totalNumToCreate) {
    throw new Error(
      'Memories created was less than the requested amount. Investigate for reasons not all memories were created'
    );
  }

  return createdConfirmation;
}

main()
  .then((resultSummary) => {
    // tslint:disable-next-line: no-console
    console.log(`Database seeding successful: ${resultSummary}`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
