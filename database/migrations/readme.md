# db-migrate Migration instructions

## column spec object fields:

```
type — the column data type. Supported types can be found below
length — the column data length, where supported
primaryKey — true to set the column as a primary key. Compound primary keys are supported by setting the primaryKey option to true on multiple columns
autoIncrement — true to mark the column as auto incrementing
notNull — true to mark the column as non-nullable, omit it archive database default behavior and false to mark explicitly as nullable
unique — true to add unique constraint to the column
defaultValue — set the column default value. To set an expression (eg a function call) as the default value use this syntax: defaultValue: new String(‘uuid_generate_v4()’)
foreignKey — set a foreign key to the column
```

## Supported column dataypes:

```
CHAR: 'char',
STRING: 'string',
TEXT: 'text',
SMALLINT: 'smallint',
BIGINT: 'bigint',
INTEGER: 'int',
SMALL_INTEGER: 'smallint',
BIG_INTEGER: 'bigint',
REAL: 'real',
DATE: 'date',
DATE_TIME: 'datetime',
TIME: 'time',
BLOB: 'blob',
TIMESTAMP: 'timestamp',
BINARY: 'binary',
BOOLEAN: 'boolean',
DECIMAL: 'decimal'
```

## Foreign Key Constraint Naming Conention

- Naming foreign keys should follow the following convention: `fk_<target_table>_<source_table>`
- Example: if the current table is `exercise` and the target table is `body_part` the foreign key constraint would be: `fk_body_part_exercise`
