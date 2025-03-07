import { GenericContainer, Network, Wait } from 'testcontainers';

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
      PG_CONNECTION_STRING: `postgres://postgres:marble@db/marble?sslmode=disable`,
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
      PG_CONNECTION_STRING: `postgres://postgres:marble@db/marble?sslmode=disable`,
      MARBLE_APP_URL: 'http://localhost:3000',
      FIREBASE_AUTH_EMULATOR_HOST: `firebase:9099`,
      GOOGLE_CLOUD_PROJECT: 'test-project',
      CREATE_GLOBAL_ADMIN_EMAIL: 'admin@checkmarble.com',
      CREATE_ORG_NAME: 'Zorg',
      CREATE_ORG_ADMIN_EMAIL: 'jbe@zorg.com',
      AUTHENTICATION_JWT_SIGNING_KEY:
        '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEAs+6r50m7qqLHHy7CvfmJPnAi+t/tubi7DPSM2jvA1etT1jEX\nrwbFbmooOu9LTgmjmxOq01p+XwkW1f7iPZViKrf7dEDEuqmpqYG9jPX4G/7xFcci\nGn1iSOiNx9awIKSYZa1wodlMCRM081DGqFNDMf1PScWIyM40nIwaGqLZht4HcOAq\nLbKDa15bxubBqZ9o/YnE1KmyBfq1tTnk0KzAb12Axt0xN4qB2zktsV/LLds+szMk\n/gRHjann1+fCZvxw1JzzRPtgeHLLYzn4ks3mwzy67RO3q/663KPZCsuYhlNCsMqp\n/HAbrF5PaihqzCZqLTDoIXXciCFFgwtLwm951wIDAQABAoIBAQCpb60tJX+1VYeQ\n06XK43rb8xjdiZUA+PYbYwZoUzBpwSq3Xo9g4E12hjzQEpqlJ+qKk+CfGm457AM3\nDMfbGhrRA2Oku4EGDdKYrnXikZVMN6yqx1RUAZJV+bfZYU+Fzbk8tjCEGG3DdfS8\n02nfBFkYb+MEIyGFhriAWmYSgxu4JTN0XRTyPqBytoSLqVCFbv0/yV2oJQDaXW08\nWAA8JtWhzqxACbFnPYe0hYUnrCA71t0v1P/N5uB4kKxI0tulGtW84noSyWA2LSdn\nJlKQW5WsyeMulGBMnIpj/OQJtQErupoITsh1TNi+6ffGgmuMCT1za70DHXVq9Ihu\nkpKBe0wRAoGBAOSarLfNvsS2lTH/8zPyhWBddCS5CfQAeUFLD5xWhQ7/6SenYzYY\n+oiiH2uL7d8grkobX5QLVvJ5ZXziYWoKgJe3SlrvRuNJZCAxvuynUCahhCT+chwW\nGz7ihXh3bGD0gtO6iogGBfrAkvRQnorkdSmVEZd1PsJV/lXp8LKgxJ91AoGBAMl+\ny/6NbzVHt9oQsrVrG/sCAOlqlfTt5KW6pI1WC4LoKBaGe+hy4emZ0G/M2feAJEPR\n92QrPRkVF5bVCjalJj42/7gQIl6r+DQ4+08gLB1MSpWua2M3UtEi/2gsMcQff/wg\n6kmNZObW5Jcnqpp6u72zQTQwF4H29XucV/Yw93abAoGADGvfIKmcSQIGv03CADuY\nRbEuQ2SOhuSTshmLApqs5jC/kXkF6gWXb18nx+c1iJ80+S/dlKS9F7XC7vM6CdIC\nRLwf3SsNNgJh32H0ltVMhJzYGk59EsuctWEHkZEjoW0HwstrBZMWNhbKpV3QD4n0\nV8sSxqEHRPX5ON/aRUp5BJUCgYEAlsymr2P6js2V80X7+Xqn/juJoyd6A0znioEd\nFgoHo3lMR09u/JC+Mq5DKOkPWAQ3H+rMU9NobpUyilf2xN7kuDtBNugcUO4zXCIp\nMxbI7URjrZJUHHUTLiIbNEOfG0DX8EJSFaoUkg7SFa5CKEsipt65Ne2oKkRBhLmF\nu2L6UXECgYBH1bpi0R6j7lIADtZtIJII/TezQbp+VK2R9qoNgkTnHoDjkRVR7v3m\n75wReMvTy1h0Qx/ROtStZz8d5uQuhdeJvbQPQR8KGFUFZDmVWxU+y15WI2H39FMA\nMireKxzCfGGtTsZnhDqYl9NuRPcAGYt5jvoERXlz7b69rkqQUrfy+Q==\n-----END RSA PRIVATE KEY-----',
      SEGMENT_WRITE_KEY: 'UgkImFmHmBZAWh5fxIKBY3QtvlcBrhqQ',
    })
    .withExposedPorts(8080)
    .withCommand(['-server'])
    .withWaitStrategy(Wait.forHttp('/liveness', 8080, { abortOnContainerExit: true }))
    .withDefaultLogDriver()
    .start();

  process.env['API_PORT'] = api.getFirstMappedPort().toString();
  process.env['FIREBASE_PORT'] = firebase.getFirstMappedPort().toString();

  process.on('exit', () => {
    api.stop();
    firebase.stop();
    db.stop();
    net.stop();
  });

  process.env['PW_SETUP_DONE'] = 'true';
}

export default globalSetup;
