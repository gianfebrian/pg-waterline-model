module.exports = {
  comment: {
    author: 'Me',
    project: 'Project Name',
    description: ''
  },
  outputDir: 'dist',

  prefixModelName: 'pg_',

  modelSettings: {
    connection: 'PostgreSQLConnectionName',
    autoPK: false,
    autoCreatedAt: false,
    autoUpdatedAt: false
  },

  connection: {
    user: 'PGUser',
    password: 'PGPassword',
    host: 'PGHost',
    port: 5432,
    database: 'PGDatabase'
  }
}
