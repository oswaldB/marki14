# Console Output for /admin/configurations

URL: https://dev.markidiags.com/admin/configurations

Status: clear

## Console Logs:

```
Erreur lors du chargement des configurations: TypeError: Cannot read properties of undefined (reading 'get')
parseAxios instance initialized and available in window.parseAxios
[DOM] Input elements should have autocomplete attributes (suggested: "current-password"): (More info: https://goo.gl/9p2vKq) %o
Failed to load resource: the server responded with a status of 404 ()
```

## Recommendations:
- Investigate the 404 error to identify the missing resource.
- Fix the TypeError by ensuring the object is defined before accessing the 'get' property.
- Add autocomplete attributes to input elements for better accessibility.
