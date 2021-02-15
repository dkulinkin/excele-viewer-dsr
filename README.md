# Excel viewer
Implement an application rendering Excel data
(simple tables without formatting) from local user
files and supporting a complex filtering by queries.

### Table with test data
```
DSR Exemple Data.xlsx
```

### Examples of queries to filter
```
A=25
```
```
A=25 AND B=12
```

```
A=25 OR B=5
```

```
A LIKE "2"
```

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).



