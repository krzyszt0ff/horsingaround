// migrate-mongo-config.js

const config = {
  mongodb: {
    // URL do bazy – bierzemy z zmiennej środowiskowej MONGODB_URI
    // np. mongodb://127.0.0.1:27017/horsingaround-local
    url: process.env.MONGODB_URI,

    // Nazwa bazy – wpisujemy na sztywno, żeby nic nie splitować
    databaseName: 'horsingaround-local',

    // W nowych wersjach drivera Mongo NIE używamy useNewUrlParser / useUnifiedTopology
    options: {},
  },

  // Folder z migracjami
  migrationsDir: 'migrations',

  // Kolekcja, w której migrate-mongo trzyma historię migracji
  changelogCollectionName: 'changelog',

  // The value in seconds for the TTL index that will be used for the lock. Value of 0 will disable the lock.
  lockTtl: 0,

  // The file extension to create migrations and search for in migration dir
  migrationFileExtension: '.js',

  // Enable the algorithm to create a checksum of the file contents and use that in the comparison to d
  // if the file should be run. Requires that scripts are coded to be run multiple times.
  useFileHash: false,

  // Don't change this, unless you know what you're doing
  moduleSystem: 'module',
};

export default config;

