# Spelling corrector for special words

NOTE: this package is old and deprecated. Use the new [Mistyep](https://www.npmjs.com/package/mistyep) package instead.

---

[Check out the demo](http://petestreet.github.io/physical-keys-autocorrector/)

### Installation

`npm install special-speller`

### Explanation

I wouldn't presume to write a [full-fledged](http://norvig.com/spell-correct.html) spellling corrector when lots of great ones already exist.  This is for a more niche case &ndash; a rude, crude solution for checking against a bank of obscure or specialized words, or words that could easily be mis-typed.  Proper nouns, domain names, and Elvish are all valid use-cases, although at present this spelling corrector is case-insensitive.

It works by computing the edit distance between the input word and the words in the provided "dictionary".  But not just any edit distance. It takes into account the physical distances between keys on a keyboard by assigning each key a vector position.  The “physical edit distance” (as opposed to traditional Levenshtein distance) is a function of how physically far away each mistyped letter is.  As the word bank gets bigger there are bound to be more efficient ways to correct a word's spelling, but this does a fine job of checking off those “quick” and “dirty” boxes.

The JavaScript code is ported from the original Ruby version I wrote while interning at [Vouch](http://vouch.com), and is intended to be easy to plug into an existing site.  All you need to do is:

1. add the npm package, `npm install special-speller`
2. set a variable like so: `var speller = require('special-speller').specialSpeller`, and
3. get the corrected word like so: `var newWord = speller(oldWord, wordBankArray)`, where `oldWord` is a string and `wordBankArray` is the array of strings you want to check against. 
         
### Simple use case

In signup fields, there is a high percentage of users who mistype their email address when entering their information.  One way to fix this is by offering a "Did you mean ______?" suggestion if a word is close to a known email provider:

```
var speller = require('special-speller').specialSpeller;
// ...
var suggestion = speller(userEmailInput, ['gmail','hotmail','mail','aol','live','yahoo']);
if (suggestion != userEmailInput) {
    // throw the suggested word to the client
}
```

### In the wild

Check out the code on [Flipped Art's signup form](https://github.com/flippedart/flippedart_web/blob/master/imports/ui/accounts/accounts-templates.js), where we use the same instance of `speller` to check for questionable domain names and questionable TLDs.  [Try it out](https://www.flippedart.org/join) by typing `yourname@gnail.com` into the "email" field.
         
### Caveats

1. The present code doesn't account for capital letters, and by default converts everything to lowercase.
2. Accented/umlauted letters are in a similar boat with capital letters.  Likely the best option would be to build the PHYSICAL_KEYS object with alternate characters that have the same vector position as their non-accented counterparts.
3. The length-normalizing procedure at the top of physical_edit_distance() is dubious in certain cases.  Generally it isn't a problem for the end result, but it could result in some inconsistent behavior if you're trying.


