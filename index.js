var _ = require('lodash');
var fs =require('fs');
var util = require('util');
var colors = require('colors');
var PostgresSchema = require('pg-json-schema-export');

var config = require('./config');

var author = config.comment.author;
var project = config.comment.project;
var description = config.comment.description;

var outputDir = config.outputDir;
var prefix = config.prefixModelName;

var modelSettings = config.modelSettings;

var connection = config.connection;

var commentTemplate = "" +
  "/** \n" +
    "* Generated by  : %s\n" +
    "* Project       : %s\n" +
    "* Model Name    : %s\n" +
    "* Date          : %s\n" +
    "* Description   : %s\n" +
    "* \n" +
  "**/\n\n\n";

var createModelFile = function(filename, data) {
  console.log('');
  console.log(('Writing model to a file...').bold.underline.white);

  var modelname = filename;
  filename = outputDir + '/' + prefix + filename + '.js';

  console.log(('Adding comment to the file.').yellow);

  fs.writeFileSync(filename, 
    util.format(commentTemplate, 
      author, 
      project, 
      modelname, 
      (new Date()).toISOString(),
      description
  ));

  console.log(('Adding model to the file.').yellow);

  fs.appendFileSync(filename, 'module.exports = ');
  fs.appendFileSync(filename, data);

  console.log('');
  console.log(('Model successfully written to a file.').white);
};

var dataTypeTranslation = function(typeName) {
  switch(typeName) {
    case 'double precision':
      return 'float';
      break;
    case 'character varying':
      return 'string';
      break;
    case 'text':
      return 'text';
      break;
    case 'integer': 
      return 'integer';
      break;
    case 'smallint': 
      return 'integer';
      break;
    case 'timestamp with time zone':
      return 'datetime';
      break;
    case 'timestamp without time zone':
      return 'datetime';
      break;
    default:
      return 'varchar';
  }
};

var buildTable = function(schemas) {
  var schemaTables = schemas.tables;
  var tables = _.keys(schemaTables);

  console.log('');
  console.log('Found '.yellow + (tables.length).toString().bold.white + ' table(s)'.yellow);

  tables.forEach(function(table, i) {

    console.log('');
    console.log(('Building waterline model for table: ' + table).bold.underline.white);
    
    var schemaTable = schemaTables[table];
    var tableColumns = schemaTable.columns;
    var model = {};
    model.tableName = table;
    model = _.assign(model, modelSettings);

    model.attributes = {};

    var columns = _.keys(tableColumns);
    
    console.log('Found '.yellow + (columns.length).toString().bold.white + ' column(s)'.yellow);
    console.log('');
    
    columns.forEach(function(column, j) {
      console.log(('Adding attribute: '.yellow + (column).bold.underline.white + ' to the table').blue);
      
      var tableColumn = tableColumns[column];
      
      console.log('Data Type: '.bold.red + (tableColumn.data_type).bold.white);
      console.log('Converted To: '.bold.red + (dataTypeTranslation(tableColumn.data_type)).bold.white);
      
      model.attributes[column] = {
        type: dataTypeTranslation(tableColumn.data_type),
        columnName: tableColumn.column_name
      }
    });

    console.log('');
    console.log(('Attributes successfuly added.').white);

    createModelFile(table, util.inspect(model, { showHidden: true, depth: 2 }));
    
    console.log('');
    console.log(('Waterline model succesfully built.').white);
  });
};


PostgresSchema.toJSON(connection, 'public')
.then(function(schemas) {
  console.log('');
  console.log('Process Starting ...'.bold.white);
  
  buildTable(schemas);
  
  console.log('');
  console.log('Process Completed ...'.bold.white);
  console.log('Press CTRL + C to exit.'.white);
})
.catch(function(error) {
  console.log('');
  console.log(('Found Error: ' + error).red);
});
