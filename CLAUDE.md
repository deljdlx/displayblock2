# Instructions Claude — Projet Tower Defense (2td)

## Principe fondamental

> **La compréhensibilité du code > all**
>
> Un développeur noob doit pouvoir comprendre le code en le lisant.
> Chaque fichier doit être auto-explicatif. Privilégier la clarté à la concision.
---

## Conventions de code

### Style PHP8-like
```js
class MyClass {
    /**
     * @type {string}
     */
    _privateField;

    constructor(dependency) {
        this._privateField = null;
        this._dependency = dependency;
    }

    get privateField() {
        return this._privateField;
    }
}
```

### Nommage
- Classes : `PascalCase`
- Méthodes/variables : `camelCase`
- Propriétés privées : `_prefixUnderscore`
- Fichiers : `PascalCase.js` pour classes, `camelCase.js` pour utilitaires

### Commentaires obligatoires
1. **En-tête de fichier** : rôle du module
2. **Relations complexes** : schéma ASCII si nécessaire
3. **Pourquoi, pas quoi** : expliquer les décisions, pas paraphraser le code
4. **JSDoc** : pour chaque classe/méthode/propriété

### Diagrammes Mermaid
Toujours utiliser le thème clair avec cette directive en première ligne :
```
%%{init: {'theme': 'default'}}%%
```

---

## Vérification obligatoire

> **Après toute modification de fichier `.js`, lancer `npx eslint <fichiers modifiés>` et corriger les erreurs avant de considérer la tâche terminée.**

- Lancer ESLint sur chaque fichier JS créé ou modifié
- Les **erreurs** doivent être corrigées immédiatement
- Les **warnings** sur du code existant (non modifié) peuvent être ignorés

---
