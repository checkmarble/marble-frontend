import { GenericContainer, Network, Wait } from 'testcontainers';

import { setupFixtures } from './fixtures';

async function globalSetup() {
  if (process.env['PW_SETUP_DONE']) return;

  const net = await new Network().start();

  const db = await new GenericContainer('postgres:15')
    .withNetwork(net)
    .withNetworkAliases('db')
    .withEnvironment({
      POSTGRES_PASSWORD: 'marble',
      POSTGRES_DB: 'marble',
    })
    .withExposedPorts(5432)
    .withWaitStrategy(Wait.forListeningPorts())
    .withDefaultLogDriver()
    .start();

  const dsn = 'postgres://postgres:marble@db/marble?sslmode=disable';
  const externalDsn = `postgres://postgres:marble@${db.getIpAddress(net.getName())}/marble?sslmode=disable`;

  const firebase = await new GenericContainer(
    'europe-west1-docker.pkg.dev/marble-infra/marble/firebase-emulator:latest',
  )
    .withNetwork(net)
    .withNetworkAliases('firebase')
    .withExposedPorts(9099)
    .withWaitStrategy(Wait.forListeningPorts())
    .withDefaultLogDriver()
    .start();

  await new GenericContainer('europe-west1-docker.pkg.dev/marble-infra/marble/marble-backend')
    .withPlatform('linux/x86_64')
    .withNetwork(net)
    .withEnvironment({
      PG_CONNECTION_STRING: dsn,
    })
    .withCommand(['-migrations'])
    .withWaitStrategy(Wait.forLogMessage('successfully migrated'))
    .withDefaultLogDriver()
    .start();


  const api = await new GenericContainer(
    'europe-west1-docker.pkg.dev/marble-infra/marble/marble-backend',
  )
    .withPlatform('linux/x86_64')
    .withNetwork(net)
    .withNetworkAliases('api')
    .withEnvironment({
      PG_CONNECTION_STRING: dsn,
      MARBLE_APP_URL: 'http://localhost:3000',
      FIREBASE_AUTH_EMULATOR_HOST: `firebase:9099`,
      GOOGLE_CLOUD_PROJECT: 'test-project',
      CREATE_GLOBAL_ADMIN_EMAIL: 'admin@checkmarble.com',
      CREATE_ORG_NAME: 'Zorg',
      CREATE_ORG_ADMIN_EMAIL: 'jbe@zorg.com',
    })
    .withExposedPorts(8080)
    .withCommand(['-server'])
    .withWaitStrategy(Wait.forHttp('/liveness', 8080, { abortOnContainerExit: true }))
    .withDefaultLogDriver()
    .start();

    
  process.env['API_PORT'] = api.getFirstMappedPort().toString();
  process.env['FIREBASE_PORT'] = firebase.getFirstMappedPort().toString();

  await setupFixtures(externalDsn, process.env['API_PORT']);

  process.on('exit', async () => {
    await api.stop({ timeout: 1 });
    await firebase.stop({ timeout: 1 });
    await db.stop({ timeout: 1 });
    await net.stop();
  });

  process.env['PW_SETUP_DONE'] = 'true';
}

export default globalSetup;
