# ajax-pages
jQuery knihovna pro ovládání webové stránky pomocí AJAX.

## Klíčové vlastnosti

- Označené odkazy načítá do zvoleného kontejneru.
- Formulářové prvky (`input[type=“text”], input[type=“radio”]`, `select`) reagují na změnu (`?name=value`) .
- Při změně filtru logicky odstraní klíč se stránkováním (nastavitelně).
- Mění aktuální URL v adresním řádku (pro možnost reloadu na konkrétní filtr).
- Trackuje každou stránku do Google Analytics.
- Podporuje historii (vzad i zpět).
- Mění dynamicky `<title>`.
- Zobrazení loading animace během načítání.
- API události (beforeLoading, afterLoading).

## Podpora
IE 10+, všechny klasické prohlížeče.

## Instalace
Do HTML přidáme cestu k jQuery a knihovně ajax-pages.min.js.

### Pomocí npm
Knihovnu můžeme nainstalovat do závislostí pomocí npm.
```
npm install ajax-pages --save
```
### Přímé stažení
Knihovnu si můžete stáhnout přímo z GitHubu. Soubor s knihovnou naleznete v cestě dist/ajax-pages.min.js.

Příklad:

```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<script src="../dist/ajax-pages.min.js"></script>
<script>
    $(document).ready(function() {
        ajaxPages();
    });
</script>
```

## Použití

### Odkazy
Kliknutí na všechny odkazy obsahující data atrtibut `data-link="ajax"` načte obsah stránky v atribugu `href=""` do kontejneru `<div id="content"></div>`. 
```html
<div id="content">
    <a href="link-to-another-page.html" data-link="ajax">Load page</a>
</div>
```

### Formuláře
Při změně v označeném formuláři se převedou hodnoty z formulářů do URL adresy ve formátu `?name=value`. Podporuje `input[type=“text”]`, `select`.
 
```html
<form data-link='ajax'>
    <input type="text" name="search" value="">
</form>
```

### Nastavení

| Vlastnost     | Popis    | Výchozí hodnota |
| --------|---------|-------|
| replaceSelector | Kontejner, do kterého se načítá obsah. | `'#content'` |
| searchSelector | Kontejner, ve kterém se hledá obsah načtené stránky. | `'#content'` |
| replaceMethod | 'replace' nahradí obsah kontejneru 'searchSelector'. 'append' vloží získaná data na konec kontejneru. | `'replace'` |
| loaderSelector | CSS selektor pro zobrazení loading animace.  | `'#loadingContent'` |
| linkSelector | CSS selektrok pro určení odkazů požadující AJAX načtení. | `"a[data-link='ajax']"` |
| formSelector | CSS selektrok pro určení formuláře požadující AJAX načtení. | `"form[data-link='ajax']"` |
| paginationKey | URL parametr obsahující stránkování, např. `?p=1`. | `"p"` |
| scrollTop | Po načtení stránky vyscrolluje na element `scrollTopSelector`.  | `true` |
| scrollTopSelector | Element, na který nascrolluje stránka po načtení. | `'#content'` |
| scrollTopDuration | Délka animce scrollování stránky. | `500` |
| enableAnalyticsTrack | Odesílání nově navštívené URL adresy do Google Analytics.  | `true` |
| enableUrlChange | Dynamické změnění URL v adresním řádku prohlížeče.  | `true` |
| changeTitle | Dynamické měnění TITLE v prohlížeči. | `true` |
| minLoadTime | Minimální čas loadingu - pozdrží vykreslení výsledku. | `0` |
| rootSelector  | CSS selektor, ve kterém funkce pracuje.  | `body`    |
| typingTimeout | Čas, po kterém se začne obsah načítat při přerušení psaní do `input`. | `500` |
| loadOnPopState | Při kroku zpět/vpřed v prohlížeči načítá znovu aktuální obsah stránky pomocí AJAX.  | `false` |

Příklad nastavení:

```javascript
ajaxPages({
    enableUrlChange: true,
    changeTitle: false
});
```

### Události
Callback funkce, volající se před začátkem načítání a po úspěšném načtení stránky.

```javascript
ajaxPages({
    beforeLoading: function () {
        //todo
    },
    afterLoading: function () {
        //todo
    }
});
```
Callback při chybě načtení stránky.

```javascript
ajaxPages({
    onError: function () {
        //todo
    }
});
```

## Google Analytics
Pokud je na webu použit měřící kód Google Analytics, při změně URL adresy se automaticky odesílá informace do Google Analytics o navštívené adrese. Využívá funkci `ga`.

## Loading animace
Pro přidání loading animace potřebujeme:
 - Přidat `<div id="loadingContent"><div class="spinner"></div></div>`.
 - Definovat CSS animaci pro třídu `spinner`. Příklad animace je ve složce `/demo/style.css`.
 
Příklad:

```html
<div id="content">
    <a href="link-to-another-page.html" data-link="ajax">Load page</a>
    <div id="loadingContent"><div class="spinner"></div></div>
</div>
```


## Ve vývoji
- Podpora multicheckboxů (pole do url ?key[]=)
- Umět určovat pořadí klíčů v URL pro lepší SEO
- Podpora pro hezké url jako je /skoda/octavia/benzin
- Testy
